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
 | Author: Chris Johnson                                                    |
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

  26 January 2017

*/

var headings = require('./../lib/headings/headings');
var openEHR = require('./../lib/openEHR/openEHR');
var template = require('qewd-template');

Object.keys(openEHR.servers).forEach(function(server) {
  var session;

  // Create a session with the current openEHR server
  beforeEach(function(done) {
    openEHR.startSession(server, function(res) {
      session = res.id;
      done();
    });
  });

  afterEach(function(done) {
    openEHR.stopSession(server, session, done);
  });

  function request(url, data, done, process) {
    openEHR.request({
      url: url,
      queryString: data,
      host: server,
      session: session,
      processBody: process,
      callback: done
    });
  }

  describe("OpenEHR Server " + server, function() {
    var ivorCoxNhsId = 9999999000;
    var ivorCoxEhrId;

    beforeEach(function(done) {
      request('/rest/v1/ehr', {
          subjectId: ivorCoxNhsId,
          subjectNamespace: 'uk.nhs.nhs_number'
        }, done, function(res) { ivorCoxEhrId = res.ehrId;}
      );
    });

    // For each heading which has an aql defined
    Object.keys(headings.headings).forEach(function(headingName) {
      var heading = headings.headings[headingName];
      describe("using " + headingName, function() {
        if(heading.query && heading.query.aql) {
          it("can get Ivor Cox details using AQL", function(done) {
            var aql = template.replace(heading.query.aql,{
              patientId: ivorCoxNhsId, ehrId: ivorCoxEhrId
            });

            request('/rest/v1/query', {aql:aql}, done, function(res) {
              expect(res.resultSet).toBeTruthy();
            });
          });
        }
      });
    });
  });
});
