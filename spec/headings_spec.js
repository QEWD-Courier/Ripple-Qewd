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
var dateTime = require('./../lib/dateTime');
var template = require('qewd-template');
var _ = require('underscore');

var hasAQL = function(heading) { return heading.query && heading.query.aql }
var forEachHeading = function(callback) {
  _.chain(headings.headings).filter(hasAQL).forEach(callback);
}

inOpenEHRSession(function(request, server) {
  describe("Ivor Cox on OpenEHR Server " + server, function() {
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
    forEachHeading(function(heading) {
      describe("GET AQL response of " + heading.name, function() {
        var result;
        beforeEach(function(done){
          spyOn(dateTime, 'getRippleTime');
          spyOn(dateTime, 'msSinceMidnight');
          var aql = template.replace(heading.query.aql,{
            patientId: ivorCoxNhsId, ehrId: ivorCoxEhrId
          });
          // Get and store the result of the heading
          request('/rest/v1/query', {aql:aql}, done, function(res) { result = res; });
        });

        it("returns a result", function() {
          expect(result.resultSet).toBeTruthy();
        });

        it("to contain all string mapped keys", function(){
          var record = result.resultSet[0];
          var stringMaps = _.chain(heading.fieldMap).values().filter(_.isString).value()

          stringMaps.forEach(function(key){
            expect(_.contains(_.keys(record), key)).toBe(true);
          });
        });

        it("to only map actual values using dateTime", function() {
          var record = result.resultSet[0];
          var functionMaps = _.chain(heading.fieldMap)
                              .values()
                              .filter(_.isFunction)
                              .each(function(mappingFunction){
            mappingFunction(record, null);
          })

          dateTime.getRippleTime.calls.all().forEach(function(call) {
            expect(call.args[0]).toBeDefined();
          });
          dateTime.msSinceMidnight.calls.all().forEach(function(call) {
            expect(call.args[0]).toBeDefined();
          });
        })
      });
    });
  });
});
