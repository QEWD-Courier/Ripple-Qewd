/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-18 Ripple Foundation Community Interest Company       |
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

  29 January 2018

*/

var mpv = require('../patients/mpv');
var headingsLib = require('../headings/headings');
var openEHR = require('../openEHR/openEHR');
var template = require('qewd-template');

var headings = {
  allergies: true
};

function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function runQuery(aql, body, session, callback) {

  var results = {};

  function cb(obj) {
    var arr = [];
    var patients = session.data.$('patients');
    var patient;
    var patientDob;
    var data;

    var ageRange = false;

    if (typeof body.maxValue !== 'undefined' && typeof body.minValue !== 'undefined') {
      ageRange = true;
    }

    var date = new Date(body.dateOfBirth);
    var targetDob = date.getFullYear() + '-' + (date.getMonth() +1) + '-' + date.getDate();

    if (!body.sexMale && !body.sexFemale) {
      body.sexMale = true;
      body.sexFemale = true;
    }

    var match;
    var patientGender;
    var age;

    for (var nhsNo in obj) {
      match = true;
      patient = patients.$(nhsNo);
      if (!patient.exists) match = false;

      if (match && typeof body.dateOfBirth !== 'undefined' && body.dateOfBirth !== '') {
        // filter on date of birth
        // dateOfBirth: "1998-05-29T00:00:00.000Z"

        date = new Date(patient.$('dateOfBirth').value);
        patientDob = date.getFullYear() + '-' + (date.getMonth() +1) + '-' + date.getDate();
        if (patientDob !== targetDob) match = false;
      }
      if (match) {
        patientGender = patient.$('gender').value;
        if (patientGender === 'Male' && !body.sexMale) match = false;
        if (patientGender === 'Female' && !body.sexFemale) match = false;
      }

      if (match && ageRange) {
        age = getAge(patient.$('dateOfBirth').value);
        if (body.minValue > 0 && age < body.minValue) match = false;
        if (body.maxValue !== 100 && age > body.maxValue) match = false;
        console.log('** patient DOB: ' + patient.$('dateOfBirth').value + '; age = ' + age + '; min: ' + body.minValue + '; max: ' + body.maxValue + '; match: ' + match);
      }

      if (match) {
        arr.push({
          id: nhsNo,
          nhsNumber: nhsNo,
          name: patient.$('name').value,
          address: patient.$('address').value,
          dateOfBirth: patient.$('dateOfBirth').value,
          gender: patient.$('gender').value,
          phone: patient.$('phone').value,
          gpName: patient.$('gpName').value,
          gpAddress: patient.$('gpAddress').value,
          pasNo: patient.$('pasNo').value,
          department: patient.$('department').value
        });
      }
    }
    callback(arr);
  }

  var hosts = {
    ethercis: {
      wildcard: '%',
      like: 'ilike'
    },
    marand: {
      wildcard: '*',
      like: 'like'
    }
  };

  var hostSpecific = {};
  var subs;
  var wildcard;
  var like;
  for (var host in hosts) {
    wildcard = hosts[host].wildcard;
    like = hosts[host].like;
    subs = {
      queryText: (wildcard + body.queryText + wildcard) || '',
      like: like
    };
    var hostAql = template.replace(aql, subs);
    console.log('*** aql = ' + hostAql);
    hostSpecific[host] = {
      qs: {
        aql: hostAql
      }
    };
  }

  openEHR.startSessions(session, function(openEHRSessions) {

    var params = {
      callback: cb,
      url: '/rest/v1/query',
      method: 'GET',
      sessions: openEHRSessions,
      heading: body.type,
      hostSpecific: hostSpecific
    };

    params.processBody = function(body, host) { 
      console.log('**** processBody for host ' + host + ': ' + JSON.stringify(body));
      if (!body) body = {
        resultSet: []
      };
      if (body && body.resultSet) {
        body.resultSet.forEach(function(result) {
          results[result.nhsNo] = true;
        });
      }
    };

    console.log('request params: ' + JSON.stringify(params));

    openEHR.requests(params, results);
  });
}

function search(body, session, callback) {
  console.log('search: body.type = ' + body.type);

  // temporary
  /*
  if (!body.type) {
    body.type = 'allergies';
    body.queryContains = true;
    body.queryText = body.queryText || body.queryNext || 'test';
  }
  */

  if (body.type === 'diagnosis') body.type = 'problems';

  if (typeof body.type === 'undefined') return callback([]);
  if (typeof body.queryContains === 'undefined') return callback([]);
  if (typeof body.queryText === 'undefined' || body.queryText === '') return callback([]);

  if (!body.queryContains) return callback([]); // only "contains" queries currently supported

  var aql = headingsLib.getAQL(body.type, __dirname);

  runQuery.call(this, aql, body, session, callback);
}


function clinicalSearch(args, callback) {

  var body = args.req.body;
  var session = args.session;
  var patients = session.data.$('patients');
  var q = this;

  if (!patients.exists) {
    mpv.getPatients.call(this, args, function() {
      search.call(q, body, session, callback);     
    });
    return;
  }

  search.call(this, body, args.session, callback);

}

module.exports = clinicalSearch;
