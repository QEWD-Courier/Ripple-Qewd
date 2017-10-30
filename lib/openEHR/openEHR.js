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

  26 July 2017

*/

var request = require('request');
var servers = require('./servers');

var q;

function openEHRRequests(params, userObj) {

  var noOfServers = 0;
  for (var host in servers) {
    noOfServers++;
  }
  var count = 0;
  var options;
  var url;

  for (var host in servers) {

    if (params.type === 'startSessions' && params.session) {
      // when starting sessions, try to use a cached one instead if possible

      var cachedSession = params.session.data.$(['openEHR', 'sessions', host]);
      if (cachedSession.exists) {
        var now = new Date().getTime();
        if ((now - cachedSession.$('creationTime').value) < 600000) {
          // should be OK to use cached Session
          console.log('** using cached session for ' + host);
          userObj[host] = cachedSession.$('id').value;
          count++;
          if (count === noOfServers && params.callback) {
            params.callback(userObj);
          }
          continue; // move to next host
        }
        else {
          // delete expired cached session
          console.log('** deleting expired cached session for ' + host);
          stopSession(host, cachedSession.$('id').value);  // tell OpenEHR server to delete it too, just in case
          cachedSession.delete();
        }
      }
    }

    if (params.type === 'stopSessions' && params.session) {
      // only stop sessions that are over 10 minutes old
      var cachedSession = params.session.data.$(['openEHR', 'sessions', host]);
      if (cachedSession.exists) {
        var now = new Date().getTime();
        if ((now - cachedSession.$('creationTime').value) < 600000) {
          // don't stop this session or remove it from cache
          console.log('** cached session for ' + host + ' not shut down');
          count++;
          if (count === noOfServers && params.callback) {
            params.callback(userObj);
          }
          continue;  // move to next host
        }
        else {
          //remove cached session id and continue to send request to shut it down on OpenEHR system
          console.log('** shutting down session for ' + host);
          cachedSessions.$(host).delete();
        }
      }
    }
    
    if (params.dontAsk && params.dontAsk[host]) {
      console.log(' *** openEHRRequests: dontAsk set for ' + host + ' / so not sending request!');
      count++;
      if (count === noOfServers && params.callback) {
        //console.log('** heading ' + params.heading + '; host ' + host + '; callback being invoked:');
        params.callback(userObj);
      }

      continue; // ignore this host
    }

    url = servers[host].url + params.url;
    options = {
      url: url,
      method: params.method || 'GET',
      json: true
    };
    if (params.useSessionId !== false) {
      if (!params.sessions[host]) {
        // No session available for this server!
        console.log('**** No session available for host ' + host);
        count++;

        if (count === noOfServers && params.callback) {
          //console.log('** heading ' + params.heading + '; host ' + host + '; callback being invoked:');
          params.callback(userObj);
        }
        continue;  // skip this host
      }
      options.headers = {
        'Ehr-Session': params.sessions[host]
      }
    }
    if (params.queryString) options.qs = params.queryString;
    if (params.type === 'startSessions') {
      if (!options.qs) options.qs = {};
      options.qs.username = servers[host].username;
      options.qs.password = servers[host].password;
    }
    if (params.hostSpecific) {
      for (var param in params.hostSpecific[host]) {
        options[param] = params.hostSpecific[host][param];
      }
    }
    var now = new Date().toUTCString();
    console.log(now + '; request to ' + host + ': ' + JSON.stringify(options));
    (function(host, params, noOfServers) {
      request(options, function(error, response, body) {
        if (error) {
          console.log('error returned from ' + host + ': ' + error);
        }
        else {
          var err = false;
          var now = new Date().toUTCString();
          console.log(now + '; response from ' + host + ': ' + JSON.stringify(body));
          if (!body) {
            console.log('***** no body returned from ' + host);
            console.log('response: ' + JSON.stringify(response));
            err = true;
          }
          if (body && typeof body === 'string') {
            console.log('body returned from ' + host + ' is a string');
            if (body.substring(0, 6) === '<html>') {
              err = true;
            }
          }
          //if (body && typeof body !== 'string' && params.processBody) params.processBody(body, host, userObj);
          if (!err && params.processBody) {
            params.processBody(body, host, userObj);
          }
        }
        count++;
        //console.log('** heading ' + params.heading + '; host ' + host + '; count = ' + count + '; noOfServers = ' + noOfServers);
        if (count === noOfServers && params.callback) {
          //console.log('** heading ' + params.heading + '; host ' + host + '; callback being invoked:');
          params.callback(userObj);
        }
      });
    }(host, params, noOfServers));
  }
}

function openEHRRequest(params, userObj) {

  // request to single OpenEHR system

  /*
    params = {
      host: 'marand' | 'ethercis'
      method: 'POST' | 'GET' etc
      url: '/rest/v1/composition'
      session: {{OpenEHR Session Id}},
      queryString: 'templateId=IDCR - Adverse Reaction List.v1&ehrId=cd8abecd-9925-4313-86af-93aab4930eae&format=FLAT
      options: {
        // any specific options such as alternative qs or body
      },
      processBody: function() {...},
      callback: function(userObj) {...}
    }
  */
  
  var host = params.host;

  if (params.type === 'startSession' && params.qewd_session) {
    // when starting a session, try to use a cached one instead if possible

    var cachedSession = params.qewd_session.data.$(['openEHR', 'sessions', host]);
    if (cachedSession.exists) {
      var now = new Date().getTime();
      if ((now - cachedSession.$('creationTime').value) < 600000) {
        // should be OK to use cached Session
        console.log('** using cached session for ' + host);
        userObj.id = cachedSession.$('id').value;
        if (params.callback(userObj)) params.callback(userObj);
        return;
      }
      else {
        // delete expired cached session
        console.log('** deleting expired cached session for ' + host);
        stopSession(host, cachedSession.$('id').value);  // tell OpenEHR server to delete it too, just in case
        cachedSession.delete();
      }
    }
  }

  if (params.type === 'stopSession' && params.qewd_session) {
    // only stop sessions that are over 10 minutes old
    var cachedSession = params.qewd_session.data.$(['openEHR', 'sessions', host]);
    if (cachedSession.exists) {
      var now = new Date().getTime();
      if ((now - cachedSession.$('creationTime').value) < 600000) {
        // don't stop this session or remove it from cache
        console.log('** cached session for ' + host + ' not shut down');
        if (params.callback) params.callback(userObj);
        return;
      }
      else {
        //remove cached session id and continue to send request to shut it down on OpenEHR system
        console.log('** shutting down session for ' + host);
        cachedSessions.$(host).delete();
      }
    }
  }

  var url = servers[host].url + params.url;
  var options = {
    url: url,
    method: params.method || 'GET',
    json: true
  };
  if (params.session) {
    options.headers = {
      'Ehr-Session': params.session
    };
  }
  if (params.queryString) options.qs = params.queryString;
  if (params.options) {
    for (var param in params.options) {
      options[param] = params.options[param];
    }
  }
  console.log('request to ' + host + ': ' + JSON.stringify(options));
  request(options, function(error, response, body) {
    if (error) {
      console.log('error returned from ' + host + ': ' + error);
    }
    else {
      console.log('response from ' + host + ': ' + JSON.stringify(body));
      //if (!body) console.log('***** no body returned from ' + host);
      //if (body && typeof body === 'string') console.log('body returned from ' + host + ' is a string');
      //if (body && typeof body !== 'string' && params.processBody) params.processBody(body, host, userObj);
      if (params.processBody) params.processBody(body, userObj);
    }
    if (params.callback) params.callback(userObj);
  });
}

function startSessions(session, callback) {
  var sessions = {};

  if (!callback) {
    callback = session;
    session = false;
  }

  var params = {
    type: 'startSessions',
    session: session,
    callback: callback,
    url: '/rest/v1/session',
    /*
    queryString: {
      username: username,
      password: password
    },
    */
    method: 'POST',
    useSessionId: false
  };
  params.processBody = function(body, host, sessions) {
    if (body && body.sessionId) {
      sessions[host] = body.sessionId;

      // cache the OpenEHR Session Id
      if (session) {
        session.data.$(['openEHR', 'sessions', host]).setDocument({
          creationTime: new Date().getTime(),
          id: body.sessionId
        });
        console.log('** session for ' + host + ': ' + body.sessionId + ' has been cached');
      }
    }
  };
  openEHRRequests(params, sessions);
}

function startSession(host, session, callback) {
  var params = {
    host: host,
    type: 'startSession',
    qewd_session: session,
    callback: callback,
    url: '/rest/v1/session',
    queryString: {
      username: servers[host].username,
      password: servers[host].password
    },
    method: 'POST'
  };
  params.processBody = function(body, session) {
    if (body && body.sessionId) session.id = body.sessionId;
    console.log('*** processBody: sessionId = ' + session.id);
  };
  openEHRRequest(params, {});
}

function stopSessions(sessions, session, callback) {
  console.log('** stopSessions invoked with sessions: ' + JSON.stringify(sessions));
  console.log('*** stopSessions - QEWD Session: ' + session.id);
  var params = {
    type: 'stopSessions',
    session: session,
    callback: callback,
    url: '/rest/v1/session',
    /*
    queryString: {
      username: username,
      password: password
    },
    */
    method: 'DELETE',
    sessions: sessions
  };
  openEHRRequests(params, sessions);
}

function stopSession(host, sessionId, session, callback) {
  var params = {
    type: 'stopSession',
    host: host,
    callback: callback,
    url: '/rest/v1/session',
    /*
    queryString: {
      username: username,
      password: password
    },
    */
    method: 'DELETE',
    session: sessionId,
    qewd_session: session
  };
  openEHRRequest(params);
}

function mapNHSNo(nhsNo, sessions, callback) {
  
  var nhsNoMap = new q.documentStore.DocumentNode('rippleNHSNoMap', [nhsNo]);

  // check that all mapped values exist - otherwise rebuild

  var missingMap = false;
  for (var host in servers) {
    if (!nhsNoMap.$(host).exists) missingMap = true;
  }

  if (!missingMap) {
    if (callback) callback();
    return;
  }

  var params = {
    callback: callback,
    url: '/rest/v1/ehr',
    queryString: {
      subjectId: nhsNo,
      subjectNamespace: 'uk.nhs.nhs_number'
    },
    method: 'GET',
    sessions: sessions
  };
  params.processBody = function(body, host) {
    if (body && body.ehrId) {
      var nhsNoMap = new q.documentStore.DocumentNode('rippleNHSNoMap', [nhsNo, host]);
      nhsNoMap.value = body.ehrId;
      var ehrIdMap = new q.documentStore.DocumentNode('rippleEhrIdMap', [host, body.ehrId]);
      ehrIdMap.value = nhsNo;
    }
  };
  openEHRRequests(params);
}

function mapNHSNoByHost(nhsNo, host, sessionId, callback) {
  var ehrId;
  var nhsNoMap = new q.documentStore.DocumentNode('rippleNHSNoMap', [nhsNo, host]);
  if (nhsNoMap.exists) {
    ehrId = nhsNoMap.value;
    if (callback) callback(ehrId);
    return;
  }

  var params = {
    host: host,
    callback: callback,
    url: '/rest/v1/ehr',
    queryString: {
      subjectId: nhsNo,
      subjectNamespace: 'uk.nhs.nhs_number'
    },
    method: 'GET',
    session: sessionId
  };
  params.processBody = function(body, ehrId) {
    var nhsNoMap = new q.documentStore.DocumentNode('rippleNHSNoMap', [nhsNo, host]);
    nhsNoMap.value = body.ehrId;
    ehrId = body.ehrId;
    var ehrIdMap = new q.documentStore.DocumentNode('rippleEhrIdMap', [host, body.ehrId]);
    ehrIdMap.value = nhsNo;
  };
  openEHRRequest(params, ehrId);
}

function ehrIdAvailable(nhsNo) {
  var nhsNoMap = new q.documentStore.DocumentNode('rippleNHSNoMap', [nhsNo]);
  return nhsNoMap.exists;
};

function getEhrId(nhsNo, host) {
  var nhsNoMap = new q.documentStore.DocumentNode('rippleNHSNoMap', [nhsNo, host]);
  return nhsNoMap.value;
};

function init() {
  q = this;

  if (this.userDefined.rippleUser && this.userDefined.rippleUser.server) {
    servers[this.userDefined.rippleUser.pasModule] = this.userDefined.rippleUser.server;
  }
}

module.exports = {
  init: init,
  servers: servers,
  //username: username,
  //password: password,
  requests: openEHRRequests,
  request: openEHRRequest,
  startSessions: startSessions,
  stopSessions: stopSessions,
  startSession: startSession,
  stopSession: stopSession,
  mapNHSNo: mapNHSNo,
  mapNHSNoByHost: mapNHSNoByHost,
  idsAvailable: ehrIdAvailable,
  getEhrId: getEhrId
};
