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
 | Author: Will Weatherill                                                  |
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

 20 October 2017

*/

var openEHR = require('../openEHR/openEHR');
var getDetailBySourceId = require('./getDetailBySourceId');
var getDocumentSummary = require('./getDocumentSummary');

function getDetail(args, callback) {

  if (!args.patientId || args.patientId === '') {
    return callback({error: 'Missing or invalid patientId'});
  }

  if (!args.sourceId || args.sourceId === '') {
    return callback({error: 'Missing or invalid sourceId'});
  }

  console.log('patientId: ' + args.patientId);
  console.log('sourceId: ' + args.sourceId);

  var cachedSummary = args.session.data.$(['patients', args.patientId, 'documents', 'summary', args.sourceId]);

  console.log('cachedSummary exists: ' + JSON.stringify(cachedSummary.exists));
  
  if (!cachedSummary.exists) {
    // fetch the summary and create the cache, then try again!
    getDocumentSummary(args, function() {
      getDetail(args, callback);
    });
    return;
  }

  var summary = cachedSummary.getDocument(true);

  var sourceId = summary.uid;
  var host = summary.source;

  openEHR.startSession(host, args.session, function (openEHRSessions) {
    openEHR.mapNHSNo(args.patientId, openEHRSessions, function () {
      getDetailBySourceId(sourceId, host, openEHRSessions, function(results) {
        openEHR.stopSessions(openEHRSessions, args.session);
        callback(results);
      });
    });
  });

}

module.exports = getDetail;
