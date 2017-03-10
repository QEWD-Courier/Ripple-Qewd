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

const path = './';

var types = {
  referrals: require(path + 'referrals'),
  discharges: require(path + 'discharge')
};

function toDetail(source, openEhrDocument) { 
  const documentHandler = getDocumentHandler(openEhrDocument);
    
  var canonicalDocument = {
    source: source,
    documentType: documentHandler.getDocumentType()
  };

  for (var openEhrFieldName in documentHandler.fieldMap) {
    var canonicalFieldName = documentHandler.fieldMap[openEhrFieldName].field;
    var childFieldMap = documentHandler.fieldMap[openEhrFieldName].fieldMap;

    if(childFieldMap) {     
      canonicalDocument[canonicalFieldName] = [];
      for(var element in openEhrDocument) {
        if(element.startsWith(openEhrFieldName)) {
          const indexStart = element.indexOf(":") + 1;
          const indexEnd = element.indexOf("/", indexStart);
          const indexValue = element.substr(indexStart, (indexEnd - indexStart));
                
          var childElement =  canonicalDocument[canonicalFieldName][indexValue];

          if(!childElement) {
            childElement = {};
            canonicalDocument[canonicalFieldName][indexValue] = childElement;
          }

                    // lookup the property in the childFieldMap
          for(var childEhrFieldName in childFieldMap) {
            if(element.endsWith(childEhrFieldName)) {
              var childRippleFieldName = childFieldMap[childEhrFieldName].field;
              childElement[childRippleFieldName] = openEhrDocument[element];
            }
          }
        }
      }
    }
    else {
      canonicalDocument[canonicalFieldName] = openEhrDocument[openEhrFieldName];
    }
  }
        
  return canonicalDocument;
}

function toSummary(source, openEhrDocument) {
  const canonicalDetail = toDetail(source, openEhrDocument);

  const canonicalSummary = {
    sourceId: canonicalDetail.sourceId,
    source: canonicalDetail.source,
    documentType: canonicalDetail.documentType,
    documentDate: canonicalDetail.documentDate
  };

  return canonicalSummary;
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
  toDetail: toDetail,
  toSummary: toSummary
};