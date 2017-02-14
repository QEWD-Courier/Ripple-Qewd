'use strict';
const ROLE_DOCTOR = require('./constants').ROLE_DOCTOR;

module.exports = class User {
  constructor(data, sid) {
    this.sid = [sid];
    this.appointmentId = null;
    this.id = data.nhsNumber;
    this.username = data.username;
    this.role = data.role;
    this.name = data.name;
    this.surname = data.surname;
    this.nhsNumber = data.nhsNumber;
  }

  /**
   * Get Full Name from user
   * @returns {string}
   */
  getFullName() {
    return this.name + ' ' + this.surname;
  }

  /**
   * Get User Role
   * @returns {string}
   */
  getUserRole() {
    return (this.isDoctor()) ? 'doctor' : 'patient';
  }

  /**
   * Check whether the user is a doctor
   * @returns {boolean}
   */
  isDoctor() {
    return this.role == ROLE_DOCTOR;
  }

  /**
   * Check whether the user is a patien
   * @returns {boolean}
   */
  isPatient() {
    return this.role != ROLE_DOCTOR;
  }

  /**
   * Check the presence of sids
   * @returns {boolean}
   */
  haveSids() {
    return Boolean(this.sid.length)
  }

  /**
   * Check the presence of appointment
   * @returns {boolean}
   */
  haveAppointment() {
    return (this.appointmentId !== null)
  }

  /**
   * Remove sid from sids
   * @param sid
   * @returns {Array}
   */
  removeSocketId(sid){
    for (let i = 0; i < this.sid.length; i++) {
      if (this.sid[i] == sid) {
        this.sid.splice(i, 1);
        break;
      }
    }
    return this.sid;
  }

  /**
   * Get Unique Sockets 1 for browser
   * @param sockets
   * @returns {Array}
   */
  getUniqueSocketsId(sockets) {
    const browsers = [];
    const sids = [];
    this.sid.map((socketId) => {
      const userAgent = sockets[socketId].request.headers['user-agent'];
      if (browsers.indexOf(userAgent) == -1) {
        browsers.push(userAgent);
        sids.push(socketId);
      }
    });

    return sids;
  }
};
