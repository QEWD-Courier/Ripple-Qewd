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

  27 January 2017

  Define a jasmine helper which wraps a test suite and executes each assertion
  within a openEHR session.
*/

var openEHR = require('./../../lib/openEHR/openEHR');

inOpenEHRSession = function(tests) {
  Object.keys(openEHR.servers).forEach(function(server) {
    var session;

    // Create a session with the current openEHR server
    beforeAll(function(done) {
      openEHR.startSession(server, function(res) {
        session = res.id;
        done();
      });
    });

    afterAll(function(done) {
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

    tests(request, server);
  });
}
