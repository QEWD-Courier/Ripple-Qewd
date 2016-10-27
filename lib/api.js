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
var mpv = require('./patients/mpv');

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

    authenticate: function(messageObj, session, send, finished) {
      session.authenticated = true;
      session.timeout = 3600;
      session.updateExpiry();
      // populate the patient / PAS cache
      mpv.getPatients.call(this, {session: session});
      finished({ok: true});
    },

    patients: function(messageObj, finished) {
      patients.api.call(this, messageObj, finished);
    },
    terminology: function(messageObj, finished) {
      terminology.call(this, messageObj, finished);
    },


  }
};

