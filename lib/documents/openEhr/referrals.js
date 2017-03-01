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

function getTemplateId() {
    const templateId = 'iEHR - Healthlink - Referral.v0';

    return templateId;
}

function canHandle(openEhrDocument) {
    var isDocument = false;
    
    const properties = Object.keys(openEhrDocument);
    for(var p = 0; (p < properties.length && isDocument === false); p++) {
        const property = properties[p];
        isDocument = property.startsWith('referral');
    }

    return isDocument;
}

function getSourceId(openEhrDocument) {
  return openEhrDocument['referral/_uid'];
}

module.exports = {
    getTemplateId: getTemplateId,
    getSourceId: getSourceId,
    canHandle: canHandle
};