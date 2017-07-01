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

  30 June 2017

*/

var setTransferOfCare = require('./setTransferOfCare');
var getTransferOfCareSummary = require('./getTransferOfCareSummary');
var getTransferOfCareDetail = require('./getTransferOfCareDetail');
var spv = require('../patients/spv');

function postEvent(args, callback) {
  if (args.eventType === 'toc') {
    return setTransferOfCare.call(this, args, callback);
  }

  callback({error: args.eventType + ' is not a valid event type'});
}

function getAll(args, callback) {
  if (args.eventType === 'toc') {
    return getTransferOfCareSummary.call(this, args, callback);
  }

  // assume that eventType is actually a sourceId for all other events

  args.sourceId = args.eventType;
  args.heading = 'events';
  spv.getHeadingDetail(args, callback);
}

function getOne(args, callback) {
  if (args.eventType === 'toc') {
    return getTransferOfCareDetail.call(this, args, callback);
  }

  callback({error: args.eventType + ' is not a valid event type'});
}

module.exports = {
  post: postEvent,
  getAll: getAll,
  getOne: getOne
};
