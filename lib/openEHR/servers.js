/*

 ----------------------------------------------------------------------------
 | rippleosi-ewd3: EWD3/ewd-xpress Middle Tier for Ripple OSI               |
 |                                                                          |
 | Copyright (c) 2016 Ripple Foundation Community Interest Company          |
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


 4 November 2016

*/

var servers = {
  marand: {
    url: 'https://ehrscape.code-4-health.org',
    queryType: 'aql',
    sourceName: 'Marand',
    username: 'c4h_ripple_osi',
    password: 'InDeCoMP'
  },
  ethercis: {
    //url: 'http://188.166.246.78:8080',
    url: 'http://178.62.71.220:8080', // test server
    queryType: 'sql',
    sourceName: 'EtherCIS',
    username: 'guest',
    password: 'guest'
  }
};

module.exports = servers;
