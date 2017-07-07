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

  5 June 2017

*/

var openEHR = require('../openEHR/openEHR');
var headingsLib = require('../headings/headings');
var fetchFromPas = require('../user/fetchFromPas');

var headings = headingsLib.headings;

function formatSummary(nhsNo, session) {
  var patient = session.data.$(['patients', nhsNo]);
  //var patient = new this.documentStore.DocumentNode('ripplePatients', [nhsNo]);
  var patientHeadings = patient.$('headings');
  var results = {};

  if (this.userDefined.rippleUser) {
    this.userDefined.rippleUser.summaryHeadings.forEach(function(heading) {
      if (typeof heading === 'object') {
        results[heading.name] = [];
      }
      else {
        results[heading] = [];
      }
    });
  }
  else {
    results = {
      allergies: [],
      problems: [],
      medications: [],
      contacts: [],
      transfers: []
    };
  }

  var heading;
  var summary;

  for (heading in results) {
    for (var host in openEHR.servers) {      
      patientHeadings.$([heading, host]).forEachChild(function(index, childNode) {
        var text = childNode.$(headings[heading].textFieldName).value;
        if (text !== null && text !== '') {
          summary = {
            sourceId: childNode.$('uid').value.split('::')[0],
            source: openEHR.servers[host].sourceName,
            text: text
          }
          results[heading].push(summary);
        }
      });
    }
  }

  results.name = patient.$('name').value;
  results.gender = patient.$('gender').value;
  results.dateOfBirth = patient.$('dateOfBirth').value;
  //results.nhsNumber = nhsNo;
  results.id = patient.$('id').value;
  results.address = patient.$('address').value;
  results.pasNumber = patient.$('pasNo').value;
  if (results.pasNumber === '') results.pasNumber = patient.$('IHINumber').value;
  if (this.userDefined.rippleUser.nhsNumber) {
    results.nhsNumber = results.pasNumber;
  }
  else {
    results.nhsNumber = nhsNo;
  }
  results.gpName = patient.$('gpName').value;
  results.gpAddress = patient.$('gpAddress').value;
  results.telephone = patient.$('phone').value;
  
  return results;
}

function getPatientSummary(patientId, session, openEHRSessions, callback) {

  var q = this;

  var ready = {};
  if (this.userDefined.rippleUser) {
    this.userDefined.rippleUser.summaryHeadings.forEach(function(heading) {
      if (typeof heading === 'object') {
        ready[heading.name] = heading.value;
      }
      else {
        ready[heading] = false;
      }
    });
  }
  else {
    ready = {
      allergies: false,
      medications: false,
      problems: false,
      contacts: false
    };
  }

  for (var heading in ready) {
    if (!ready[heading]) {
      (function(heading) {
        headingsLib.getHeading.call(q, patientId, heading, session, openEHRSessions, function() {
          q.emit('headingReady', heading, ready, callback);
        });
      }(heading));
    }
  }
}

function patientSummary(patientId, session, callback) {

  var patient = session.data.$(['patients', patientId]);

  if (!patient.exists) {
    var self = this;
    // fetch patient data from PAS and save into session
    fetchFromPas.call(this, patientId, session, function() {
      // try again
      patientSummary.call(self, patientId, session, callback);
    });
    return;
  }

  //var patient = new this.documentStore.DocumentNode('ripplePatients', [patientId]);
  var nhsNo = patientId;
  var openEHRId = patient.$('openEHRId').value
  if (openEHRId !== '') nhsNo = openEHRId;
  
  var patientHeadings = patient.$(['headings', 'allergies']);
  if (patientHeadings.exists) {
    // we've already cached the heading data for this patient so just output from cache
    var summary = formatSummary.call(this, patientId, session);
    if (callback) callback(summary);
    return;
  }

  // headings need to be fetched

  var q = this;

  //console.log('*** patientSummary start sessions ***');
  openEHR.startSessions(function(openEHRSessions) {
    //console.log('*** patientSummary mapNHSNo ***');
    openEHR.mapNHSNo(nhsNo, openEHRSessions, function() {
      //console.log('*** patientSummary: run getPatientSummary'); 
      getPatientSummary.call(q, patientId, session, openEHRSessions, function() {
        //console.log('*** patientSummary - stopSessions');
        openEHR.stopSessions(openEHRSessions);
        var summary = formatSummary.call(q, patientId, session);
        if (callback) callback(summary);
        
      });
    });
  });

}

module.exports = {
  init: function() {

    var q = this;

    this.on('headingReady', function(heading, ready, callback) {
      //console.log(heading + ' ready!');
      ready[heading] = true;
      //console.log('*** ready status is now ' + JSON.stringify(ready));
      if (ready.allergies && ready.medications && ready.problems && ready.contacts && ready.transfers) {
        //console.log('** ok call the callback!');
        callback.call(q);
        return;
      }
    });

  },
  get: patientSummary,
};
