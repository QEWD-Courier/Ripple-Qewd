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

  7 December 2017

*/

var openEHR = require('../openEHR/openEHR');
var headingsLib = require('../headings/headings');

function getCachedHeading(patientId, heading, session, callback) {
  if (session.data.$(['patients', patientId, 'headingIndex', heading]).exists) {
    return callback();
  }

  var q = this;
  console.log('*** heading ' + heading + ' needs to be fetched!')
  openEHR.startSessions(session, function(openEHRSessions) {
    openEHR.mapNHSNo(patientId, openEHRSessions, function() {
      headingsLib.getHeading.call(q, patientId, heading, session, openEHRSessions, function() {
        openEHR.stopSessions(openEHRSessions, session);
        callback()
      });
    });
  });
}

function deleteHeading(args, callback) {

  var nhsNo = args.patientId;

  if (nhsNo === 'null') {
    return callback({error: 'A null patientId was specified in the request'});
  }

  var heading = args.heading;
  var session = args.session;
  var sourceId = args.sourceId;

  getCachedHeading.call(this, nhsNo, heading, session, function() {
  
    var patient = session.data.$(['patients', nhsNo]);
    if (!patient.exists) {
      return callback({error: 'No such patient ' + nhsNo});
    }

    var index = patient.$(['headingIndex', heading]);
     if (!index.exists) {
      return callback({error: 'No such heading ' + heading});
    } 

    var sourceIndex = index.$(sourceId);

    if (!sourceIndex.exists) {
      return callback({error: 'No such sourceId ' + sourceId + ' for specified patient and heading'});
    }

    var host = sourceIndex.$('host').value;
    var recNo = sourceIndex.$('recNo').value;

    var headingRecord = patient.$(["headings", heading, host, recNo]);
    var uid = headingRecord.$('uid').value;

    openEHR.startSession(host, session, function(openEHRSession) {

      deleteHeadingRecord(host, uid, openEHRSession.id, function() {

        // remove cached records

        sourceIndex.delete();
        headingRecord.delete();

        openEHR.stopSession(host, openEHRSession.id, session);

        callback({
          deleted: true,
          patientId: nhsNo,
          heading: heading,
          sourceId: sourceId,
          host: host
        });
      });
    });
  });
}

function deleteHeadingRecord(host, sourceId, sessionId, callback) {

  var params = {
    host: host,
    callback: callback,
    url: '/rest/v1/composition/' + sourceId,
    method: 'DELETE',
    session: sessionId
  };
  console.log('**** about to delete: ' + JSON.stringify(params, null, 2));
  openEHR.request(params);
}

module.exports = deleteHeading;
