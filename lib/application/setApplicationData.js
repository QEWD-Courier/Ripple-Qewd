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

  19 April 2017

*/


function setApplicationData(args, finished) {

  //console.log('*** setApplicationData: ' + JSON.stringify(args.req.body));

  var userType = args.session.data.$(['auth0', '_json', 'role']).value;

  // eventually we'll limit this to admin users - currently no restriction

  var appData = args.req.body;

  if (!appData.title || appData.title === '') {
    return finished({error: 'Invalid or missing title'});
  }
  if (!appData.logoB64 || appData.logoB64 === '') {
    return finished({error: 'Invalid or missing logo file'});
  }
  /*
  if (typeof appData.themeColors !== 'object') {
    return finished({error: 'Invalid or missing themeColors object'});
  }
  */
  if (!appData.themeColor || appData.themeColor === '') {
    return finished({error: 'Invalid or missing themeColor'});
  }
  if (!appData.browserTitle || appData.browserTitle === '') {
    return finished({error: 'Invalid or missing browser title'});
  }

  appData.logoB64 = appData.logoB64.match(/.{1,4000}/g);  // split into max 4000 chunks

  var appDataDoc = new this.documentStore.DocumentNode('rippleConfig', ['ui']);
  appDataDoc.delete();
  appDataDoc.setDocument(appData);

  return finished({
    ok: true,
    role: userType
  });
}

module.exports = setApplicationData;
