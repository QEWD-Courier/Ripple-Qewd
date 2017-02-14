/**
 * Created by andrey.p on 15.06.2016.
 */
'use strict';

const fs = require('fs');
const https = require('https');
const server = https.createServer({
    key: fs.readFileSync('/home/ripple/ewd3/ssl/ssl.key'),
    cert: fs.readFileSync('/home/ripple/ewd3/ssl/ssl.crt')
});
server.listen(8070);

const io = require('socket.io').listen(server, {'pingTimeout': 20000, 'pingInterval': 10000});
const db = require('./lib/db');

const constants = require('./lib/constants');
const socketsList = constants.socketsList;
const usersList = constants.usersList;
const patientsWaitersList = constants.patientsWaitersList;
const appointmentsList = constants.appointmentsList;
const patientsList = constants.patientsList;

const User = require('./lib/userItem');
const Appointment = require('./lib/appointmentItem');

io.on('connection', function (socket) {
    socketsList[socket.id] = {};

    /**
     * Init user, when he connected to server
     * Create User instance or add socket id to an existing
     * Check started appointment
     */
    socket.on('user:init', (user) => {
        if (!socketsList[socket.id]) return;
        console.log('user:init', socket.id, user);
        socket.join(user.username);

        if (usersList[user.username]) {
            usersList[user.username].sid.push(socket.id);
        } else {
            usersList[user.username] = new User(user, socket.id);
        }

        socketsList[socket.id].user = usersList[user.username];

        if (usersList[user.username].isPatient()) {
            patientsList[user.username] = usersList[user.username];
            if (patientsWaitersList[user.nhsNumber]) {
                usersList[user.username].appointmentId = patientsWaitersList[user.nhsNumber];
                delete patientsWaitersList[user.nhsNumber];
                appointmentsList[usersList[user.username].appointmentId].users.patient = usersList[user.username];
                appointmentsList[usersList[user.username].appointmentId].updateAppointment('patient', usersList[user.username].getFullName());
            }
        }

        if (usersList[user.username].haveAppointment()) {
            socket.emit('appointment:init', {
                appointmentId: usersList[user.username].appointmentId
            });
        }
    });

    /**
     * Emit to client close notification
     */
    socket.on('window:focused', function () {
        if (!socketsList[socket.id] || !socketsList[socket.id].user) return;
        io.to(socketsList[socket.id].user.username).emit('notification:close');
    });

    /**
     * When doctor press start appointment, he emit 'appointment:init'
     * Create an appointment
     * Emit notification to opponents
     */
    socket.on('appointment:init', (data) => {
        if (!socketsList[socket.id] || !socketsList[socket.id].user) {
            console.log('user:error', 'event: appointment:init', socket.id);
            socket.emit('user:error', {message: 'Please, refresh the page', event: 'appointment:init'});
            return;
        }
        if (socketsList[socket.id].user.isPatient()) return;
        console.log('appointment:init', socket.id, data.appointmentId);
        const doctor = socketsList[socket.id].user;
        const nhsNumber = data.patientId;
        const appointmentId = data.appointmentId;
        let patient = null;
        for (let key of Object.keys(patientsList)) {
            if (patientsList[key].nhsNumber == nhsNumber) {
                patient = patientsList[key];
                break;
            }
        }

        appointmentsList[appointmentId] = appointmentsList[appointmentId] ||
            new Appointment(doctor, patient, nhsNumber, appointmentId);

        doctor.appointmentId = appointmentId;

        if (patient) {
            patient.appointmentId = appointmentId;
            io.to(patient.username).emit('appointment:init', {appointmentId});
            patient.getUniqueSocketsId(io.sockets.sockets).map((sid) => {
                io.to(sid).emit('notification:message', {title: `${doctor.getFullName()} has started an appointment`});
            });
        } else {
            patientsWaitersList[nhsNumber] = appointmentId;
        }
        io.to(doctor.username).emit('appointment:init', {appointmentId});
    });

    /**
     * Check appointment status (closed/open) from database
     */
    socket.on('appointment:status', (data) => {
        console.log('appointment:status', socket.id, data);
        db.getAppointment(data.appointmentId, function (err, appointment) {
            if (err) {
                console.error(err);
                return;
            }
            if (appointment.length) {
                socket.emit('appointment:status', {
                    isClosed: appointment[0].isClosed,
                    appointmentId: data.appointmentId
                });
            }
            else {
                console.log('No appointments are found!');
            }
        });
    });

    /**
     * Send appointment messages
     */
    socket.on('appointment:messages', (data) => {
        db.getAppointment(data.appointmentId, function (err, appointmentInfo) {
            if (err) {
                console.log(err);
                return;
            }
            db.getMessages(data.appointmentId, false, function (err, messages) {
                if (err) {
                    console.log(err);
                    return;
                }

                socket.emit('appointment:messages', {
                    appointment: appointmentInfo[0],
                    messages,
                    appointmentId: data.appointmentId
                });
            });
        });
    });

    /**
     * Appointment Call
     */

    /**
     * When user connect to appointment, he emit 'call:init'
     * Check is appointment exists
     * Close (close webrtc call) another users appointment windows
     * Send chat history, timestamp when appointment started, patient info,
     * add messages about connection to db, init webrtc call
     */
    socket.on('call:init', (data) => {
        console.log('call:init', socket.id, data);

        const appointmentId = data.appointmentId;
        const appointment = appointmentsList[appointmentId];
        const user = socketsList[socket.id].user;
        const userRole = user.getUserRole();

        console.log('[call:init] user:', user);


        if (!appointment || !appointment.isCorrectUser(user)) {
            console.log('User incorrect on call:init, user:', user, ', doctor:', appointment.users.doctor, ', patient:', appointment.users.patient);

            socket.emit('call:close');
            return;
        }

        if (appointment.noUsers || appointment.noUsersTimer){
            appointment.noUsers = null;
            clearTimeout(appointment.noUsersTimer);
        }

        let opponent = appointment.getOpponentSocketIdByUser(user);

        if (appointment.sid[userRole] && opponent) {
            io.to(appointment.sid[userRole]).emit('call:busy');
            appointment.addMessage(null, `${socketsList[socket.id].user.getFullName()} has left the chat room`, Date.now());
            io.to(opponent).emit('call:opponent:left', {
                timestamp: Date.now(),
                message: user.getFullName()
            });
        }

        appointment.addMessage(null, `${socketsList[socket.id].user.getFullName()} has entered the chat room`, Date.now());

        appointment.getAppointment(function (err, appointmentInfo) {
            if (err) {
                console.log(err);
                return;
            }
            appointment.getMessages(true, function (err, messages) {
                if (err) {
                    console.log(err);
                    return;
                }
                socket.emit('call:text:messages:history', {appointment: appointmentInfo[0], messages});
            });
        });

        socket.emit('call:getPatientInfo', {
            patientId: appointment.data.patientId
        });

        appointment.sid[userRole] = socket.id;

        socket.emit('call:timer', {
            timestamp: appointment.created
        });

        if (!appointment.getOpponentSocketId(socket.id) && appointment.getOpponent(socket.id)) {
            appointment.getOpponent(socket.id).getUniqueSocketsId(io.sockets.sockets).map((sid) => {
                io.to(sid).emit('notification:message', {title: `${user.getFullName()} has entered the chat room`});
            });
        }

        io.to(opponent).emit('call:opponent:join', {
            timestamp: Date.now(),
            message: user.getFullName()
        });

        console.log('[call:init]: before possible return');

        if (appointment.timer !== null) {
            socket.emit('call:close', {
                timestamp: appointment.ended,
                created_at: appointment.created,
            });
            return;
        }

        console.log('[call:init]: after possible return', appointment.sid);

        if (appointment.sid.doctor && appointment.sid.patient) {
            io.to(appointment.sid.doctor).emit('call:webrtc:init', {isInitiator: true});
            io.to(appointment.sid.patient).emit('call:webrtc:init', {isInitiator: false});
        }
    });

    /**
     * Emit event to get remote stream properties
     */
    socket.on('call:remoteStreamProp:get', (data) => {
        const appointment = appointmentsList[data.appointmentId];
        if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;

        io.to(appointment.getOpponentSocketId(socket.id)).emit('call:remoteStreamProp:get');
    });

    /**
     * Send remote stream properties to opponent
     */
    socket.on('call:remoteStreamProp:post', (data) => {
        const appointment = appointmentsList[data.appointmentId];
        if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;

        io.to(appointment.getOpponentSocketId(socket.id)).emit('call:remoteStreamProp:post', {remoteStreamProp: data.remoteStreamProp});
    });

    /**
     * Emit to opponent toggle video stream
     * when user turn on/off his video stream
     */
    socket.on('call:video:toggle', (data) => {
        const appointment = appointmentsList[data.appointmentId];
        if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;

        io.to(appointment.getOpponentSocketId(socket.id)).emit('call:video:toggle');
    });

    /**
     * Emit to opponent toggle audio stream
     * when user turn on/off his audio stream
     */
    socket.on('call:audio:toggle', (data) => {
        const appointment = appointmentsList[data.appointmentId];
        if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;

        io.to(appointment.getOpponentSocketId(socket.id)).emit('call:audio:toggle');
    });

    /**
     * Restart call when user press restart call button
     * Clear end call timer, init webrtc call
     */
    socket.on('call:restart', (data) => {
        console.log('call:restart', socket.id, data);
        const appointmentId = data.appointmentId;
        const appointment = appointmentsList[appointmentId];
        if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;

        clearTimeout(appointment.timer);
        appointment.timer = null;
        // have restarted the appointment
        io.to(appointment.sid.patient).emit('call:restart', {
            timestamp: Date.now(),
            created_at: appointment.created,
            user: socketsList[socket.id].user.getFullName()
        });
        io.to(appointment.sid.doctor).emit('call:restart', {
            timestamp: Date.now(),
            created_at: appointment.created,
            user: socketsList[socket.id].user.getFullName()
        });

        io.to(appointment.sid.doctor).emit('call:webrtc:init', {isInitiator: true});
        io.to(appointment.sid.patient).emit('call:webrtc:init', {isInitiator: false});

        appointment.addMessage(null, `${socketsList[socket.id].user.getFullName()} has restarted the appointment`, Date.now());

        if (!appointment.getOpponentSocketId(socket.id) && appointment.getOpponent(socket.id)) {
            appointment.getOpponent(socket.id).getUniqueSocketsId(io.sockets.sockets).map((sid) => {
                io.to(sid).emit('notification:message', {title: `${socketsList[socket.id].user.getFullName()} has restarted the appointment`});
            });
        }

        if (appointment.users.patient) {
            io.to(appointment.users.patient.username).emit('appointment:restart', {appointmentId});
        }
        io.to(appointment.users.doctor.username).emit('appointment:restart', {appointmentId});
    });

    /**
     * Close call when user press end call button
     * Create end call timer
     */
    socket.on('call:close', (data) => {
        console.log('call:close', socket.id, data);
        const appointmentId = data.appointmentId;
        const appointment = appointmentsList[appointmentId];
        if (!appointment || !appointment.isCorrectSocketId(socket.id) || appointment.timer !== null) return;

        appointment.ended = Date.now();

        io.to(appointment.sid.patient).emit('call:close', {
            timestamp: appointment.ended,
            created_at: appointment.created,
            user: socketsList[socket.id].user.getFullName()
        });
        io.to(appointment.sid.doctor).emit('call:close', {
            timestamp: appointment.ended,
            created_at: appointment.created,
            user: socketsList[socket.id].user.getFullName()
        });

        appointment.addMessage(null, `${socketsList[socket.id].user.getFullName()} has ended the conversation`, Date.now());

        if (!appointment.getOpponentSocketId(socket.id) && appointment.getOpponent(socket.id)) {
            appointment.getOpponent(socket.id).getUniqueSocketsId(io.sockets.sockets).map((sid) => {
                io.to(sid).emit('notification:message', {title: `${socketsList[socket.id].user.getFullName()} has end the conversation`});
            });
        }

        appointment.timer = setTimeout(() => {
            console.log('call:close:closed', socket.id, data);
            if (appointment.users.patient) {
                appointment.users.patient.appointmentId = null;
            }
            appointment.users.doctor.appointmentId = null;

            appointment.closeAppointment();

            if (appointment.users.patient) {
                io.to(appointment.users.patient.username).emit('appointment:close', {appointmentId});
            }
            io.to(appointment.users.doctor.username).emit('appointment:close', {appointmentId});

            delete appointmentsList[appointmentId];
        }, 60 * 1000); // 1 minute
    });

    /**
     * Redirect webrtc messages to opponent
     */
    socket.on('call:webrtc:message', (data) => {
        const appointment = appointmentsList[data.appointmentId];
        if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;

        io.to(appointment.getOpponentSocketId(socket.id)).emit('call:webrtc:message', data.message);
    });

    /**
     * Send text messages
     */
    socket.on('call:text:message', (data) => {
        const appointment = appointmentsList[data.appointmentId];
        if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;
        const author = socketsList[socket.id].user.getFullName();
        const timestamp = Date.now();
        appointment.addMessage(socketsList[socket.id].user.getUserRole(), data.message, timestamp);

        io.to(appointment.getOpponentSocketId(socket.id)).emit('call:text:message', {
            message: data.message,
            author,
            timestamp
        });
        io.to(socket.id).emit('call:text:message', {
            message: data.message,
            author: 'You',
            timestamp
        });

        if (!appointment.getOpponentSocketId(socket.id) && appointment.getOpponent(socket.id)) {
            appointment.getOpponent(socket.id).getUniqueSocketsId(io.sockets.sockets).map((sid) => {
                io.to(sid).emit('notification:message', {
                    title: `You received a new Message${(author ? ` from ${author}` : '')}`,
                    body: data.message
                });
            });
        }
    });

    /**
     * When user disconnect from page
     * Get count of sid's and remove user if he has no started appointment
     * If it is socket from appointment call emit message to opponent
     */
    socket.on('disconnect', () => {
        if (!socketsList[socket.id]) return;
        if (socketsList[socket.id].user) {
            const user = socketsList[socket.id].user;
            const appointment = appointmentsList[user.appointmentId];
            user.removeSocketId(socket.id);

            if (user.appointmentId &&
                appointment &&
                appointment.sid[user.getUserRole()] == socket.id) {

                appointment.addMessage(null, `${user.getFullName()} has left the chat room`, Date.now());
                io.to(appointment.getOpponentSocketId(socket.id)).emit('call:opponent:left', {
                    timestamp: Date.now(),
                    message: user.getFullName()
                });

                if (!appointment.getOpponentSocketId(socket.id) && appointment.getOpponent(socket.id)) {
                    appointment.getOpponent(socket.id).getUniqueSocketsId(io.sockets.sockets).map((sid) => {
                        io.to(sid).emit('notification:message', {title: `${user.getFullName()} has left the chat room`});
                    });
                }

                appointment.sid[user.getUserRole()] = null;
                if (!appointment.sid.doctor && !appointment.sid.patient) {
                    const appointmentId = user.appointmentId;

                    appointment.noUsers = Date.now();
                    appointment.noUsersTimer = setTimeout(() => {
                        console.log('call:close:closed no users in appointment', socket.id);
                        if (appointment.users.patient) {
                            appointment.users.patient.appointmentId = null;
                        }
                        appointment.users.doctor.appointmentId = null;

                        appointment.closeAppointment();

                        if (appointment.users.patient) {
                            io.to(appointment.users.patient.username).emit('appointment:close', {appointmentId});
                        }
                        io.to(appointment.users.doctor.username).emit('appointment:close', {appointmentId});

                        delete appointmentsList[appointmentId];
                    }, 10 * 60 * 1000); // 10 minutes
                }
            }
            if (!user.sid.length && !user.appointmentId) {
                delete patientsWaitersList[user.id];
                delete usersList[user.username];
            }
        }

        delete socketsList[socket.id];
    });
});
