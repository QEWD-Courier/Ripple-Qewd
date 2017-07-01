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

  6 April 2017

*/

var headingsLib = require('../headings/headings');
var headings = headingsLib.headings;
var headingHelpers = require('../headings/headingHelpers');
var transform = require('qewd-transform-json').transform;

function patientHeadingDetail(patientId, headingName, sourceId, session) {

  if (!headings[headingName]) {
    console.log('*** ' + heading + ' has not yet been added to middle-tier processing');
    return {error: headingName + ' has not yet been added to middle-tier processing'};
  }

  var heading = headings[headingName].name;

  console.log('*** patientHeadingDetail - heading = ' + heading + '; session ' + session.id);

  var patient = session.data.$(['patients', patientId]);

  var patientHeadingIndex = patient.$(['headingIndex', heading]);

  //console.log('**** sourceId: ' + sourceId);
  var indexSource = patientHeadingIndex.$(sourceId);
  if (!indexSource.exists) {
    return {error: 'Invalid sourceId ' + sourceId + ' for patient ' + patientId + ' / heading ' + heading};
  }
  var index = indexSource.getDocument();

  if (typeof index.recNo === 'undefined' || index.recNo === '') {
    return {error: 'Unable to use the index to sourceId ' + sourceId + ' for patient ' + patientId + ' / heading ' + heading + ': recNo is missing'};
  }

  var patientHeading = patient.$(['headings', heading, index.host, index.recNo]);
  var input;
  if (typeof patientHeading === 'undefined') {
    input = {};
  }
  else {
    input = patientHeading.getDocument(true);
  }
  var template = headings[heading].get.transformTemplate;
  var helpers = headingHelpers(index.host, heading, 'get');

  console.log('**** patientHeadingDetail for ' + heading + '; host: ' + index.host + ': ' + JSON.stringify(input));

  var output = transform(template, input, helpers);

  console.log('*** output: ' + JSON.stringify(output));

  return output;
}

module.exports = patientHeadingDetail;
