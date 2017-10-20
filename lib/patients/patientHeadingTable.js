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

var openEHR = require('../openEHR/openEHR');
var headingsLib = require('../headings/headings');
var headingHelpers = require('../headings/headingHelpers');
var dateTime = require('../dateTime');
var transform = require('qewd-transform-json').transform;

var headings = headingsLib.headings;

/*

  This module fetches a heading.  It's a 2-stage process

  If this is the first time a user has asked for this heading, 
  the appropriate AQL query is sent to each of the OpenEHR machines, and the raw
  responses are saved into the QEWD session, keyed by host id name.

  The raw heading responses for each host name are saved as an array

  An index by host and array element number is also created in the QEWD Session

  Once in cache, the headings can then be retrieved for use in the browser:

  The heading records sent to the browser are first fetched from the QEWD Session
  and then transformed to the UI format using the heading module's get.transformTemplate

*/

function getHeadingTable(args, patientId, heading, session, callback) {
  var q = this;

  // Paging heading
  var paging = false;
  if (args.req && args.req.query) {
    var offset = args.req.query.offset;
    var fetch = args.req.query.fetch;
    if (offset && offset.length !== 0 && fetch && fetch.length !== 0 ) {
        if(heading.indexOf('paging') == -1)  heading += 'paging';
        paging = true;
        session.offset = offset;
        session.fetch = fetch;
    }
  }

  var patient = session.data.$(['patients', patientId]);
  //var patient = new this.documentStore.DocumentNode('ripplePatients', [patientId]);
  var nhsNo = patientId;
  var openEHRId = patient.$('openEHRId').value
  if (openEHRId !== '') nhsNo = openEHRId;

  if (!headings[heading]) {
    console.log('*** ' + heading + ' has not yet been added to middle-tier processing');
    callback([]);
    return;
  }

  //customize heading name
  var endHeading = paging ? '?offset=' + offset + '&fetch=' + fetch : '';
  var patientHeading = patient.$(['headings', headings[heading].name + endHeading]);
  //var patientHeading = new this.documentStore.DocumentNode('ripplePatients', [patientId, 'headings', headings[heading].name]);
  if (!patientHeading.exists) {
    // fetch it and cache it in the QEWD session
    var q = this;
    console.log('*** heading ' + heading + ' needs to be fetched!')
    openEHR.startSessions(function(openEHRSessions) {
      //console.log('*** sessions: ' + JSON.stringify(sessions));
      openEHR.mapNHSNo(nhsNo, openEHRSessions, function() {
        //console.log('*** NHS no mapped');
        headingsLib.getHeading.call(q, patientId, heading, session, openEHRSessions, function() {
          openEHR.stopSessions(openEHRSessions);
          // now try again!
          if (!patientHeading.exists) {
            console.log('*** No results could be returned from the OpenEHR servers for heading ' + heading);
            callback([]);
            return;
          }
          else {
            //console.log('**** trying again!');
            // Now the headings are in cache, re-run to retrieve and transform them

            getHeadingTable.call(q, args, patientId, heading, session, callback);
          }
        });
      });
    });
    return;
  }

  // The heading records are in the QEWD Session cache
  // Retrieve and transform them

  console.log('patientHeading exists for ' + nhsNo + ': heading ' + heading);
  var results = [];

  var template = headings[heading].get.transformTemplate;

  patientHeading.forEachChild(function(host, hostNode) {

    var helpers = headingHelpers(host, heading, 'get');

    hostNode.forEachChild(function(index, headingNode) {
      //console.log('**** forEachChild index = ' + index);
      var input = headingNode.getDocument();
      var output = transform(template, input, helpers);

      // only send the summary headings

      var summaryFields = headings[heading].headingTableFields;
      summaryFields.push('source');
      summaryFields.push('sourceId');

      var summary = {};
      summaryFields.forEach(function(fieldName) {
        summary[fieldName] = output[fieldName] || '';
      });

      results.push(summary);
    });
  });
  if (callback) callback(results);
}

module.exports = getHeadingTable;
