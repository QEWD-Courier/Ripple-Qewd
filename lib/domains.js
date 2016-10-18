/*

 ----------------------------------------------------------------------------
 | ewd-ripple: ewd-xpress Middle Tier for Ripple OSI                        |
 |                                                                          |
 | Copyright (c) 2016 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
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

 21 September 2016

*/

var openEHR = require('./openEHR');

var headings = {
  allergies: require('./allergies'),
  problems: require('./problems'),
  medications: require('./medications'),
  contacts: require('./contacts'),
  laborders: require('./laborders'),
  labresults: require('./labresults'),
  procedures: require('./procedures'),
  referrals: require('./referrals'),
  appointments: require('./appointments'),
  eolcareplans: require('./eolcareplans'),
  mdtreports: require('./mdtreports'),
  transfers: {
    textFieldName: ''
  }
};

var q;

function getDomain(nhsNo, domain, sessions, callback) {

  var params = {
    callback: callback,
    url: '/rest/v1/query',
    method: 'GET'
  };

  var queryType;
  var query;
  var server;
  var patientId;
  params.dontAsk = {};
  params.hostSpecific = {};
  for (var host in openEHR.servers) {
    params.hostSpecific[host] = {
      qs: {}
    };
    server = openEHR.servers[host];
    queryType = server.queryType;
    if (!domain.query[queryType]) queryType = 'aql';
    query = domain.query[queryType];
    console.log('**** host = ' + host + '; queryType = ' + queryType + ': domain = ' + domain.name + '; query = ' + JSON.stringify(query));
    if (query.length === 0) {
      params.hostSpecific[host]['qs'][queryType] = '';
      params.dontAsk[host] = true;
      console.log('**** dontAsk set to true for ' + host); 
    }
    else {
      patientId = nhsNo;
      if (query[1] === 'openEHRNo') patientId = openEHR.getEhrId(nhsNo, host);
      if (query[1] === 'ehrId') patientId = openEHR.getEhrId(nhsNo, host);
      params.hostSpecific[host]['qs'][queryType] = query[0] + patientId + query[2];
    }
  }
  params.sessions = sessions;

  params.processBody = function(body, host) { 
    console.log('**** processBody for host ' + host);
    var results = [];
    if (!body) body = {
      resultSet: []
    };
    if (body && body.resultSet) {
      console.log('setting patientDomain global for ' + domain.name + ' / host ' + host);
      var patientDomain = new q.documentStore.DocumentNode('ripplePatients', [nhsNo, "domains", domain.name, host]);
      if (body.resultSet.length === 0) {
        patientDomain.value = 'empty';
      }
      else {
        patientDomain.setDocument(body.resultSet);
        var patientDomainIndex = new q.documentStore.DocumentNode('ripplePatients', [nhsNo, "domainIndex", domain.name]);

        var count = 0;
        body.resultSet.forEach(function(result) {
          var index = {
            host: host,
            recNo: count
          };
          patientDomainIndex.$(result.uid.split('::')[0]).setDocument(index);
          count++;
        });
      }
    }
  };

  openEHR.requests(params);

}

function getSelectedDomain(nhsNo, domainName, sessions, callback) {
  var domain = headings[domainName];
  if (!domain) {
    console.log('***!!! error in getSelectedDomain: ' + domainName + ' is not defined in headings object');
    var patientDomain = new q.documentStore.DocumentNode('ripplePatients', [nhsNo, "domains", domainName]);
    patientDomain.value = 'error';
    callback();
    return;
  }
  getDomain(nhsNo, domain, sessions, callback);
}

function getAllergies(nhsNo, sessions, callback) {
  getSelectedDomain(nhsNo, 'allergies', sessions, callback);
}

function getProblems(nhsNo, sessions, callback) {
  getSelectedDomain(nhsNo, 'problems', sessions, callback);
} 

function getMedications(nhsNo, sessions, callback) {
  getSelectedDomain(nhsNo, 'medications', sessions, callback);
}

function getContacts(nhsNo, sessions, callback) {
  getSelectedDomain(nhsNo, 'contacts', sessions, callback);
}

module.exports = {
  init: function() {
    q = this;
    openEHR.init.call(this);
  },
  getAllergies: getAllergies,
  getProblems: getProblems,
  getContacts: getContacts,
  getMedications: getMedications,
  getDomain: getSelectedDomain,
  headings: headings
};
