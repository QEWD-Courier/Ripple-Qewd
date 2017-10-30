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

  4 October 2017

*/

var pas;
//var openEHR = require('../openEHR/openEHR');

module.exports = {

  init: function() {
    console.log('pasModule: ' + this.userDefined.rippleUser.pasModule);
    pas = require('../' + this.userDefined.rippleUser.pasModule);
    if (pas.init) pas.init.call(this);
  },

  getPatients: function(args, callback) {

    var session = args.session;
    var self = this;
    var patientCache = session.data.$('patients');
    //var patientCache = new this.documentStore.DocumentNode('ripplePatients');

    // Have we already fetched the patients from the PAS and cached them?

    if (patientCache.exists) {
      console.log('retrieve patients from cache');
      var patients = {};
      patientCache.forEachChild(function(no, patient) {
        var record = patient.getDocument();
        if (!record.nhsNumber) {
          // something wrong with the cache - need to clear it up...
          patientCache.delete();
          return true; // abort the forEach loop and let it drop through to build the cache again
        }

        //console.log('**** record for ' + no + ' = ' + JSON.stringify(record));
        //console.log('********************************');
        delete record.headings;
        delete record.headingIndex;
        delete record.clinicalStatements;
        record.nhsNumber = record.nhsNumber.toString();
        record.id = record.id.toString();
        record.dateOfBirth = parseInt(record.dateOfBirth);
        if (record.pasNo) record.pasNo = record.pasNo.toString();
        //patients.push(record);
        patients[record.id] = record;

        /*

        // just in case - create the NHSNo / EHRId mappings if not already set up for this number
        //console.log('** checking ' + record.nhsNumber);
        var ehrIdMap = new self.documentStore.DocumentNode('rippleNHSNoMap', [record.nhsNumber]);
        if (!ehrIdMap.exists) {
          console.log('**!! mapping missing for  ' + record.nhsNumber + ': so re-mapping it');
          openEHR.startSessions(session, function(openEHRSessions) {
            openEHR.mapNHSNo(record.nhsNumber, openEHRSessions);
          });
        }
        */

      });
      if (patientCache.exists) {
        if (callback) callback(patients);
        return;
      }
    }
    pas.getPatients.call(this, function(patients) {
      if (patients.error) {
        callback(patients);
      }
      else {
        patientCache.delete();
        patientCache.setDocument(patients);

        /*
        var ehrIdMap = new self.documentStore.DocumentNode('rippleNHSNoMap');
        openEHR.startSessions(session, function(openEHRSessions) {
          for (var nhsNo in patients) {
            if (!ehrIdMap.$(nhsNo).exists) {
              console.log('** map ' + nhsNo);
              openEHR.mapNHSNo(nhsNo, openEHRSessions);
            }
          }
        });
        */

        if (callback) callback(patients);
      }
    });
  }
};
