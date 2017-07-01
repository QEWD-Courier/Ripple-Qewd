/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-17 Ripple Foundation Community Interest Company       |
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

  21 June 2017

*/

var mySQL = require('./mySQL');
var template = require('qewd-template');
var dateTime = require('./dateTime');

var count;

function getDepartments(callback) {
  var deptsCache = new this.documentStore.DocumentNode('rippleMedicalDepts');

  var query = 'SELECT * FROM medical_departments';
  mySQL.query(query, function(depts) {
    if(depts.error) {
      callback(depts.error);
      return;
    }
    depts.forEach(function(dept) {
      deptsCache.$(dept.id).setDocument(dept);
    });
    if (callback) callback();
  });
}

function getGPs(callback) {
  var gpCache = new this.documentStore.DocumentNode('rippleGPs');

  var query = 'SELECT * FROM general_practitioners';
  mySQL.query(query, function(gps) {
    if(gps.error) {
      callback(gps.error);
      return;
    }
    gps.forEach(function(gp) {
      gpCache.$(gp.id).setDocument(gp);
    });
    if (callback) callback();
  });
}

function formatPatientData(row) {

  var gpCache = new this.documentStore.DocumentNode('rippleGPs');
  var deptCache = new this.documentStore.DocumentNode('rippleMedicalDepts');
  var gpData =  gpCache.$(row.gp_id);
  var gp = gpData.getDocument();

  var patient = {};
  patient.id = row.nhs_number;
  patient.nhsNumber = row.nhs_number;
  patient.name = row.first_name + ' ' + row.last_name;
  patient.address = formatAddressData(row.address_1, row.address_2, row.address_3, row.address_4, row.address_5, row.postcode);
  patient.dateOfBirth = new Date(row.date_of_birth).getTime();
  patient.gender = row.gender || '';
  patient.phone = row.phone || '';
  patient.gpName = gp.gp_name || '';
  patient.gpAddress = formatAddressData(gp.address_1, gp.address_2, gp.address_3, gp.address_4, gp.address_5, gp.postcode);
  patient.pasNo = row.pas_number || '';
  patient.department = deptCache.$([row.department_id, 'department']).value;

  return patient;
}

function formatAddressData(address_1, address_2, address_3, address_4, address_5, postcode) {
  var address = '';
  var comma = ' ';
  if (address_1) {
    address = address_1;
    comma = ', ';
  }
  if (address_2) {
    address = address + comma + address_2;
    comma = ', ';
  }
  if (address_3) {
    address = address + comma + address_3;
    comma = ', ';
  }
  if (address_4) {
    address = address + comma + address_4;
    comma = ', ';
  }
  if (address_5) {
    address = address + comma + address_5;
    comma = ', ';
  }
  if (postcode) {
    address = address + comma + postcode;
    comma = ', ';
  }

  return address;
}

function runQuery(query, params, callback) {
  query = template.replace(query, params);
  console.log('** query: ' + query);
  var self = this;

  mySQL.query(query, function(rows) {
    if(rows.error) {
      if (callback) callback(rows);
      return;
    }
    var results = [];
    rows.forEach(function(row) {
      results.push(formatPatientData.call(self, row));
    });
    if (callback) callback(results);
  });
}

function addGenderToQuery(query, params) {
  if (!params.sexFemale && !params.sexMale) return query;
  var gender = 'male';
  if (params.sexFemale) gender = 'female';
  params.gender = gender;
  query = query + " AND lower(P.gender) = '{{gender}}'";
  return query;
}

function advancedSearch(params, callback) {

  var surname = params.surname;
  if (!surname || surname === '') {
    if (callback) callback ({error: 'Missing or invalid surname'});
    return;
  }
  var forename = params.forename;
  if (!forename || forename === '') {
    if (callback) callback ({error: 'Missing or invalid forename'});
    return;
  }

  params.surname = surname.toString().toLowerCase();
  params.forename = forename.toString().toLowerCase();

  var count = 0;
  for (var name in params) {
    count++;
  }

  var query = "SELECT * FROM patients P WHERE lower(P.last_name) = '{{surname}}' AND lower(P.first_name) LIKE '{{forename}}%'";

  if (count === 2) {
    // only surname and forename prefix specified
    return runQuery.call(this, query, params, callback);
  }

  if (params.dateOfBirth && params.dateOfBirth !== '') {
    params.dateOfBirth = dateTime.toSqlPASFormat(params.dateOfBirth);
    query = query + " AND P.date_of_birth = '{{dateOfBirth}}'";
    query = addGenderToQuery(query, params);
    return runQuery.call(this, query, params, callback);
  }

  if (params.rangeMin && params.rangeMax) {
    var now = new Date();
    var nowYear = now.getFullYear();
    var fromYear = nowYear - params.rangeMax;
    var rootDate = '-' + (now.getMonth() + 1) + '-' + now.getDate();
    var from = fromYear + rootDate;
    var toYear = nowYear - params.rangeMin;
    var to = toYear + rootDate;
    query = query + " AND P.date_of_birth >= '" + from + "' AND P.date_of_birth <= '" + to + "'";
    query = addGenderToQuery(query, params);
    return runQuery.call(this, query, params, callback);
  }

  query = addGenderToQuery(query, params);
  return runQuery.call(this, query, params, callback);
}

function searchByPatient(searchString, callback) {
  // replace any commas with a space
  searchString = searchString.replace(/,/g , ' ');
  // replace multiple spaces, tabs etc with a single one
  searchString = searchString.replace(/\s\s+/g, ' ');
  // now split up the search string into its pieces
  var pieces = searchString.split(' ');

  if (pieces.length === 0) {
    callback({error: 'Invalid search string'});
    return;
  }

  var firstName;
  var lastName;
  var nhsNumber;
  var dateOfBirth;

  if (pieces.length === 1) {
    lastName = pieces[0];
    firstName = '';
    if (Number.isInteger(parseInt(lastName))) {
      nhsNumber = lastName;
      lastName = '';
      firstName = '';
      dateOfBirth = '';
    }
  }
  else {
    firstName = pieces[0];
    lastName = pieces[1] || '';
    dateOfBirth = pieces[2] || '';
  }

  var query;
  if (nhsNumber) {
    query = 'SELECT * FROM patients P WHERE P.nhs_number = \'{{nhsNumber}}\'';
  }

  else {
    nhsNumber = '';

    if (lastName === '') {
      callback({error: 'Last Name not defined'});
      return;
    }

    query = 'SELECT * FROM patients P WHERE P.last_name LIKE \'{{lastName}}%\'';
    if (firstName && firstName !== '') {
      query = query + ' AND P.first_name LIKE \'{{firstName}}%\'';
    }
    if (dateOfBirth && dateOfBirth !== '') {
      query = query + ' AND P.date_of_birth = \'{{dateOfBirth}}\'';
    }
    //if (params.gender && params.gender !== '') {
    //  query = query + ' AND P.gender EQUALS \'{{gender}}\'';
    //}
  }

  var params = {
    firstName: firstName,
    lastName: lastName,
    dateOfBirth: dateOfBirth,
    nhsNumber: nhsNumber
  };

  var q = this;
  query = template.replace(query, params);

  mySQL.query(query, function(rows) {
    if(rows.error) {
      if (callback) callback(rows);
      return;
    }
    var patientDetails = [];
    var noOfPatients = 0;
    rows.forEach(function(row) {
      noOfPatients++;
      var record = formatPatientData.call(q, row);
      var patient = {
        source: 'local',
        sourceId: record.id,
        name: record.name,
        address: record.address,
        dateOfBirth: record.dateOfBirth,
        gender: record.gender,
        nhsNumber: record.nhsNumber
      };
      patientDetails.push(patient);
    });
    var results = {
      totalPatients: noOfPatients,
      patientDetails: patientDetails
    };
    if (callback) callback(results);
  });
}

function getPatientDetails(nhsNumber, callback) {

  var q = this;

  var query = 'SELECT * FROM patients P WHERE P.nhs_number = ' + nhsNumber;
  mySQL.query(query, function(patients) {
    if(patients.error) {
      callback(patients);
      return;
    }
    var results = {};
    patients.forEach(function(row) {
      results[row.nhs_number] = formatPatientData.call(q, row);
    });
    if (callback) callback(results);
  });

}

function getOnePatient(nhsNumber, callback) {

  var q = this;

  var getOnePatientFn = function() {
    getPatientDetails.call(q, nhsNumber, callback);
  };


  count = 0;
  getDepartments.call(this, function(error) {
    if (error) {
      callback({error: error});
      return;
    }
    q.emit('mySQLResultsReady', getOnePatientFn);
  });

  getGPs.call(this, function(error) {
    if (error) {
      callback({error: error});
      return;
    }
    q.emit('mySQLResultsReady', getOnePatientFn);
  });

}

function getAllPatients(callback) {

  var q = this;
  var query = 'SELECT * FROM patients';
  mySQL.query(query, function(patients) {
    if(patients.error) {
      callback(patients);
      return;
    }
    var results = {};
    patients.forEach(function(row) {
      results[row.nhs_number] = formatPatientData.call(q, row);
    });
    if (callback) callback(results);
  });
}

function getPatients(callback) {

  var q = this;

  var getAllPatientsFn = function() {
    getAllPatients.call(q, callback);
  };

  count = 0;
  getDepartments.call(this, function(error) {
    if (error) {
      callback({error: error});
      return;
    }
    q.emit('mySQLResultsReady', getAllPatientsFn);
  });

  getGPs.call(this, function(error) {
    if (error) {
      callback({error: error});
      return;
    }
    q.emit('mySQLResultsReady', getAllPatientsFn);
  });

}

module.exports = {
  init: function() {
    var q = this;

    this.on('mySQLResultsReady', function(callback) {
      count++;
      console.log('mySQLResultsReady event - count = ' + count);
      if (count === 2) {
        if (callback) callback.call(q);
        return;
      }
    });
  },
  getPatients: getPatients,
  advancedSearch: advancedSearch,
  searchByPatient: searchByPatient,
  getOnePatient: getOnePatient
};
