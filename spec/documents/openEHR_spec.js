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
 | Author: Will Weatherill                                                  |
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

  30 January 2017

*/

var underTest = require('./../../lib/documents/openEHR');
var openEHR = require('./../../lib/openEHR/openEHR');
var fs = require('fs');

var session;

// Create a session with the current openEHR server
beforeEach(function(done) {
    openEHR.startSession('ethercis', function(res) {
        session = res.id;
        done();
    });
});

afterEach(function(done) {
    openEHR.stopSession('ethercis', session, done);
});

function request(url, data, done, process) {
    openEHR.request({
        url: url,
        queryString: data,
        host: 'ethercis',
        session: session,
        processBody: process,
        callback: done
    });
}

describe("openEHR.post", function() {
    var ivorCoxNhsId = 9999999000;
    var ivorCoxEhrId;

    beforeEach(function(done) {      
      request('/rest/v1/ehr', {
          subjectId: ivorCoxNhsId,
          subjectNamespace: 'uk.nhs.nhs_number'
        }, done, function(res) { ivorCoxEhrId = res.ehrId;}
      );
    });    
       
    it("can save a new document into an openEHR instance", function() {
        var referralJson = fs.readFileSync('spec/documents/general.referral.json', 'utf8');       

        underTest.post(ivorCoxEhrId, 'iEHR - Healthlink - Referral.v0', referralJson, 'ethercis,', function(res) {
            expect(res.info.toBe('document saved'));
        });
    });
});