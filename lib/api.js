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

 6 October 2016

*/

var patients = require('./patients/patients');
var terminology = require('./terminology');
var search = require('./search/search');
var user = require('./user/user');
var initialise = require('./user/initialise');
var token = require('./auth0/token');
var mpv = require('./patients/mpv');
var openEHR = require('./openEHR/openEHR');

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
    }
    patients.init.call(this);
    this.initialised = true;
    
  },

  restModule: true,

  handlers: {

    checkToken: function(messageObj, session, send, finished) {

      /*
        See if the incoming ewd token from the browser's cookie is valid
         and not yet expired

        If it's still for an active EWD session, then link the new
         socket EWD session with the cookie-based EWD session

      */

      var token = messageObj.params.token;
      var status = this.sessions.authenticate(token);
      var expired = false;
      if (status.error) expired = true;

      if (!expired) {
        // link the sessions
        session.authenticated = true;
        session.timeout = 3600;
        session.updateExpiry();
        var cookieSession = status.session;
        cookieSession.data.$('ewd-session').$('socketSession').value = session.token;
        session.data.$('ewd-session').$('cookieSession').value = token;
      }
      else {
        // we'll use the new socket session
        //  the UI will set the token into the cookie
      }

      finished({expired: expired});
    },

    authenticate: function(messageObj, session, send, finished) {
      session.authenticated = true;
      session.timeout = 3600;
      session.updateExpiry();
      // populate the patient / PAS cache
      mpv.getPatients.call(this, {session: session});

      // set up new sessions to openEHR systems...
      openEHR.startSessions(function(openEHRSessions) {
        console.log('*** openEHR sessions created: ' + JSON.stringify(openEHRSessions));
        session.data.$('openEHR').setDocument(openEHRSessions);
        finished({ok: true});
      });
    },

    patients: function(messageObj, finished) {
      patients.api.call(this, messageObj, finished);
    },
    terminology: function(messageObj, finished) {
      terminology.call(this, messageObj, finished);
    },
    search: function(messageObj, finished) {
      search.call(this, messageObj, finished);
    },
    user: function(messageObj, finished) {
      user.call(this, messageObj, finished);
    },
    initialise: function(messageObj, finished) {
      initialise.call(this, messageObj, finished);
    },
    token: function(messageObj, finished) {
      token.call(this, messageObj, finished);
    },
    'auth0-register': function(messageObj, finished) {
      //var id = messageObj.params.id;
      var session = this.sessions.create('ewd-ripple', 3600);
      session.authenticated = true;
      session.data.$('auth0').setDocument(messageObj.params);
      finished({token: session.token});
    }
  }
};

