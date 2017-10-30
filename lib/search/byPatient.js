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

  8 March 2017

*/

var patientHeadingTable = require('../patients/patientHeadingTable');
var mpv = require('../patients/mpv');

var test = {
    "totalPatients": "5",
    "patientDetails": [{
        "source": "local",
        "sourceId": "9999999000",
        "name": "Marian Walsh",
        "address": "51, Douglas Road, Dublin, D8",
        "dateOfBirth": -806983200000,
        "gender": "Female",
        "nhsNumber": "9999999000",
        "vitalsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": "260d0fdd-7fde-44f7-971d-366ad6a229b8::ripple_osi.ehrscape.c4h::1",
            "latestEntry": 1456145840706,
            "totalEntries": "17"
        },
        "ordersHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": "29d11186-7c0d-4ced-b35d-510b06c9eff3::ripple_osi.ehrscape.c4h::1",
            "latestEntry": 1460716236687,
            "totalEntries": "70"
        },
        "medsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": "d252dd73-3292-4bbb-a0d7-6c870636a1a6::ripple_osi.ehrscape.c4h::1",
            "latestEntry": 1476372000767,
            "totalEntries": "21"
        },
        "resultsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": "e557afc8-b386-42a0-8d23-40c27bd35a5b::ripple_osi.ehrscape.c4h::1",
            "latestEntry": 1427062262518,
            "totalEntries": "2"
        },
        "treatmentsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": "b9f06818-f458-43e0-93e7-576cecf459b9::ripple_osi.ehrscape.c4h::1",
            "latestEntry": 1475841942123,
            "totalEntries": "18"
        }
    }, {
        "source": "local",
        "sourceId": "9999999019",
        "name": "Rachel Walsh",
        "address": "34, Summer Hill, Dublin, D8",
        "dateOfBirth": -790045200000,
        "gender": "Female",
        "nhsNumber": "9999999019",
        "vitalsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "ordersHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "medsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "resultsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "treatmentsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        }
    }, {
        "source": "local",
        "sourceId": "9999999022",
        "name": "Tim Walsh",
        "address": "84, High Street, Cork, CK",
        "dateOfBirth": 632016000000,
        "gender": "Male",
        "nhsNumber": "9999999022",
        "vitalsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "ordersHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "medsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": "2ed64710-d50e-44ae-820c-0b8e8ea9f6b5::ripple_osi.ehrscape.c4h::2",
            "latestEntry": 1446480737574,
            "totalEntries": "1"
        },
        "resultsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "treatmentsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        }
    }, {
        "source": "local",
        "sourceId": "9999999057",
        "name": "Marian Walsh",
        "address": "24, Low Street, Dublin, D8",
        "dateOfBirth": -560649600000,
        "gender": "Female",
        "nhsNumber": "9999999057",
        "vitalsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "ordersHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "medsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "resultsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "treatmentsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        }
    }, {
        "source": "local",
        "sourceId": "9999999083",
        "name": "Cillian Walsh",
        "address": "75, Mallow View, Galway, GW",
        "dateOfBirth": -472435200000,
        "gender": "Male",
        "nhsNumber": "9999999083",
        "vitalsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "ordersHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "medsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "resultsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        },
        "treatmentsHeadline": {
            "source": "c4hOpenEHR",
            "sourceId": null,
            "latestEntry": null,
            "totalEntries": "0"
        }
    }]
};

var pas;

function search(searchString, session, callback) {

  console.log('** in search: searchString = ' + searchString);

  var q = this;
  var headings = {
    vitalsHeadline: 'vitals', 
    ordersHeadline: 'laborders',
    medsHeadline: 'medications',
    resultsHeadline: 'labresults',
    treatmentsHeadline: 'procedures',
  };

  if (!pas) pas = require('../' + this.userDefined.rippleUser.pasModule);
  pas.searchByPatient.call(this, searchString, function(results) {
    if (results.error) {
      if (callback) callback(results);
      return;
    }
    if (results.totalPatients === 0) {
      if (callback) callback(results);
      return;
    }

    // now fetch the headline data
    var patient;
    var heading;

    var patients = results.patientDetails;
    var totalPatients = results.totalPatients;
    var totalHeadings = 5;
    var headingsCount = {};
    var patientCount = 0;
    console.log('fetching headline data');
    patients.forEach(function(patient) {
      console.log('** fetching headline counts data for patient ' + patient.nhsNumber);
      headingsCount[patient.nhsNumber] = 0;
      for (heading in headings) {
        (function(patient, heading) {
          var nhsNo = patient.nhsNumber;
          var headingName = headings[heading];
          console.log('* fetching heading ' + headingName + ' for patient ' + nhsNo);

          if (headingName === 'vitals') {
            headingsCount[nhsNo]++;
            patient[heading] = {
              source: 'c4hOpenEHR',
              sourceId: null,
              latestEntry: null,
              totalEntries: 0
            };
            return;
          }

          // fetch the heading data for this patient
          var args = {
            patientId: nhsNo,
            heading: headingName,
            session: session
          };
          patientHeadingTable.call(q, args, function(headingResults) {
            
            // calculate the heading headline info

            patient[heading] = {
              source: 'c4hOpenEHR',
              sourceId: null,
              latestEntry: null,
              totalEntries: 0
            };

            // invoke callback if all done

            headingsCount[nhsNo]++;
            if (headingsCount[nhsNo] === totalHeadings) {
              patientCount++;
              if (patientCount === totalPatients) {
                // clear the headings from the session to ensure patient summary retrieved in full if patient selected
                session.data.$(['patients', nhsNo, 'headings']).delete();
                if (callback) callback(results);
              }
            }
          });
        }(patient, heading));
      }
    });
  }); 

}

function searchByPatient(args, callback) {
  console.log('** in searchByPatient!');

  var searchString = args.req.body.searchString;
  if (!searchString || searchString === '') {
    callback({error: 'Missing search string'});
    return;
  }

  var session = args.session;
  var patients = session.data.$('patients');

  var q = this;
  if (!patients.exists) {
    mpv.init.call(this);
    mpv.getPatients.call(this, args, function() {
      search.call(q, searchString, session, callback);     
    });
    return;
  }

  search.call(this, searchString, session, callback);  

  //var results = test;
  //if (callback) callback(results);
}

module.exports = searchByPatient;
