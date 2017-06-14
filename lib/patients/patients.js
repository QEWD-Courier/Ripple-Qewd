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

  12 June 2017

*/

var mpv = require('./mpv'); // Multiple Patient View
var spv = require('./spv'); // Single Patient View
var events = require('../events/endpoints');
var router = require('qewd-router');
var authenticate = require('../sessions/authenticate');
var clinicalStatements = require('../clinicalStatements/clinicalStatements');

  /*

    /api/patients                                         -> mpv.getPatients()
    /api/patients/{{patientId}}                           -> spv.getPatientSummary(patientId)                   -> patientSummary.js
    /api/patients/{{patientId}}/{{heading}}               -> spv.getHeadingTable(patientId, heading)            -> patientHeadingTable.js
    /api/patients/{{patientId}}/{{heading}}/{{sourceId}}  -> spv.getHeadingDetail(patientId, heading, sourceId) -> patientHeadingDetail.js

  */

var routes = [
  {
    url: '/api/patients/:patientId/events/:eventType',
    method: 'GET',
    handler: events.getAll
  },
  {
    url: '/api/patients/:patientId/events/:eventType/:sourceId',
    method: 'GET',
    handler: events.getOne
  },
  {
    url: '/api/patients/:patientId/events/:eventType',
    method: 'POST',
    handler: events.post
  },
  {
    url: '/api/patients/:patientId/clinicalStatements',
    method: 'GET',
    handler: clinicalStatements.getSummary
  },
  {
    url: '/api/patients/:patientId/clinicalStatements',
    method: 'POST',
    handler: clinicalStatements.post
  },
  {
    url: '/api/patients/:patientId/clinicalStatements/:sourceId',
    method: 'GET',
    handler: clinicalStatements.getDetail
  },
  {
    url: '/api/patients/:patientId/:heading/:sourceId/:identifier/:subId',
    handler: spv.probablyDicomL3
  },
  {
    url: '/api/patients/:patientId/:heading/:sourceId/:identifier',
    handler: spv.probablyDicomL2
  },
  {
    url: '/api/patients/:patientId/:heading/:sourceId',
    handler: spv.getHeadingDetail
  },
  {
    url: '/api/patients/:patientId/:heading',
    method: 'GET',
    handler: spv.getHeadingTable
  },
  {
    url: '/api/patients/:patientId/:heading',
    method: 'POST',
    handler: spv.postHeading
  },
  {
    url: '/api/patients/:patientId',
    handler: spv.getPatientSummary
  },
  {
    url: '/api/patients',
    handler: mpv.getPatients
  }
];

routes = router.initialise(routes);

function sendMessage(type, message, session) {
  var socketSession;
  var socketSessionToken = session.data.$(['ewd-session', 'socketSession']).value;
  if (socketSessionToken !== '') { 
    //console.log('socketSessionToken = ' + socketSessionToken);
    var socketStatus = this.sessions.authenticate(socketSessionToken);
    //console.log('*** socketStatus = ' + JSON.stringify(socketStatus));
    socketSession = socketStatus.session;
  }
  else {
    socketSession = session;
  }
  socketSession.sendToSocket(type, message);
}

function patients(messageObj, finished) {

  var status = authenticate.call(this, messageObj);
  if (status.error) {
    finished(status);
    return;
  }
  
  var q = this;

  router.process.call(this, messageObj, status.session, routes, function(results) {
    if (results.error) {
      finished(results);
    }
    else {
      finished(results);
    }
  });
}

module.exports = {
  init: function() {  
    mpv.init.call(this);
    spv.init.call(this);
  },
  api: patients
};
