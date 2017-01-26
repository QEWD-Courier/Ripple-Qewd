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

  if (!token) {error: true};
  //console.log('token = ' + token);
  var status = this.sessions.authenticate(token);
  //console.log('status: ' + JSON.stringify(status));
  return status;
}


function user(messageObj, finished) {

  var status = authenticate.call(this, messageObj);
  var session;
  var reload = false;
  if (status.error) {
    // no session yet established for client
    //  or previous session expired

    // create a new session

    session = this.sessions.create('qewd-ripple', 3600);
    session.authenticated = true;
    // the UI will need to be reloaded now to avoid timing issues
    reload = true;
  }
  else {
    session = status.session;
  }


  finished({error: {token: session.token, reload: reload}});
  return;
}

module.exports = user;
