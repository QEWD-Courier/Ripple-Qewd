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

  30 October 2017

*/

var path = require('path');
var fs = require('fs-extra');

function swap(args, callback) {

  if (args.uiType !== 'react' && args.uiType !== 'angular') {
    return callback({error: 'Invalid UI: must be react or angular'});
  }

  var fromPath = path.resolve(process.cwd(), '..', 'ui-dist', args.uiType);
  var toPath = path.resolve(process.cwd(), 'www');
  fs.copySync(fromPath, toPath);

  callback({
    ok: true,
    ui: args.uiType
  });
}

module.exports = {
  swap: swap
};
