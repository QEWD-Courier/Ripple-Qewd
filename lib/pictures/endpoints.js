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

var router = require('qewd-router');
var authenticate = require('../sessions/authenticate');
var getPictures = require('./getPictures');
var getPicture = require('./getPicture');
var savePicture = require('./savePicture');
var updatePicture = require('./updatePicture');

var routes = [
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
  }
];

routes = router.initialise(routes);

function pictures(messageObj, finished) {

  var status = authenticate.call(this, messageObj);
  if (status.error) {
    finished(status);
    return;
  }

  router.process.call(this, messageObj, status.session, routes, function(results) {
    finished(results);
  });   
}

module.exports = {
  api: pictures
};
