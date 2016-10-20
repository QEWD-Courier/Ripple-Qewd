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

function patients(messageObj, finished) {

  /*

    /api/patients                                         -> mpv.getPatients()
    /api/patients/{{patientId}}                           -> spv.getPatientSummary(patientId)                   -> patientSummary.js
    /api/patients/{{patientId}}/{{heading}}               -> spv.getHeadingTable(patientId, heading)            -> patientHeadingTable.js
    /api/patients/{{patientId}}/{{heading}}/{{sourceId}}  -> spv.getHeadingDetail(patientId, heading, sourceId) -> patientHeadingDetail.js

  */

  if (messageObj.params && messageObj.params['0']) {
    var path = messageObj.params['0'];
    if (path !== '') {
      var pathArr = path.split('/');
      var patientId = pathArr[0];
      var domain = pathArr[1];
      var sourceId = pathArr[2];
      var results;
      if (!domain) {
        spv.getPatientSummary.call(this, patientId, function(results) {
          finished(results);
          return;
        });
        return;
      }
      if (domain === 'diagnoses') domain = 'problems';
      if (!sourceId) {
        if (messageObj.method === 'POST') {
          spv.postDomain.call(this, patientId, domain, messageObj.body, function() {
            finished({ok: true});
          });
          return;
        }
        spv.getHeadingTable.call(this, patientId, domain, function(results) {
          finished(results);
          return;
        });
        return;
      }
      results = spv.getHeadingDetail.call(this, patientId, domain, sourceId);
      finished(results);
      return;
    }
    finished({error: 'Missing patient Id in path: ' + JSON.stringify(messageObj)});
    return;
  }
  // no patient Id specified, so fetch entire list
  mpv.getPatients.call(this, finished);
}

module.exports = {
  init: function() {  
    mpv.init.call(this);
    spv.init.call(this);
  },
  api: patients
};
