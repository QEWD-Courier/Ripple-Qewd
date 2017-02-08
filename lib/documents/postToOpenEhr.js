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
var openEHR = require('../openEHR/openEHR');
var healthlink = require('./healthlink');

function post(args, callback) {
    var host = 'marand';

    console.log('** documents.postToOpenEhr: ' + JSON.stringify(args));
    var transformer = healthlink[args.documentType];

    if (typeof transformer === "function") {
        var document = transformer.call(this, args.req.body, callback);
        var nhsNum = healthlink.getInternalPatientId(args.req.body);
        var templateId = healthlink.getTemplateId(args.documentType);

        if(nhsNum !== undefined && templateId !== undefined) {
            openEHR.startSession(host, function(session) {
                getEhrId(nhsNum, session, host, function(ehrId) {
                    postDocument(ehrId, templateId, document, session, host, function(result) {
                        openEHR.stopSession(host, session.id);

                        var response = {documentCompositionId : undefined};
                        if(postSuccessful(result)) {
                            console.log('successfully saved document to ' + host + ' with compositionId ' + result.compositionUid);
                            response.documentCompositionId = result.compositionUid
                        }
                        else {
                            console.log('failed to save document to ' + host + ': ' + result);
                        }

                        callback(response);
                    });
                });
            });
        }
        else {
           console.log('unable to save document to ' + host + '. One or both of templateId (' + templateId + ') and nhsNum (' + nhsNum + ') were not set');
        }        
    }
}

function getEhrId(nhsNum, session, host, callback) {
    var params = {
        url: '/rest/v1/ehr',
        queryString: {
          subjectId: nhsNum,
          subjectNamespace: 'uk.nhs.nhs_number'
        },
        method: 'GET',
        host: host,
        session: session.id
    };

    params.processBody = function(body) {
        callback(body.ehrId);
    };

    openEHR.request(params);
}

function postDocument(ehrId, templateId, document, session, host, processBody) {
    openEHR.request({
       url: '/rest/v1/composition', 
       queryString: {
            templateId: templateId, 
            ehrId: ehrId,
            format: 'FLAT'
        }, 
        host: host,
        method: 'POST',
        session: session.id,
        processBody: processBody,
        options: {
            body: document
        }        
    });
}

function postSuccessful(result) {
    var success = false;

    success = ((result.action.indexOf('CREATE') != -1 && result.compositionUid !== undefined));
    
    return success;
}

module.exports = post;