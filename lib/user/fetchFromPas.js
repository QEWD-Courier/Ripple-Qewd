/*

 ----------------------------------------------------------------------------
 | rippleosi-ewd3: EWD3/ewd-xpress Middle Tier for Ripple OSI               |
 |                                                                          |
 | Copyright (c) 2016-7 Ripple Foundation Community Interest Company        |
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

 9 March 2017

*/

function fetchFromPas(nhsNumber, session, callback) {

  // called once when a PHR user logs in

  // fetches the patient's PAS data and caches it into the session

  var pas = require('../' + this.userDefined.rippleUser.pasModule);
  if (!pas.init) pas.init.call(this);

  var patientCache = session.data.$('patients');

  pas.getOnePatient.call(this, nhsNumber, function(results) {

    if (!results.error) {
      patientCache.setDocument(results);
      if (callback) callback();
    }
  });

}

module.exports = fetchFromPas;
