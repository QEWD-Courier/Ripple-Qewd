'use strict';

const mysql = require('mysql');
const uuid = require('node-uuid');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'answer',
  password: 'answer99q',
  database: 'poc_legacy'
});

connection.connect(function (err) {
  if (err) {
    console.error('Cant connect to database');
    errorHandler(err);
    return;
  }
  console.log('Connected to database');
  connection.query('CREATE TABLE IF NOT EXISTS appointment_history_chat (' +
    '`id` VARCHAR(128) NOT NULL, ' +
    'appointment_id VARCHAR(128) NOT NULL, ' +
    'author VARCHAR(128), ' +
    'message LONGTEXT NOT NULL, ' +
    'created_at DATETIME NOT NULL, ' +
    'PRIMARY KEY (id));', function (err) {
    if (err) {
      errorHandler(err);
      return;
    }
  });
  connection.query('CREATE TABLE IF NOT EXISTS appointment_history_info (' +
    '`id` VARCHAR(128) NOT NULL, ' +
    'doctor VARCHAR(128) NOT NULL, ' +
    'patient VARCHAR(128), ' +
    'isClosed BOOLEAN, ' +
    'created_at DATETIME NOT NULL, ' +
    'PRIMARY KEY (id));', function (err) {
    if (err) {
      errorHandler(err);
      return;
    }
  });
});

/**
 * Create Appointment Information
 * @param appointmentId <String>
 * @param doctor <String> - Doctors name
 * @param patient <String> - Patients name
 * @param cb
 */
connection.createAppointment = function (appointmentId, doctor, patient, cb) {
  if (cb === undefined) {
    cb = function () {};
  }
  connection.query(`INSERT INTO appointment_history_info (id, doctor, patient, isClosed, created_at) VALUES ` +
    `(${connection.escape(appointmentId)}, ${connection.escape(doctor)}, ${connection.escape(patient)}, false, NOW());`, function (err) {
    if (err) {
      errorHandler(err);
      return cb(err, null);
    }
    cb(null);
  });
};

/**
 * Get Appointment Information
 * @param appointmentId
 * @param cb
 */
connection.getAppointment = function (appointmentId, cb) {
  if (cb === undefined) {
    cb = function () {};
  }
  connection.query(`SELECT * FROM appointment_history_info WHERE (id = ${connection.escape(appointmentId)});`, function (err, rows) {
    if (err) {
      errorHandler(err);
      return cb(err, null);
    }
    cb(null, rows);
  });
};

/**
 * Update Appointment
 * @param appointmentId
 * @param field <String>
 * @param value
 * @param cb
 */
connection.updateAppointment = function (appointmentId, field, value, cb) {
  if (cb === undefined) {
    cb = function () {};
  }
  connection.query(`UPDATE appointment_history_info SET ${field}=${connection.escape(value)} WHERE (id = ${connection.escape(appointmentId)});`, function (err, rows) {
    if (err) {
      errorHandler(err);
      return cb(err, null);
    }
    cb(null, rows);
  });
};

/**
 * Add message
 * @param appointmentId <String>
 * @param author <String>
 * @param message <String>
 * @param created_at <Timestamp>
 * @param cb
 */
connection.addMessage = function (appointmentId, author, message, created_at, cb) {
  const id = uuid();
  if (cb === undefined) {
    cb = function () {};
  }
  connection.query(`INSERT INTO appointment_history_chat (id, appointment_id, author, message, created_at) VALUES ` +
    `(${connection.escape(id)}, ${connection.escape(appointmentId)}, ${connection.escape(author)}, ${connection.escape(message)}, ${connection.escape(new Date(created_at))});`, function (err) {
    if (err) {
      errorHandler(err);
      return cb(err, null);
    }
    cb(null);
  });
};

/**
 * Get Messages By Appointment Id
 * @param appointmentId <String>
 * @param isDesc <Boolean> - Sort order
 * @param cb
 */
connection.getMessages = function (appointmentId, isDesc, cb) {
  if (cb === undefined) {
    cb = function () {};
  }
  connection.query(`SELECT appointment_id, author, message, UNIX_TIMESTAMP(created_at) * 1000 as 'timestamp' FROM appointment_history_chat WHERE (appointment_id = ${connection.escape(appointmentId)}) ORDER BY created_at ${(isDesc) ? 'DESC' : 'ASC'};`, function (err, rows) {
  // connection.query(`SELECT appointment_id, author, message, UNIX_TIMESTAMP(CONVERT_TZ(created_at, '+03:00', @@session.time_zone)) * 1000 as 'timestamp' FROM appointment_history_chat WHERE (appointment_id = ${connection.escape(appointmentId)}) ORDER BY created_at ${(isDesc) ? 'DESC' : 'ASC'};`, function (err, rows) {
    if (err) {
      errorHandler(err);
      return cb(err, null);
    }
    cb(null, rows);
  });
};

function errorHandler(err) {
  console.error(err);
}

module.exports = connection;