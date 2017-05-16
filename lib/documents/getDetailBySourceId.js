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

 10 March 2017

*/

var openEHR = require('../openEHR/openEHR');
var flatToObject = require('../flatJSONToObject');
var dischargeSummaryTemplate = require('./discharge_summary_template');
var referralTemplate = require('./referral_template');
var transform = require('qewd-transform-json').transform;
var dateTime = require('../dateTime');

function getDetailBySourceId(sourceId, host, openEHRSession, callback) {

  var params = {
    url: '/rest/v1/composition/' + sourceId + '?format=FLAT',
    method: 'GET',
    host: host,
    session: openEHRSession.id
  };

  var getTime = function(date) {
    return dateTime.getRippleTime(date, host);
  };

  params.processBody = function (body, host) {
    //console.log('*** body: ' + JSON.stringify(body));
    var doc = flatToObject(body.composition);
    // transform to Ripple UI format
    var output;
    if (doc.discharge_summary) {
      output = transform(dischargeSummaryTemplate, doc, {getTime: getTime});
      return callback(output);
    }
    else if (doc.referral) {
      output = transform(referralTemplate, doc, {getTime});
      return callback(output);
    }
    callback(doc);
  };

  openEHR.request(params, host);
}

module.exports = getDetailBySourceId;
