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
var openEHR = require('../../../openEHR/openEHR');
var template = require('qewd-template');
var fs = require('fs');

var q;

function get(nhsNum, documentTypes, callback) {
  var documents = [];

  if (nhsNum !== undefined) {
    openEHR.startSessions(function (openEHRSessions) {
      openEHR.mapNHSNo(nhsNum, openEHRSessions, function () {
        var type;
        var documentCount;
        var documentType;
        // loop around for doc type
        for (type in documentTypes) {
          documentCount = 0;
          documentType = documentTypes[type];

          getDocumentCompositionIds(nhsNum, documentType, openEHRSessions, function (compositionIds) {
            const host = compositionIds.host;

            documentCount += compositionIds.ids.length;
            var compositionId;
            for (compositionId in compositionIds.ids) {
              getDocumentByCompositionId(compositionIds.ids[compositionId], host, openEHRSessions[host], function (openEhrDocument, source) {
                const document = {
                  source: source,
                  composition: openEhrDocument
                }
                documents.push(document);

                // we've processed all docs; time to invoke the callback
                if (documents.length === documentCount) {
                  callback(documents);
                }
              });
            }
          });
        }
      });
    });
  }
  else {
    console.log("Problem retireiving documents for patient. Cannot retrieve any documents as no NHS number has been supplied")
  }
}

function getDocumentCompositionIds(nhsNum, documentType, openEHRSessions, callback) {
  var params = {
    url: '/rest/v1/query',
    method: 'GET',
    sessions: openEHRSessions
  };

  // build queries to retrieve document composition Ids from each openEHR host    
  params.hostSpecific = {};
  for (var host in openEHR.servers) {
    const ehrId = openEHR.getEhrId(nhsNum, host);

    params.hostSpecific[host] = {
      qs: {
        aql: getCompositionIdAql(ehrId, documentType.getTemplateId())
      }
    };
  }

  params.processBody = function (body, host) {
    var compositionIds = {
      host: host,
      ids: []
    };
    for (var result in body.resultSet) {
      compositionIds.ids.push(body.resultSet[result].uid);
    }
    callback(compositionIds);
  };

  // run the query for this doc type
  openEHR.requests(params);
}

function getCompositionIdAql(ehrId, templateId) {
  var aql;

  const aqlTemplate = getCompositionIdAqlTemplate();

  var subs = {
    ehrId: ehrId,
    templateId: templateId
  }

  aql = template.replace(aqlTemplate, subs);

  return aql;
}

function getCompositionIdAqlTemplate() {
  var text;

  const templateFile = __dirname + '/getCompositionIds.aql';
  if (fs.existsSync(templateFile)) {
    text = '';
    fs.readFileSync(templateFile).toString().split(/\r?\n/).forEach(function (line) {
      text = text + ' ' + line;
    });
  }

  return text;
}

function getDocumentByCompositionId(compositionId, host, openEHRSession, callback) {
  var params = {
    url: '/rest/v1/composition/' + compositionId + '?format=FLAT',
    method: 'GET',
    host: host,
    session: openEHRSession
  };

  params.processBody = function (body, host) {
    callback(body.composition, host);
  };

  openEHR.request(params, host);
}

module.exports = {
  init: function () {
    q = this;
    openEHR.init.call(this);
  },
  get: get
};