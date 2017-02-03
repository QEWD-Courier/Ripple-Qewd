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

// function init() {
//     openEHR.init.call(this);
// }

function postDocument(nhsNumber, templateId, document, host, callback) {
    console.log('** documents.postDocument: ' + JSON.stringify(document));

    if(nhsNumber !== undefined && templateId !== undefined) {
        openEHR.startSession('ethercis', function(session) {
            console.log('**** inside startSession callback - sessionId = ' + session.id);
            openEHR.mapNHSNoByHost(nhsNumber, host, session.id, function(ehrId) {
                makeRequest(ehrId, document, templateId, host, session.id,  function() {
                    openEHR.stopSession(host, session.id);
                    callback({info: 'document saved'});  
                });
            });
        });
    }
    else {
        // error - no patient id or template id
    }
}

function makeRequest(ehrId, body, templateId, host, sessionId, callback) {
  // ready to post
    var params = {
      host: host,
      callback: callback,
      url: '/rest/v1/composition',
      queryString: {
        templateId: templateId, 
        ehrId: ehrId,
        format: 'FLAT'
      },
      method: 'POST',
      session: sessionId,
      options: {
        body: body
      }
    };    

    console.log('**** about to post data: ' + JSON.stringify(params, null, 2));
    openEHR.request(params);
}

module.exports = {
    //init: init,
    post: postDocument
};