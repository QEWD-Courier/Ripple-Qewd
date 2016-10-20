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

18 October 2016

*/

var availableOrders = [
  {
    code: 'order1',
    text: 'Xray Chest X-ray'
  }, 
  {
    code: 'order2',
    text: 'Radiology-CT Head'
  },
  {
    code: 'order3',
    text: 'Cardiac-ECG'
  },
  {
    code: 'order4',
    text: 'Physio-crutches'
  }
];

function terminology(messageObj, finished) {
  //  /api/terminology/list/order
  if (messageObj.params['0'] === 'list/order') {
    finished(availableOrders);
    return;
  }
  finished([]);
}

module.exports = terminology;