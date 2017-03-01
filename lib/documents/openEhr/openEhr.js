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

  01 February 2017

*/
var get = require('./repository/get');
var post = require('./repository/post');

const path = './';

var types = {
  referrals: require(path + 'referrals'),
  discharges: require(path + 'discharge')
};

function getAllByNhsNumber(nhsNum, callback) {
  // TODO - look in cache
  get.get(nhsNum, types, callback);

  // TODO - put in cache
}

function getOneByCompositionId(nhsNum, documentId, callback) {    
    get.get(nhsNum, types, function(openEhrDocuments) {
      for(var openEhrDocument in openEhrDocuments) {
            const composition = openEhrDocuments[openEhrDocument].composition;
            const sourceId = getDocumentHandler(composition).getSourceId(composition);

            if(sourceId === documentId) {
              // TODO - terminate the loop?
              callback(openEhrDocuments[openEhrDocument]);
            }
        }
    });
}

function postOne(nhsNum, openEhrDocument, host, callback) {
  const templateId = getDocumentHandler(openEhrDocument).getTemplateId();
  
  post.post(nhsNum, openEhrDocument, templateId, host, callback);
}

function getDocumentHandler(openEhrDocument) {
  var document;
  
  const properties = Object.keys(types);
  for(var p = 0; (p < properties.length && document === undefined); p++) {
    const currentDocument = types[properties[p]];
    
    if(currentDocument.canHandle(openEhrDocument)) {
      document = currentDocument;
    }
  }

  return document;
}

module.exports = {
    init: function() {
        get.init.call(this);
    },   
    getAllByNhsNumber: getAllByNhsNumber,
    getOneByCompositionId: getOneByCompositionId,
    postOne: postOne
};