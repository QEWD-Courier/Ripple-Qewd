'use strict';

const db = require('./db');

module.exports = class Appointment {
  /**
   * @param doctor <User>
   * @param patient <User>
   * @param patientId <String> - patient nhs number
   * @param appointmentId <String>
   */
  constructor(doctor, patient, patientId, appointmentId) {
    this.users = {};
    this.data = {};
    this.sid = {patient: null, doctor: null};
    this.created = Date.now();
    this.users.doctor = doctor;
    this.users.patient = patient;
    this.data.patientId = patientId;
    this.appointmentId = appointmentId;
    this.timer = null;
    this.ended = null;
    this.noUsers = null;
    this.noUsersTimer = null;

    this.addMessage(null, 'WebRTC Call Initiated', this.created);
    this.createAppointment();
  }

  /**
   * isCorrectSocketId
   * Check that SocketId is doctor or patient in this appointment
   * @param sid - Socket Id
   * @returns {boolean}
   */
  isCorrectSocketId(sid) {
    return (this.sid.doctor == sid || this.sid.patient == sid);
  }

  /**
   * isCorrectUser
   * Check that User is doctor or patient in this appointment
   * @param user <User>
   * @returns {boolean}
   */
  isCorrectUser(user) {
    return (this.users.doctor == user || this.users.patient == user);
  }

  /**
   * getOpponent
   * @param sid - Socket Id
   * @returns {User|null}
   */
  getOpponent(sid) {
    return (this.sid.doctor == sid) ? this.users.patient : this.users.doctor;
  }

  /**
   * getOpponentSocketId
   * @param sid - Socket Id
   * @returns {*|null}
   */
  getOpponentSocketId(sid) {
    return (this.sid.doctor == sid) ? this.sid.patient : this.sid.doctor;
  }

  /**
   * getOpponentSocketIdByUser
   * @param user <User>
   * @returns {*|null}
   */
  getOpponentSocketIdByUser(user) {
    return (user.isDoctor()) ? this.sid.patient : this.sid.doctor;
  }

  /**
   * Create Appointment Info
   * @param cb
   */
  createAppointment(cb) {
    db.createAppointment(this.appointmentId, this.users.doctor.getFullName(), (this.users.patient) ? this.users.patient.getFullName() : null, cb)
  }

  /**
   * Get Appointment Info
   * @param cb
   */
  getAppointment(cb) {
    db.getAppointment(this.appointmentId, cb);
  }

  /**
   * Update Appointment
   * @param field - <String>
   * @param value
   * @param cb
   */
  updateAppointment(field, value, cb) {
    db.updateAppointment(this.appointmentId, field, value, cb)
  }

  /**
   * Close Appointment
   * @param cb
   */
  closeAppointment(cb) {
    this.updateAppointment('isClosed', true, cb);
  }

  /**
   * Add message
   * @param author <String>
   * @param message <String>
   * @param created <Timestamp>
   */
  addMessage(author, message, created) {
    db.addMessage(this.appointmentId, author, message, created);
  }

  /**
   * Get Current Appointment Messages
   * @param isDesc <Boolean> - Sort order
   * @param cb
   */
  getMessages(isDesc, cb) {
    db.getMessages(this.appointmentId, isDesc, cb);
  }
};
