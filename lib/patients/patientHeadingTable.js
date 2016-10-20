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

20 October 2016

*/

var openEHR = require('../openEHR/openEHR');
var headingsLib = require('../headings/headings');

var headings = headingsLib.headings;

function getHeadingTable(patientId, heading, callback) {

  var q = this;

  var patient = new this.documentStore.DocumentNode('ripplePatients', [patientId]);
  var nhsNo = patientId;
  var openEHRId = patient.$('openEHRId').value
  if (openEHRId !== '') nhsNo = openEHRId;

  if (!headings[heading]) {
    console.log('*** ' + heading + ' has not yet been added to middle-tier processing');
    callback([]);
    return;
  }

  var patientHeading = new this.documentStore.DocumentNode('ripplePatients', [patientId, 'headings', headings[heading].name]);
  if (!patientHeading.exists) {
    // fetch it!
    var q = this;
    console.log('*** heading ' + heading + ' needs to be fetched!')
    openEHR.startSessions(function(sessions) {
      //console.log('*** sessions: ' + JSON.stringify(sessions));
      openEHR.mapNHSNo(nhsNo, sessions, function() {
        //console.log('*** NHS no mapped');
        headingsLib.getHeading.call(q, patientId, heading, sessions, function() {
          openEHR.stopSessions(sessions);
          // now try again!
          console.log('**** trying again!');
          getHeadingTable.call(q, patientId, heading, callback);
        });
      });
    });
    return;
  }

  console.log('patientHeading exists for ' + nhsNo + ': heading ' + heading);
  var results = [];
  patientHeading.forEachChild(function(host, hostNode) {
    //console.log('**** forEachChild: host = ' + host);
    hostNode.forEachChild(function(index, headingNode) {
      //console.log('**** forEachChild index = ' + index);
      var record = headingNode.getDocument();
      var result = {
        sourceId: record.uid.split('::')[0],
        source: host
      }
      var emptyValues = 0;
      
      headings[heading].headingTableFields.forEach(function(fieldName) {
        //console.log('***fieldName: ' + fieldName);
        var name = headings[heading].fieldMap[fieldName];
        if (typeof name === 'function') {
          value = name(record, host);
        }
        else {
          var value = record[name];
        }
        //console.log('*** value: ' + value);
        if (value === '') emptyValues++;
        result[fieldName] = value;
      });
      if (emptyValues !== headings[heading].headingTableFields.length) results.push(result);
    });
  });
  if (callback) callback(results);
}

module.exports = getHeadingTable;

/*
module.exports = {
  get: function(patientId, heading, callback)
    getHeadingTable.call(this, patientId, heading, callback);
  }
};
*/