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

  26 January 2017

*/

var patients = require('./patients/patients');
var terminology = require('./terminology');
var search = require('./search/search');
var user = require('./user/user');
var initialise = require('./user/initialise');
var token = require('./auth0/token');
var mpv = require('./patients/mpv');
var openEHR = require('./openEHR/openEHR');
var documents = require('./documents/documents');

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
    documents.init.call(this);
    this.initialised = true;
    
  },

  restModule: true,

  handlers: {

    checkToken: function(messageObj, session, send, finished) {

      /*
        See if the incoming QEWD token from the browser's cookie is valid
         and not yet expired

        If it's still for an active QEWD session, then link the new
         socket QEWD session with the cookie-based QEWD session

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
    documents: function(messageObj, finished) {
      documents.api.call(this, messageObj, finished);
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
      // handle callback from Auth0 - create session, store JWT data and return token to browser
      var session = this.sessions.create('qewd-ripple', 3600);
      session.authenticated = true;
      session.data.$('auth0').setDocument(messageObj.params);
      finished({token: session.token});
    },

    'webrtc:confirmSession': function(messageObj, session, send, finished) {
      // if it got here, the user has a valid session

      finished({
        ok: true
      });
    },

    'schemaEditor:save': function(messageObj, session, send, finished) {
      var no = messageObj.params.no;
      var name = messageObj.params.name;
      var schema = messageObj.params.schema;

      // compare incoming schema with current version if it exists

      if (typeof no !== 'undefined') {
        // fetch existing schema for selected option
        var lookup = session.data.$('schemas').$(no);
        console.log('lookup: ' + JSON.stringify(lookup));
        var version = lookup.$('version').value;
        var currentSchema = new this.documentStore.DocumentNode('rippleSchemas', [name, 'version', version, 'schema']).getDocument(true);
        
        // temporarily save new schema to serialise its contents

        var temp = session.data.$('temp');
        temp.delete();
        temp.setDocument(schema);
        var normalisedNewSchema = temp.getDocument(true);
        temp.delete();
        console.log('existing schema: ' + JSON.stringify(currentSchema));
        console.log('new schema: ' + JSON.stringify(normalisedNewSchema));
        if (JSON.stringify(currentSchema) === JSON.stringify(normalisedNewSchema)) {
          finished({ok: false, reason: 'No change to schema'});
          return;
        }

      }

      var example = messageObj.params.example;
      var schemaDB = new this.documentStore.DocumentNode('rippleSchemas', [name]);
      var versionNo = schemaDB.$('versionCounter').increment();
      var newVersion = schemaDB.$('version').$(versionNo);
      newVersion.$('schema').setDocument(schema);
      newVersion.$('example').value = JSON.stringify(example);  // stored as a string to prevent re-ordering on round-trips

      // append to session lookup by number array

      var lookup = session.data.$('schemas').getDocument(true);
      lookup.push({
        name: name,
        version: versionNo
      });
      session.data.$('schemas').delete();
      session.data.$('schemas').setDocument(lookup);

      finished({ok: true, name: name, version: versionNo});
    },

    'schemaEditor:getSchemas': function(messageObj, session, send, finished) {
      var schemaDB = new this.documentStore.DocumentNode('rippleSchemas');
      var schemas = [];
      var lookup = [];
      var count = 0;
      schemaDB.forEachChild(function(schemaName, schema) {
        var versions = schema.$('version');
        versions.forEachChild(function(versionNo) {
          //var name = schemaName + ' (version ' + versionNo + ')';
          schemas.push({
            no: count, 
            name: schemaName,
            version: versionNo
          });
          lookup.push({
            name: schemaName,
            version: versionNo
          });
          count++;
        });
      });
      if (messageObj.params.cleardown) session.data.$('schemas').delete();
      session.data.$('schemas').setDocument(lookup);
      finished(schemas);
    },

    'schemaEditor:getSchema': function(messageObj, session, send, finished) {
      var no = parseInt(messageObj.params.no);
      var lookup = session.data.$('schemas').$(no);
      var name = lookup.$('name').value;
      var version = lookup.$('version').value;
      var schemaDB = new this.documentStore.DocumentNode('rippleSchemas', [name, 'version', version]);
      var json = schemaDB.getDocument(true);
      finished(json);
    },

    'schemaEditor:saveForm': function(messageObj, session, send, finished) {
      var formDB = new this.documentStore.DocumentNode('rippleRecords');
      var index = formDB.increment();
      formDB.$(index).setDocument(messageObj.params.json);
      finished({ok: true});
    }

  }
};

