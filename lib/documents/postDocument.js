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

  16 October 2017

*/

var transform = require('qewd-transform-json').transform;
var helperFns = require('./helpers');

var templates = {
  referral: require('./referral'),
  //discharge: require('./discharge');
};


function getDocumentType(rawDocument) {
  if (typeof rawDocument['REF_I12'] === 'undefined') {
    return false;
  }
  if (typeof rawDocument['REF_I12']['RF1'] !== 'undefined') {
    return 'referral';
  }
  if (typeof rawDocument['REF_I12']['DG1'] !== 'undefined') {
    return 'discharge';
  }
  return false;
}


function postDocument(args, finished) {

  console.log('postDocument');

  var host = args.host;
  if (host === undefined) {
    host = 'marand';
  }

  var rawDocument = args.req.body;

  if (typeof rawDocument === 'undefined') {
    return finished({error: 'No document was found in the body'});
  }

  if (typeof rawDocument !== 'object') {
    return finished({error: 'Invalid payload found in the body'});
  }

  var documentType = getDocumentType(rawDocument);
  if (!documentType) {
    return finished({error: 'Unrecognised HealthLink Document Type'});
  }

  var template = templates[documentType];
  var helpers = helperFns();
  var openEhrPayload = transform(template, rawDocument, helpers);

  //var nhsNum = healthlink.getInternalPatientId(args.req.body);

  finished({
    //nhsNum: nhsNum,
    documentType: documentType,
    document: openEhrPayload
  });
  return;

  openEhr.postOne(nhsNum, openEhrDocument, host, callback);
}

module.exports = postDocument;
