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


function create(obj, propertyName, value) {
  if (propertyName.indexOf(':') !== -1) {
    var pieces = propertyName.split(':');
    var prop = pieces[0];
    var pos = parseInt(pieces[1]);
    console.log('pos = ' + pos);
    if (!obj[prop] || !Array.isArray(obj[prop])) obj[prop] = [];
    if (!obj[prop][pos]) obj[prop][pos] = {};
    return obj[prop][pos];
  }
  if (!obj[propertyName]) {
    if (!value) obj[propertyName] = {};
  }
  if (value) obj[propertyName] = value;
  return obj[propertyName];
}

function flatJSONToObject(flatInput) {
  var pieces;
  var value;
  var output = {};
  //var pathStr;
  for (var path in flatInput) {
    //pathStr = path.split('|').join('/');
    value = flatInput[path];
    pieces = path.split('/');
    var obj = output;
    var count;
    var val;
    for (var i = 0; i < pieces.length; i++) {
      val = null;
      if (i === (pieces.length - 1)) val = value;
      obj = create(obj, pieces[i], val);
    }
  }
  return output;
}

module.exports = flatJSONToObject;
