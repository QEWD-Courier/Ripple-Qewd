'use strict';
const ROLE_DOCTOR = 'IDCR';

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

  getFullName() {
    return this.name + ' ' + this.surname;
  }

  getUserRole() {
    return (this.isDoctor()) ? 'doctor' : 'patient';
  }

  isDoctor() {
    return this.role == ROLE_DOCTOR;
  }

  isPatient() {
    return this.role != ROLE_DOCTOR;
  }

  haveSids() {
    return Boolean(this.sid.length)
  }

  haveAppointment() {
    return (this.appointmentId !== null)
  }

  removeSocketId(sid){
    for (let i = 0; i < this.sid.length; i++) {
      if (this.sid[i] == sid) {
        this.sid.splice(i, 1);
        break;
      }
    }
    return this.sid;
  }

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