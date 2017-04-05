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

  9 March 2017

*/

/*

Clinical Statement Storage

  clinicalStatements('byPatient', patientId, sourceId) = 

{
    "type": "Clinical Note",
    "text": "Patient presented with shoulder pain.\r\nIf it doesn\'t improve, will need laparoscopic surgical exploration +/- repair",
    "tags": {
      "chestpain": true,
      "ortho": true
    },
    "dateCreated": 1489069889101,
    "author": "Dr John Smith",
    "source": "Ethercis"
    "data": [

      {"subject": "shoulder pain"},
      {"subject": "laparoscopic surgical exploration +/- repair"}
    ]
  }

*/

var postStatement = require('./postStatement');
var getSummary = require('./getSummary');
var getDetail = require('./getDetail');

module.exports = {
  getSummary: getSummary,
  getDetail: getDetail,
  post: postStatement
};
