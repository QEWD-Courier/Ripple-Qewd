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

  14 February 2017

*/

var mpv = require('./mpv');
var pas;

function getPatientData(patientId, session, callback) {
  var patient = session.data.$('patients').$(patientId);
  var data = {
    id: patient.$('id').value,
    name: patient.$('name').value,
    address: patient.$('address').value,
    dateOfBirth: patient.$('dateOfBirth').value,
    gender: patient.$('gender').value,
    department: patient.$('department').value,
    nhsNumber: patientId
  };
  callback([data]);
  return;
}

function advancedSearch(args, callback) {

  var body = args.req.body;
  var session = args.session;
  var patients = session.data.$('patients');
  var q = this;

  if (body.nhsNumber && body.nhsNumber !== '') {
    var patientId = body.nhsNumber;
    // if the patient database hasn't yet been cached, go get it now...

    if (!patients.exists) {
      mpv.getPatients.call(this, args, function() {
        getPatientData(patientId, session, callback);       
      });
      return;
    }
    getPatientData(patientId, session, callback);
    return;
  }

  console.log('** running advanced search for ' + JSON.stringify(body));

  if (!pas) pas = require('../' + this.userDefined.rippleUser.pasModule);

  if (!patients.exists) {
    mpv.getPatients.call(this, args, function() {
      pas.advancedSearch.call(q, body, callback);     
    });
    return;
  }

  pas.advancedSearch.call(this, body, callback);

  //callback({error: 'Not yet implemented'});
  return;

}

module.exports = advancedSearch;
