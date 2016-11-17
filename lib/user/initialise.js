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

9 November 2016

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
  console.log('token = ' + token);
  var status = this.sessions.authenticate(token);
  console.log('status: ' + JSON.stringify(status));
  return status;
}


function initialise(messageObj, finished) {

  var status = authenticate.call(this, messageObj);
  var session;
  var mode = this.userDefined.rippleMode; // uat or simulated-user


  if (status.error) {
    // no session yet established for client
    //  or previous session expired

    // if uat mode, signal the browser to redirect to Auth0
    //   a new EWD session will be created by the redirect URL

    if (mode === 'uat') {
      finished({
        redirectTo: 'auth0'
      });
      return;
    }

    // OK we're in simulated user mode...

    // create a new session

    session = this.sessions.create('ewd-ripple', 3600);
    session.authenticated = true;

    // create simulated user in EWD Session

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
      role: 'idcr'
    };

    session.data.$('auth0').$('_json').setDocument(user);

    // browser will store new token as cookie and then fetch user

    finished({
      token: session.token,
      mode: mode
    });

    return;
  }

  // the JSESSIONID cookie was for an active EWD Session
  //  which will contain the user information, so just tell
  //  the browser to carry on and fetch the user info


  finished({
    ok: true,
    mode: mode
  });

  return;
}

module.exports = initialise;
