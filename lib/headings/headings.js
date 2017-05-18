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

  18 May 2017

*/

var openEHR = require('../openEHR/openEHR');
var template = require('qewd-template');
var fs = require('fs');

var path = './';

var headings = {
  allergies: require(path + 'allergies'),
  problems: require(path + 'problems'),
  medications: require(path + 'medications'),
  contacts: require(path + 'contacts'),
  laborders: require(path + 'laborders'),
  labresults: require(path + 'labresults'),
  procedures: require(path + 'procedures'),
  referrals: require(path + 'referrals'),
  appointments: require(path + 'appointments'),
  eolcareplans: require(path + 'eolcareplans'),
  mdtreports: require(path + 'mdtreports'),
  personalnotes: require(path + 'personalnotes'),
  vaccinations: require(path + 'vaccinations'),
  vitalsigns: require(path + 'vitalsigns'),
  clinicalnotes: require(path + 'clinicalnotes'),
  counts: require(path + 'counts'),
  transfers: {
    textFieldName: ''
  },
  //dicom: true,
  //'dicom-test': true
};

function getTextFromFile(fileName) {
  var text;
  if (fs.existsSync(fileName)) {
    text = '';
    fs.readFileSync(fileName).toString().split(/\r?\n/).forEach(function(line){
      text = text + ' ' + line;
    });
  }
  return text;
}

function getAQL(headingName) {
  var aqlFile = __dirname + '/' + headingName + '.aql';
  return getTextFromFile(aqlFile);
}

var text;
var aqlFile;
var sqlFile;
var heading;

// pull in AQL

for (heading in headings) {
  aqlFile = __dirname + '/' + heading + '.aql';
  text = getTextFromFile(aqlFile);
  if (text) {
    if (!headings[heading].query) headings[heading].query = {}; 
    headings[heading].query.aql = text;
  }
}

// pull in SQL (should become redundant)

for (heading in headings) {
  sqlFile = __dirname + '/' + heading + '.sql';
  text = getTextFromFile(sqlFile);
  if (text) {
    if (!headings[heading].query) headings[heading].query = {}; 
    headings[heading].query.sql = text;
  }
}

var q;

function getHeading(nhsNo, heading, session, openEHRSessions, callback) {

  // OK this is where we determine how and where the heading data will be fetched from
  //  and we do any mapping to an openEHR NHS Number here!

  var params = {
    callback: callback,
    url: '/rest/v1/query',
    method: 'GET'
  };

  var queryType;
  var query;
  var server;
  var patientId;
  params.dontAsk = {};
  params.hostSpecific = {};
  for (var host in openEHR.servers) {
    params.hostSpecific[host] = {
      qs: {}
    };
    server = openEHR.servers[host];
    queryType = server.queryType;
    //console.log('***** heading: ' + heading.name + '; queryType = ' + queryType + '; server = ' + JSON.stringify(server));
    //console.log('*** server query: ' + server.query);
    if (queryType === 'custom') {
      var method = require('../' + this.userDefined.rippleUser.pasModule).getHeadingsQuery;
      query = method.call(this, nhsNo, heading.name);
      params.hostSpecific[host]['qs'] = query;
    }
    else {
      if (!heading.query[queryType]) queryType = 'aql';
      query = heading.query[queryType];
      //console.log('**** host = ' + host + '; queryType = ' + queryType + ': heading = ' + heading.name + '; query = ' + JSON.stringify(query));
      if (query.length === 0) {
        params.hostSpecific[host]['qs'][queryType] = '';
        params.dontAsk[host] = true;
        console.log('**** dontAsk set to true for ' + host); 
      }
      else {
        patientId = nhsNo;

        if (this.userDefined.rippleUser && this.userDefined.rippleUser.nhsNumber && this.userDefined.rippleUser.nhsNumber[host]) {
          patientId = this.userDefined.rippleUser.nhsNumber[host];
        }
        if (typeof query === 'string') {
          var subs = {
            patientId: patientId,
            ehrId: openEHR.getEhrId(patientId, host)
          }
          params.hostSpecific[host]['qs'][queryType] = template.replace(query, subs);
        }
        else {
          if (query[1] === 'openEHRNo') patientId = openEHR.getEhrId(patientId, host);
          if (query[1] === 'ehrId') patientId = openEHR.getEhrId(patientId, host);
          params.hostSpecific[host]['qs'][queryType] = query[0] + patientId + query[2];
        }
      }
    }
  }
  params.sessions = openEHRSessions;

  params.processBody = function(body, host) { 
    //console.log('**** processBody for host ' + host);
    var results = [];
    if (!body) body = {
      resultSet: []
    };
    if (body && body.resultSet) {
      //console.log('setting patientHeading global for ' + heading.name + ' / host ' + host);
      var patient = session.data.$(['patients', nhsNo]);
      var patientHeading = patient.$(['headings', heading.name, host]);
      //var patientHeading = new q.documentStore.DocumentNode('ripplePatients', [nhsNo, "headings", heading.name, host]);
      if (body.resultSet.length === 0) {
        patientHeading.value = 'empty';
      }
      else {
        patientHeading.setDocument(body.resultSet);
        var patientHeadingIndex = patient.$(['headingIndex', heading.name]);
        //var patientHeadingIndex = new q.documentStore.DocumentNode('ripplePatients', [nhsNo, "headingIndex", heading.name]);

        var count = 0;
        body.resultSet.forEach(function(result) {
          var index = {
            host: host,
            recNo: count
          };
          if (heading.name === 'counts' && typeof result.uid === 'undefined') result.uid = host + '-counts::1';
          if (result.uid) {
            patientHeadingIndex.$(result.uid.split('::')[0]).setDocument(index);
          }
          else {
            console.log('===============================');
            console.log('   ');
            console.log('The AQL for heading ' + heading.name + ' from ' + host + ' is not returning the uid!');
            console.log('   ');
            console.log('===============================');
          }
          count++;
        });
      }
    }
  };

  params.heading = heading.name; // for debugging

  openEHR.requests(params);

}

function getSelectedHeading(patientId, headingName, session, openEHRSessions, callback) {
  var heading = headings[headingName];
  if (!heading) {
    console.log('***!!! error in getSelectedHeading: ' + headingName + ' is not defined in headings object');
    var patientHeading = session.data.$(['patients', patientId, 'headings', headingName]);
    //var patientHeading = new q.documentStore.DocumentNode('ripplePatients', [patientId, "headings", headingName]);
    patientHeading.value = 'error';
    callback();
    return;
  }
  getHeading.call(this, patientId, heading, session, openEHRSessions, callback);
}

/*
function getAllergies(nhsNo, sessions, callback) {
  getSelectedHeading(nhsNo, 'allergies', sessions, callback);
}

function getProblems(nhsNo, sessions, callback) {
  getSelectedHeading(nhsNo, 'problems', sessions, callback);
} 

function getMedications(nhsNo, sessions, callback) {
  getSelectedHeading(nhsNo, 'medications', sessions, callback);
}

function getContacts(nhsNo, sessions, callback) {
  getSelectedHeading(nhsNo, 'contacts', sessions, callback);
}
*/

module.exports = {
  init: function() {
    q = this;
    openEHR.init.call(this);
  },
  //getAllergies: getAllergies,
  //getProblems: getProblems,
  //getContacts: getContacts,
  //getMedications: getMedications,
  getHeading: getSelectedHeading,
  headings: headings,
  getAQL: getAQL
};
