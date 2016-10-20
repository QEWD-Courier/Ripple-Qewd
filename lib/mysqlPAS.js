/*

 ----------------------------------------------------------------------------
 | rippleosi-ewd3: EWD3/ewd-xpress Middle Tier for Ripple OSI               |
 |                                                                          |
 | Copyright (c) 2016 Ripple Foundation Community Interest Company          |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

18 October 2016

*/

var mySQL = require('./mySQL');

function getDepartments(connection, finished, callback) {
  var deptsCache = new this.documentStore.DocumentNode('rippleMedicalDepts');

  var q = this;
  connection.query('SELECT * FROM medical_departments',function(err,depts){
    if(err) {
      mySQL.disconnect(connection);
      finished({error: 'MySQL query error: ' + err});
      return;
    }
    var departments = {};
    depts.forEach(function(dept) {
      //departments[dept.id] = dept.department;
      deptsCache.$(dept.id).setDocument(dept);
    });
    callback.call(q);
  });
}

function getGPs(connection, finished, callback) {
  var gpCache = new this.documentStore.DocumentNode('rippleGPs');

  var q = this;
  connection.query('SELECT * FROM general_practitioners', function(err, gps){
    if(err) {
      mySQL.disconnect(connection);
      finished({error: 'MySQL query error: ' + err});
      return;
    }
    gps.forEach(function(gp) {
      gpCache.$(gp.id).setDocument(gp);
    });
    callback.call(q);
  });
}

function getAllPatients(connection, callback) {

  var patientGlo = new this.documentStore.DocumentNode('ripplePatients');
  var gpCache = new this.documentStore.DocumentNode('rippleGPs');
  var deptCache = new this.documentStore.DocumentNode('rippleMedicalDepts');

  connection.query('SELECT * FROM patients',function(err,rows){
    if(err) {
      mySQL.disconnect(connection);
      callback({error: 'MySQL query error: ' + err});
      return;
    }
    mySQL.disconnect(connection);
    var patients = {};
    rows.forEach(function(row) {
      var patient = {};
      patient.id = row.nhs_number;
      patient.nhsNumber = row.nhs_number;
      patient.name = row.first_name + ' ' + row.last_name;
      var address = '';
      var comma = ' ';
      if (row.address_1) {
        address = row.address_1;
        comma = ', ';
      }
      if (row.address_2) {
        address = address + comma + row.address_2;
        comma = ', ';
      }
      if (row.address_3) {
        address = address + comma + row.address_3;
        comma = ', ';
      }
      if (row.address_4) {
        address = address + comma + row.address_4;
        comma = ', ';
      }
      if (row.address_5) {
        address = address + comma + row.address_5;
        comma = ', ';
      }
      if (row.postcode) {
        address = address + comma + row.postcode;
        comma = ', ';
      }
      patient.address = address;
      patient.dateOfBirth = new Date(row.date_of_birth).getTime();
      patient.gender = row.gender;
      patient.phone = row.phone;
      patient.gpDetails = gpCache.$(row.gp_id).$('gp_name').value;
      patient.pasNo = row.pas_number;
      patient.department = deptCache.$(row.department_id).$('department').value;
      patients[row.nhs_number] = patient;
      //patientGlo.$(row.nhs_number).setDocument(patient);
    });
    callback(false, patients);
  });
}

function getPatients(callback) {

  var q = this;
  var ready = {
    medicalDepts: false,
    gps: false
  };
  var connection = mySQL.connect(callback);

  var callback2 = function() {
    getAllPatients.call(q, connection, callback);
  };

  getDepartments.call(this, connection, callback, function() {
    q.emit('mySQLResultsReady', 'medicalDepts', ready, callback2);
  });

  getGPs.call(this, connection, callback, function() {
    q.emit('mySQLResultsReady', 'gps', ready, callback2);
  });

}

module.exports = {
  init: function() {
    var q = this;
    this.on('mySQLResultsReady', function(tableName, ready, callback) {
      console.log(tableName + ' ready!');
      ready[tableName] = true;
      if (ready.gps && ready.medicalDepts) {
        callback.call(q);
        return;
      }
    });
  },
  getPatients: getPatients
};
