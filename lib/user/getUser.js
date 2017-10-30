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

  12 July 2017

*/

var fetchFromPas = require('./fetchFromPas');

function user(args, finished) {

  var json = args.session.data.$(['auth0', '_json']).getDocument();

  var role = json.role.toUpperCase();

  var user = {
    sub: json.sub,
    given_name: json.given_name,
    family_name: json.family_name,
    email: json.email,
    tenant: null,
    role: role,
    roles: [role]
  };

  // Auth0-registered users have name details in user_metadata sub-object!

  if (!json.given_name && json.user_metadata.given_name) user.given_name = json.user_metadata.given_name;
  if (!json.family_name && json.user_metadata.family_name) user.family_name = json.user_metadata.family_name;

  if (json.role === 'PHR') {
    user.nhsNumber = '9999999000';  // currently hard-wired!

    // fetch patient data from PAS and save into session
    fetchFromPas.call(this, user.nhsNumber, args.session, function() {
      finished(user);
    });
    return;
  }

  finished(user);

}

module.exports = user;
