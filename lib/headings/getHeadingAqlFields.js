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

var headings = require('./headings');

function getFields(headingName) {
  var text = headings.getAQL(headingName);
  var pieces = text.split('as ');
  var fields = [];
  pieces.shift();  // remove the first piece before the first 'as '
  var last = pieces[pieces.length - 1];
  if (last.indexOf(' from') !== -1) {
    pieces[pieces.length - 1] = last.split(' from')[0];
  }
  pieces.forEach(function(piece) {
    var field = piece.split(',')[0];
    field = field.trim();
    fields.push(field);
  });
  return fields;
}

function getTestData(headingName) {
  var fields = getFields(headingName);
  var results = {};
  fields.forEach(function(field) {
    if (field.indexOf('date') !== -1) {
      results[field] = new Date();
    }
    else if (field === 'uid') {
      results[field] = 'f08cac13-362d-4b31-b3cc-76bd1e51c75d';
    }
    else {
      results[field] = 'The ' + field.split('_').join(' ');
    }
  });
  return results;
}

module.exports = {
  getFields: getFields,
  getTestData: getTestData
};

