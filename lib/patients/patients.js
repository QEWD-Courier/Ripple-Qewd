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

var mpv = require('./mpv'); // Multiple Patient View
var spv = require('./spv'); // Single Patient View
var router = require('./router');

  /*

    /api/patients                                         -> mpv.getPatients()
    /api/patients/{{patientId}}                           -> spv.getPatientSummary(patientId)                   -> patientSummary.js
    /api/patients/{{patientId}}/{{heading}}               -> spv.getHeadingTable(patientId, heading)            -> patientHeadingTable.js
    /api/patients/{{patientId}}/{{heading}}/{{sourceId}}  -> spv.getHeadingDetail(patientId, heading, sourceId) -> patientHeadingDetail.js

  */

var routes = [
  {
    url: '/api/patients/:patientId/:heading/:sourceId',
    method: spv.getHeadingDetail
  },
  {
    url: '/api/patients/:patientId/:heading',
    method: spv.getHeadingTable
  },
  {
    url: '/api/patients/:patientId',
    method: spv.getPatientSummary
  },
  {
    url: '/api/patients',
    method: mpv.getPatients
  }
];

routes = router.initialise(routes);

function patients(messageObj, finished) {

  var status;
  var path = messageObj.path

  router.process.call(this, messageObj.path, routes, function(results) {
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
