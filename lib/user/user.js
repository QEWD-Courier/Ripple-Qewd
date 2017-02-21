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

  16 February 2017

*/

function authenticate(messageObj) {
  var cookie = messageObj.headers.cookie;
  if (!cookie) return {error: true};

  var pieces = cookie.split(';');
  var token;
  pieces.forEach(function(piece) {
    if (piece.indexOf('JSESSIONID') !== -1) {
      token = piece.split('JSESSIONID=')[1];
    }
  });

  // this logic needs to change / be adapted once proper identity management added


  if (!token) {error: true};
  //console.log('token = ' + token);
  var status = this.sessions.authenticate(token);
  //console.log('status: ' + JSON.stringify(status));
  return status;
}


function user(messageObj, finished) {

  var status = authenticate.call(this, messageObj);
  var session;
  if (status.error) {
    // no session yet established for client
    //  or previous session expired

    // create a new session

    session = this.sessions.create('qewd-ripple', 3600);
    session.authenticated = true;

    // create simulated user in QEWD Session

    var user = {
      sub: '28AD8576-1948-4C84-8B5E-55FB7EE027CE',
      given_name: 'Bob',
      family_name: 'Smith',
      email: 'bob.smith@gmail.com',
      scope: {
        homeView: 'chart',
        autoAdvancedSearch: !1,
        setting2: !0,
        setting3: !0
      },
      tenant_id: 'Ripple',
      tenant_name: 'Ripple Demonstrator',
      role: 'IDCR'
    };

    session.data.$('auth0').$('_json').setDocument(user);

    // the UI will need to be reloaded now to avoid timing issues
    finished({error: {token: session.token, reload: true}});
    return;
  }

  // normal route - session exists so fetch patient data

  session = status.session;
  var json = session.data.$('auth0').$('_json').getDocument();

  var role = json.role.toUpperCase();

  var user = {
    sub: json.sub,
    //username: 'rob.tweed',
    //permissions: ['READ'],
    given_name: json.given_name,
    family_name: json.family_name,
    email: json.email,
    /*
    scope: {
      homeView: 'chart',
      autoAdvancedSearch: !1,
      setting2: !0,
      setting3: !0
    },
    tenant_id: 'Ripple',
    tenant_name: 'Ripple Demonstrator',
    */
    tenant: null,
    role: role,
    roles: [role]
  };

  if (json.role === 'PHR') user.nhsNumber = '9999999000';

  // Auth0-registered users have name details in user_metadata sub-object!

  if (!json.given_name && json.user_metadata.given_name) user.given_name = json.user_metadata.given_name;
  if (!json.family_name && json.user_metadata.family_name) user.family_name = json.user_metadata.family_name;

  finished(user);

}

module.exports = user;
