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

describe("documents ", function () {

  beforeEach(function (done) {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  
    this.sessions = {
      authenticate: function(token) {
        var status = {
          session: {
            data: {
              $: function(cacheKey) {
                var cachedEntry = {
                  exists: false,
                  setDocument: function(document) {}
                }
                return cachedEntry;

              }
            }
          }
        }

        return status;
      }
    }    
    
    done();
  });

  describe("openEHR.post ", function () {

    it("can save a new document into an openEHR instance", function (done) {

      for (test in tests) {
        console.log('starting to test posting of ' + test);

        var messageObj = {
          path: '/api/documents/' + test,
          method: 'POST',
          body: JSON.parse(fs.readFileSync(tests[test].file, 'utf8')),
          headers: {
            cookie: 'JSESSIONID=1234567890'
          }          
        };

        documents.api.call(this, messageObj, function (response) {
          expect(response.documentCompositionId).toBeTruthy();
          done();
        });
      }
    });
  });

  describe("openEHR.get ", function () {
    beforeEach(function (done) {
      var self = this;
      this.documentNodes = {};

      // mock our env here eg doc store etc
      this.userDefined = {};
      this.documentStore = {
        DocumentNode: function (x, y) {
          value: { };

          var documentNode = self.documentNodes[y];
          if (documentNode === undefined) {
            documentNode = this;
            self.documentNodes[y] = (documentNode);
          }

          return documentNode;
        }
      };

      this.sessions = {
        authenticate: function(token) {
          var status = {
            session: {
              data: {
                $: function(cacheKey) {
                  var cachedEntry = {
                    exists: false,
                    setDocument: function(document) {}
                  }
                  return cachedEntry;

                }
              }
            }
          }

          return status;
        }
      }

      documents.init.call(this);
      done();
    });

    it("can get all documents by ehrId from an openEHR instance", function (done) {

      var ivorCoxNhsId = 9999999000;

      var messageObj = {
        path: '/api/documents/patient/' + ivorCoxNhsId,
        method: 'GET',
        headers: {
          cookie: 'JSESSIONID=1234567890'
        }
      };

      documents.api.call(this, messageObj, function (response) {
        expect(response.length).toBeGreaterThan(0);
        done();
      });
    }, 10000);

    it("can get a document by compositionId from an openEHR instance", function (done) {

      const ivorCoxNhsId = 9999999000;
      const documentCompositionId = 'ddfaa35e-e9f8-4bb8-b296-91ecd35c6c1b::ripple_osi.ehrscape.c4h::1'

      var messageObj = {
        path: '/api/documents/patient/' + ivorCoxNhsId + '/' + documentCompositionId,
        method: 'GET',
        headers: {
          cookie: 'JSESSIONID=1234567890'
        }        
      };

      documents.api.call(this, messageObj, function (response) {
        expect(response.sourceId).toEqual(documentCompositionId);
        expect(response.source).toEqual('marand');
        expect(response.documentType).toEqual('Discharge summary');
        expect(response.documentDate).toBeDefined();

        done();
      });
    }, 10000);
  });
});
