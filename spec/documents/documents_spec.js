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
var documents = require('./../../lib/documents/documents');
var fs = require('fs');

const tests = {
    referral: {
        file: 'spec/documents/resources/healthlink.referral.json',
    },
    discharge: {
        file: 'spec/documents/resources/healthlink.discharge.json',
    }   
};

describe("openEHR.post referral", function() {
    beforeEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        done();
    });
    
     it("can save a new document into an openEHR instance", function(done) {
    
         for(test in tests) {
            console.log('starting to test posting of ' + test);
            
            var messageObj = {
                path: '/api/documents/' + test,
                method: 'POST',
                body: JSON.parse(fs.readFileSync(tests[test].file, 'utf8')),
            };

            documents.api(messageObj, function(response) {
                expect(response.documentCompositionId).toBeTruthy();           
                done();
            });
        }
     });
});