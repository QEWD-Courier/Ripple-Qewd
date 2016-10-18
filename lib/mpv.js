/*

 ----------------------------------------------------------------------------
 | ewd-ripple: ewd-xpress Middle Tier for Ripple OSI                        |
 |                                                                          |
 | Copyright (c) 2016 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
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

 21 September 2016

*/

var pas;

module.exports = {

  init: function() {
    pas = require('./' + this.userDefined.pasModule);
    if (pas.init) pas.init.call(this);
  },

  getPatients: function(finished) {
    var patientCache = new this.documentStore.DocumentNode('ripplePatients');

    // Have we already fetched the patients from the PAS and cached them?

    if (patientCache.exists) {
      var patients = [];
      patientCache.forEachChild(function(no, patient) {
        var record = patient.getDocument();
        delete record.domains;
        delete record.domainIndex;
        record.nhsNumber = record.nhsNumber.toString();
        record.id = record.id.toString();
        record.pasNo = record.pasNo.toString();
        patients.push(record);
      });
      finished(patients);
      return;
    }
    else {
      pas.getPatients.call(this, function(error, patients) {
        if (error) {
          finished(error);
        }
        else {
          patientCache.delete();
          patientCache.setDocument(patients);
          finished(patients);
        }
      });
    }
  }
};
