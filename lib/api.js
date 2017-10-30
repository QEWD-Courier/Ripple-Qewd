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

  30 October 2017

*/

var router = require('qewd-router');
var routes;

var initialise = require('./user/initialise');
var authenticate = require('./sessions/authenticate');
var mpv = require('./patients/mpv'); // Multiple Patient View
var spv = require('./patients/spv'); // Single Patient View
var getUser = require('./user/getUser');
var getApplicationData = require('./application/getApplicationData');
var setApplicationData = require('./application/setApplicationData');
var patientSummary = require('./patients/patientSummary');
var patientHeadingTable = require('./patients/patientHeadingTable');
var patientHeadingDetail = require('./patients/patientHeadingDetail');
var postHeading = require('./patients/postHeading');
var deleteHeading = require('./patients/deleteHeading');
var dicom = require('./dicom/dicom');
var clinicalStatements = require('./clinicalStatements/clinicalStatements');
var events = require('./events/endpoints');
var advancedSearch = require('./patients/advancedSearch');
var clinicalSearch = require('./clinicalSearch/clinicalSearch');
var getDocumentSummary = require('./documents/getDocumentSummary');
var getDocumentDetail = require('./documents/getDocumentDetail');
var getPictures = require('./pictures/getPictures');
var getPicture = require('./pictures/getPicture');
var savePicture = require('./pictures/savePicture');
var updatePicture = require('./pictures/updatePicture');
var getAvailableOrders = require('./terminology/availableOrders');
var searchByPatient = require('./search/byPatient');
var contentStore = require('qewd-content-store').rest;
var getSessionToken = require('./auth0/token');

var setTransferOfCare = require('./events/setTransferOfCare');
var getTransferOfCareSummary = require('./events/getTransferOfCareSummary');
var getTransferOfCareDetail = require('./events/getTransferOfCareDetail');
var createSession = require('./sessions/create');
var ui = require('./ui');

var postDocumentOld = require('./documents/documents').postDocument;
var postDocument = require('./documents/postDocument'); // *** incomplete - will replace postDocumentOld


module.exports = {

  init: function() {
    if (this.initialised) return;
    var q = this;

    if (this.isFirst) {
      console.log('************');
      console.log('**** clearing down ripple cache Globals ********');
      console.log('************');
      new this.documentStore.DocumentNode('ripplePAS').delete();
      //new this.documentStore.DocumentNode('ripplePatients').delete();
      new this.documentStore.DocumentNode('rippleGPs').delete();
      new this.documentStore.DocumentNode('rippleMedicalDepts').delete();
      new this.documentStore.DocumentNode('rippleNHSNoMap').delete();
      new this.documentStore.DocumentNode('rippleEhrIdMap').delete();
    }

    mpv.init.call(this);
    spv.init.call(this);
    contentStore.init.call(this);
    this.initialised = true;

    routes = [
      {
        url: '/api/initialise',
        method: 'GET',
        handler: initialise
      },
      {
        url: '/api/patients/advancedSearch',
        method: 'POST',
        handler: advancedSearch
      },
      {
        url: '/api/patients/querySearch',
        method: 'POST',
        handler: clinicalSearch
      },
      {
        url: '/api/patients/:patientId/events/toc',
        method: 'GET',
        handler: getTransferOfCareSummary
      },
      {
        url: '/api/patients/:patientId/events/toc',
        method: 'POST',
        handler: setTransferOfCare
      },
      {
        url: '/api/patients/:patientId/events/toc/:sourceId',
        method: 'GET',
        handler: getTransferOfCareDetail
      },
      {
        url: '/api/patients/:patientId/clinicalStatements',
        method: 'GET',
        handler: clinicalStatements.getSummary
      },
      {
        url: '/api/patients/:patientId/clinicalStatements',
        method: 'POST',
        handler: clinicalStatements.post
      },
      {
        url: '/api/patients/:patientId/clinicalStatements/:sourceId',
        method: 'GET',
        handler: clinicalStatements.getDetail
      },
      {
        url: '/api/patients/:patientId/dicom/:sourceId/:identifier/:subId',
        method: 'GET',
        handler: dicom.detailL3
      },
      {
        url: '/api/patients/:patientId/dicom/:sourceId/:identifier',
        method: 'GET',
        handler: dicom.detailL2
      },
      {
        url: '/api/patients/:patientId/dicom/:sourceId',
        method: 'GET',
        handler: dicom.studies
      },
      {
        url: '/api/patients/:patientId/:heading/:sourceId',
        method: 'GET',
        handler: patientHeadingDetail
      },
      {
        url: '/api/patients/:patientId/:heading/:sourceId',
        method: 'DELETE',
        handler: deleteHeading
      },
      {
        url: '/api/patients/:patientId/:heading',
        method: 'GET',
        handler: patientHeadingTable
      },
      {
        url: '/api/patients/:patientId/:heading',
        method: 'POST',
        handler: postHeading
      },
      {
        url: '/api/patients/:patientId',
        method: 'GET',
        handler: patientSummary.get
      },
      {
        url: '/api/patients',
        method: 'GET',
        handler: mpv.getPatients
      },
      {
        url: '/api/user',
        method: 'GET',
        handler: getUser
      },
      {
        url: '/api/application',
        method: 'GET',
        handler: getApplicationData
      },
      {
        url: '/api/application',
        method: 'POST',    
        handler: setApplicationData
      },
      {
        url: '/api/application',
        method: 'PUT',    
        handler: setApplicationData
      },
      {
        url: '/api/documents/patient/:patientId/:sourceId',
        method: 'GET',    
        handler: getDocumentDetail
      },
      {
        url: '/api/documents/patient/:patientId',
        method: 'GET',    
        handler: getDocumentSummary
      },
      {
        url: '/api/documents/patient/:patientId/:host',
        method: 'POST',    
        handler: postDocumentOld
      },
      {
        url: '/api/documents/new/patient/:patientId/:host',',
        method: 'POST',    
        handler: postDocument
      },
      {
        url: '/api/pictures/:patientId',
        method: 'GET',    
        handler: getPictures
      },
      {
        url: '/api/pictures/:patientId',
        method: 'POST',
        handler: savePicture
      },
      {
        url: '/api/pictures/:patientId/:sourceId',
        method: 'PUT',
        handler: updatePicture
      },
      {
        url: '/api/pictures/:patientId/:sourceId',
        method: 'GET',
        handler: getPicture
      },
      {
        url: '/api/terminology/list/order',
        method: 'GET',
        handler: getAvailableOrders
      },
      {
        url: '/api/search/patient/table',
        method: 'POST',
        handler: searchByPatient
      },
      {
        url: '/api/contentStore/:storeName/phrases',
        method: 'GET',
        handler: contentStore.getPhrases
      },
      {
        url: '/api/contentStore/:storeName/tags',
        method: 'GET',
        handler: contentStore.getTags
      },
      {
        url: '/api/ui/:uiType',
        method: 'GET',
        handler: ui.swap
      } 

      /*
      {
        url: '/api/token',
        method: 'GET',
        handler: getSessionToken  // for Auth0 session establishment
      }
      */
    ];

    routes = router.initialise(routes, module.exports);
    router.setErrorResponse(404, 'Not Found');

    this.setCustomErrorResponse.call(this, {
      //application: application,
      application: 'api',
      errorType: 'noTypeHandler',
      text: 'Resource Not Found',
      statusCode: '404'
    });
    
  },

  restModule: true,

  beforeHandler: function(messageObj, finished) {

    console.log('beforeHandler - messageObj = ' + JSON.stringify(messageObj));

    if (messageObj.expressType === 'auth0-register') return;

    if (messageObj.path !== '/api/initialise' && messageObj.path !== '/api/token') {

      // authenticate the request

      var status = authenticate.call(this, messageObj);
      if (status.error) {
        finished(status);
        return false;
      }
      messageObj.session = status.session;
    }
  },

  handlers: {

    'auth0-register': function(messageObj, finished) {
      // handle callback from Auth0 - create session, store JWT data and return token to browser

      var session = createSession.call(this);
      session.authenticated = true;
      session.data.$('auth0').setDocument(messageObj.params);
      finished({token: session.token});
    },
    'webrtc:confirmSession': function(messageObj, session, send, finished) {
      // if it got here, the user has a valid session

      finished({
        ok: true
      });
    }
  }
};

