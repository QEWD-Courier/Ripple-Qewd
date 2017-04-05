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

  4 April March 2017

*/


var traverse = require('traverse');

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function flatten(obj) {
  var flatObj = {};

  var outputObj = traverse(obj).map(function(node) {
    if (this.isLeaf) {
      var flatPath = '';
      var slash = '';
      var colon = '';
      this.path.forEach(function(path) {
        if (isNumeric(path)) {
          flatPath = flatPath + colon + path
        }
        else {
          flatPath = flatPath + slash + path;
        }
        slash = '/';
        colon = ':';
      });
      flatObj[flatPath] = node;
    }
  });
  return flatObj;
}

module.exports = flatten;
