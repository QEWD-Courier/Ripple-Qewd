/**
 * Created by andrey.p on 15.06.2016.
 */
'use strict';

var util = require('util');

const fs = require('fs');
const db = require('./lib/db');

const constants = require('./lib/constants');
const socketsList = constants.socketsList;
const usersList = constants.usersList;
const patientsWaitersList = constants.patientsWaitersList;
const appointmentsList = constants.appointmentsList;
const patientsList = constants.patientsList;

const User = require('./lib/userItem');
const Appointment = require('./lib/appointmentItem');

function hasToken(token, socket, type) {
  if (!token || token === '') {
    console.log('** socket message emitted ' + type + ':missing token');
    socket.emit(type, {error: 'Missing token'});
    return false;
  }
  else {
    return true;
  }
}

function ifValidToken(token, socket, q, type, callback) {
  //console.log('ifValidToken: ' + token);
  if (hasToken(token, socket, type)) {
    //console.log('hasToken ' + token);
    var data = {
      type: 'webrtc:confirmSession',
      token: token
    };
    q.handleMessage(data, function(responseObj) {
      if (responseObj.message.ok) {
        console.log('token was ok - invoke callback');
        console.log('***');
        callback(responseObj);
      }
      else {
        console.log('** socket message emitted ' + type + ':invalid token');
        socket.emit(type, {error: 'Invalid token'});      
      }
    });
  }
}

function handlers(io, socket, q) {

  console.log('--- handlers loaded for ' + socket.id + ' -----');
  socketsList[socket.id] = {};

  /*
  io.on('connection', function(socket) {
    console.log('*** socket connection made: ' + socket.id);
    socketsList[socket.id] = {};
  });
  */

  socket.on('user:init', (user) => {
    console.log('**********************');
    console.log('websocket message user:init received: ' + JSON.stringify(user));

    if (!socketsList[socket.id]) return;

    var type = 'user:init';

    ifValidToken(user.token, socket, q, type, function(responseObj) {
      console.log('responseObj = ' + JSON.stringify(responseObj));
      console.log('user = ' + JSON.stringify(user));
      
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
        console.log('** socket message emitted appointment:init');
        socket.emit('appointment:init', {
          appointmentId: usersList[user.username].appointmentId
        });
      }
      console.log('** socket message emitted user:init');
      socket.emit('user:init', {ok: true});
    });
  });


  socket.on('window:focused', function () {
    if (!socketsList[socket.id] || !socketsList[socket.id].user) return;
    console.log('** socket message emitted notification:close');
    io.to(socketsList[socket.id].user.username).emit('notification:close');
  });


  socket.on('appointment:init', (data) => {

    console.log('testing validity of token');

    var type = 'appointment:init';

    console.log('websocket message ' + type + ' received: ' + JSON.stringify(data));

    ifValidToken(data.token, socket, q, type, function(responseObj) {

      if (!socketsList[socket.id] || socketsList[socket.id].user.isPatient()) return;
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

      appointmentsList[appointmentId] = appointmentsList[appointmentId] || new Appointment(doctor, patient, nhsNumber, appointmentId);

      doctor.appointmentId = appointmentId;

      if (patient) {
        patient.appointmentId = appointmentId;
        console.log('** socket message emitted appointment:init to ' + patient.username);
        io.to(patient.username).emit('appointment:init', {appointmentId});
        patient.getUniqueSocketsId(io.sockets.sockets).map((sid) => {
          console.log('** socket message emitted notification:message to ' + sid);

          io.to(sid).emit('notification:message', {title: `${doctor.getFullName()} has started an appointment`});
        });
      } else {
        patientsWaitersList[nhsNumber] = appointmentId;
      }
      console.log('** socket message emitted appointment:init to ' + doctor.username);
      io.to(doctor.username).emit('appointment:init', {appointmentId});
    });
  });

  socket.on('appointment:status', (data) => {

    var type = 'appointment:status';

    console.log('websocket message ' + type + ' received: ' + JSON.stringify(data));

    ifValidToken(data.token, socket, q, type, function(responseObj) {

      db.getAppointment(data.appointmentId, function (err, appointment) {
        if (err) {
          console.error(err);
          return;
        }
        if (appointment.length) {
          console.log('** socket message emitted appointment:status');
          socket.emit('appointment:status', {isClosed: appointment[0].isClosed, appointmentId: data.appointmentId});
        }
      });
    });
  });

  socket.on('appointment:messages', (data) => {

    var type = 'appointment:messages';

    console.log('websocket message ' + type + ' received: ' + JSON.stringify(data));

    ifValidToken(data.token, socket, q, type, function(responseObj) {

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
          console.log('** socket message emitted appointment:messages');
          socket.emit('appointment:messages', {
            appointment: appointmentInfo[0],
            messages,
            appointmentId: data.appointmentId
          });
        });
      });
    });
  });

  /**
   * Appointment Call
   */

  socket.on('call:init', (data) => {

    var type = 'call:init';

    console.log('websocket message ' + type + ' received: ' + JSON.stringify(data));

    ifValidToken(data.token, socket, q, type, function(responseObj) {

      console.log(111);
      const appointmentId = data.appointmentId;
      const appointment = appointmentsList[appointmentId];
      const user = socketsList[socket.id].user;
      const userRole = user.getUserRole();
      console.log('--- userRole: ' + userRole);
      console.log('--- user: ' + JSON.stringify(user));
      console.log('--- appointment: ' + util.inspect(appointment));
      if (!appointment || !appointment.isCorrectUser(user)) {
        console.log('** socket message emitted call:close');
        console.log('---222 user: ' + user);
        socket.emit('call:close');
        return;
      }

      console.log(222);

      let opponent = appointment.getOpponentSocketIdByUser(user);

      if (appointment.sid[userRole] && opponent) {

        console.log('** userRole: ' + userRole + '; opponent: ' + opponent);
        console.log('** socket message emitted call:busy to ' + appointment.sid[userRole]);

        io.to(appointment.sid[userRole]).emit('call:busy');
        appointment.addMessage(null, `${socketsList[socket.id].user.getFullName()} has left the chat room`, Date.now());

        console.log('** socket message emitted call:opponent:left to ' + opponent);
        io.to(opponent).emit('call:opponent:left', {
          timestamp: Date.now(),
          message: user.getFullName()
        });
      }

      console.log(333);

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
          console.log('** socket message emitted call:text:messages:history');
          socket.emit('call:text:messages:history', {appointment: appointmentInfo[0], messages});
        });
      });

      console.log(444);
      console.log('** socket message emitted call:getPatientInfo');
      socket.emit('call:getPatientInfo', {
        patientId: appointment.data.patientId
      });

      appointment.sid[userRole] = socket.id;

      console.log('** socket message emitted call:timer');
      socket.emit('call:timer', {
        timestamp: appointment.created
      });

      if (!appointment.getOpponentSocketId(socket.id) && appointment.getOpponent(socket.id)) {
        appointment.getOpponent(socket.id).getUniqueSocketsId(io.sockets.sockets).map((sid) => {
          console.log('** socket message emitted notification:message to ' + sid);
          io.to(sid).emit('notification:message', {title: `${user.getFullName()} has entered the chat room`});
        });
      }

      console.log(555);

      console.log('** socket message emitted call:opponent:join to ' + opponent);
      io.to(opponent).emit('call:opponent:join', {
        timestamp: Date.now(),
        message: user.getFullName()
      });

      if (appointment.timer !== null) {

        console.log('** socket message emitted call:close');
        socket.emit('call:close', {
          timestamp: appointment.ended,
          created_at: appointment.created,
        });
        return;
      }

      console.log(666);

      if (appointment.sid.doctor && appointment.sid.patient) {
        console.log('** socket message emitted call:webrtc:init to ' + appointment.sid.doctor);
        io.to(appointment.sid.doctor).emit('call:webrtc:init', {isInitiator: true});
        console.log('** socket message emitted call:webrtc:init to ' + appointment.sid.patient);
        io.to(appointment.sid.patient).emit('call:webrtc:init', {isInitiator: false});
      }
      console.log('999 - end');
    });
  });

  socket.on('call:remoteStreamProp:get', (data) => {

    var type = 'call:remoteStreamProp:get';

    console.log('websocket message ' + type + ' received: ' + JSON.stringify(data));

    ifValidToken(data.token, socket, q, type, function(responseObj) {

      const appointment = appointmentsList[data.appointmentId];
      if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;

      console.log('** socket message emitted call:remoteStreamProp:get to ' + appointment.getOpponentSocketId(socket.id));
      io.to(appointment.getOpponentSocketId(socket.id)).emit('call:remoteStreamProp:get');
    });
   });

  socket.on('call:remoteStreamProp:post', (data) => {

    var type = 'call:remoteStreamProp:post';

    console.log('websocket message ' + type + ' received: ' + JSON.stringify(data));

    ifValidToken(data.token, socket, q, type, function(responseObj) {

      const appointment = appointmentsList[data.appointmentId];
      if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;

      console.log('** socket message emitted call:remoteStreamProp:post to ' + appointment.getOpponentSocketId(socket.id));
      io.to(appointment.getOpponentSocketId(socket.id)).emit('call:remoteStreamProp:post', {remoteStreamProp: data.remoteStreamProp});
    });
  });

  socket.on('call:video:toggle', (data) => {

    var type = 'call:video:toggle';

    console.log('websocket message ' + type + ' received: ' + JSON.stringify(data));

    ifValidToken(data.token, socket, q, type, function(responseObj) {

      const appointment = appointmentsList[data.appointmentId];
      if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;

      console.log('** socket message emitted call:video:toggle to ' + appointment.getOpponentSocketId(socket.id));
      io.to(appointment.getOpponentSocketId(socket.id)).emit('call:video:toggle');
    });
  });

  socket.on('call:audio:toggle', (data) => {

    var type = 'call:audio:toggle';

    console.log('websocket message ' + type + ' received: ' + JSON.stringify(data));

    ifValidToken(data.token, socket, q, type, function(responseObj) {

      const appointment = appointmentsList[data.appointmentId];
      if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;

      console.log('** socket message emitted call:audio:toggle to ' + appointment.getOpponentSocketId(socket.id));
      io.to(appointment.getOpponentSocketId(socket.id)).emit('call:audio:toggle');
    });
  });

  socket.on('call:restart', (data) => {

    var type = 'call:restart';

    console.log('websocket message ' + type + ' received: ' + JSON.stringify(data));

    ifValidToken(data.token, socket, q, type, function(responseObj) {

      const appointmentId = data.appointmentId;
      const appointment = appointmentsList[appointmentId];
      if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;

      clearTimeout(appointment.timer);
      appointment.timer = null;
      // have restarted the appointment
      console.log('** socket message emitted call:restart to patient ' + appointment.sid.patient);
      io.to(appointment.sid.patient).emit('call:restart', {
        timestamp: Date.now(),
        created_at: appointment.created,
        user: socketsList[socket.id].user.getFullName()
      });
      console.log('** socket message emitted call:restart:get to doctor ' + appointment.sid.doctor);
      io.to(appointment.sid.doctor).emit('call:restart', {
        timestamp: Date.now(),
        created_at: appointment.created,
        user: socketsList[socket.id].user.getFullName()
      });

      console.log('** socket message emitted call:webrtc:init to doctor ' + appointment.sid.doctor);
      io.to(appointment.sid.doctor).emit('call:webrtc:init', {isInitiator: true});
      console.log('** socket message emitted call:webrtc:init to patient ' + appointment.sid.patient);
      io.to(appointment.sid.patient).emit('call:webrtc:init', {isInitiator: false});

      appointment.addMessage(null, `${socketsList[socket.id].user.getFullName()} has restarted the appointment`, Date.now());

      if (!appointment.getOpponentSocketId(socket.id) && appointment.getOpponent(socket.id)) {
        appointment.getOpponent(socket.id).getUniqueSocketsId(io.sockets.sockets).map((sid) => {
          console.log('** socket message emitted notification:message (restarted) to ' + sid);
          io.to(sid).emit('notification:message', {title: `${socketsList[socket.id].user.getFullName()} has restarted the appointment`});
        });
      }

      if (appointment.users.patient) {
        console.log('** socket message emitted appointment:restart:get to patient ' + appointment.users.patient.username);
        io.to(appointment.users.patient.username).emit('appointment:restart', {appointmentId});
      }
      console.log('** socket message emitted appointment:restart:get to doctor ' + appointment.users.doctor.username);
      io.to(appointment.users.doctor.username).emit('appointment:restart', {appointmentId});
    });
  });

  socket.on('call:close', (data) => {

    var type = 'call:close';

    console.log('websocket message ' + type + ' received: ' + JSON.stringify(data));

    ifValidToken(data.token, socket, q, type, function(responseObj) {

      console.log('call:close', socket.id, data);
      const appointmentId = data.appointmentId;
      const appointment = appointmentsList[appointmentId];
      if (!appointment || !appointment.isCorrectSocketId(socket.id) || appointment.timer !== null) return;

      appointment.ended = Date.now();

      console.log('** socket message emitted call:close to patient ' + appointment.sid.patient);
      io.to(appointment.sid.patient).emit('call:close', {
        timestamp: appointment.ended,
        created_at: appointment.created,
        user: socketsList[socket.id].user.getFullName()
      });

      console.log('** socket message emitted call:close to doctor ' + appointment.sid.doctor);
      io.to(appointment.sid.doctor).emit('call:close', {
        timestamp: appointment.ended,
        created_at: appointment.created,
        user: socketsList[socket.id].user.getFullName()
      });

      appointment.addMessage(null, `${socketsList[socket.id].user.getFullName()} has ended the conversation`, Date.now());

      if (!appointment.getOpponentSocketId(socket.id) && appointment.getOpponent(socket.id)) {
        appointment.getOpponent(socket.id).getUniqueSocketsId(io.sockets.sockets).map((sid) => {
          console.log('** socket message emitted notification:message (ended conversation) to ' + sid);
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
          console.log('** socket message emitted appointment:close to patient ' + appointment.users.patient.username);
          io.to(appointment.users.patient.username).emit('appointment:close', {appointmentId});
        }
        console.log('** socket message emitted appointment:close to doctor ' + appointment.users.doctor.username);
        io.to(appointment.users.doctor.username).emit('appointment:close', {appointmentId});

        delete appointmentsList[appointmentId];
      }, 60 * 1000);
    });

  });

  socket.on('call:webrtc:message', (data) => {

    var type = 'call:webrtc:message';

    console.log('websocket message ' + type + ' received: ' + JSON.stringify(data));

    ifValidToken(data.token, socket, q, type, function(responseObj) {

      const appointment = appointmentsList[data.appointmentId];
      if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;

      console.log('** socket message emitted call:webrtc:message to ' + appointment.getOpponentSocketId(socket.id));
      io.to(appointment.getOpponentSocketId(socket.id)).emit('call:webrtc:message', data.message);
    });
  });

  socket.on('call:text:message', (data) => {

    var type = 'call:text:message';

    console.log('websocket message ' + type + ' received: ' + JSON.stringify(data));

    ifValidToken(data.token, socket, q, type, function(responseObj) {

      const appointment = appointmentsList[data.appointmentId];
      if (!appointment || !appointment.isCorrectSocketId(socket.id)) return;
      const author = socketsList[socket.id].user.getFullName();
      const timestamp = Date.now();
      appointment.addMessage(socketsList[socket.id].user.getUserRole(), data.message, timestamp);

      console.log('** socket message emitted call:text:message (1) to ' + appointment.getOpponentSocketId(socket.id));
      io.to(appointment.getOpponentSocketId(socket.id)).emit('call:text:message', {
        message: data.message,
        author,
        timestamp
      });
      console.log('** socket message emitted call:text:message (2) to ' + socket.id);
      io.to(socket.id).emit('call:text:message', {
        message: data.message,
        author: 'You',
        timestamp
      });

      if (!appointment.getOpponentSocketId(socket.id) && appointment.getOpponent(socket.id)) {
        appointment.getOpponent(socket.id).getUniqueSocketsId(io.sockets.sockets).map((sid) => {
          console.log('** socket message emitted notification:message (author) to ' + sid);
          io.to(sid).emit('notification:message', {
            title: `You received a new Message${(author ? ` from ${author}` : '')}`,
            body: data.message
          });
        });
      }
    });
  });

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
          console.log('** socket message emitted call:opponent:left to ' + socket.id);
          io.to(appointment.getOpponentSocketId(socket.id)).emit('call:opponent:left', {
            timestamp: Date.now(),
            message: user.getFullName()
          });

          if (!appointment.getOpponentSocketId(socket.id) && appointment.getOpponent(socket.id)) {
            appointment.getOpponent(socket.id).getUniqueSocketsId(io.sockets.sockets).map((sid) => {
              console.log('** socket message emitted notification:message (left room) to ' + sid);
              io.to(sid).emit('notification:message', {title: `${user.getFullName()} has left the chat room`});
            });
          }

          appointmentsList[user.appointmentId].sid[user.getUserRole()] = null;
        }
        if (!user.sid.length && !user.appointmentId) {
          delete patientsWaitersList[user.id];
          delete usersList[user.username];
        }
      }

      delete socketsList[socket.id];
    });

}

module.exports = handlers;
