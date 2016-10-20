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

 21 September 2016

*/

var openEHR = require('../openEHR/openEHR');

var path = './';

var headings = {
  allergies: require(path + 'allergies'),
  problems: require(path + 'problems'),
  medications: require(path + 'medications'),
  contacts: require(path + 'contacts'),
  laborders: require(path + 'laborders'),
  labresults: require(path + 'labresults'),
  procedures: require(path + 'procedures'),
  referrals: require(path + 'referrals'),
  appointments: require(path + 'appointments'),
  eolcareplans: require(path + 'eolcareplans'),
  mdtreports: require(path + 'mdtreports'),
  transfers: {
    textFieldName: ''
  }
};

var q;

function getHeading(nhsNo, heading, sessions, callback) {

  // OK this is where we determine how and where the heading data will be fetched from
  //  and we do any mapping to an openEHR NHS Number here!

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
    console.log('***** headings: queryType = ' + queryType + '; server = ' + JSON.stringify(server));
    console.log('*** server query: ' + server.query);
    if (queryType === 'custom') {
      var method = require('../' + this.userDefined.rippleUser.pasModule).getHeadingsQuery;
      query = method.call(this, nhsNo, heading.name);
      params.hostSpecific[host]['qs'] = query;
    }
    else {
      if (!heading.query[queryType]) queryType = 'aql';
      query = heading.query[queryType];
      console.log('**** host = ' + host + '; queryType = ' + queryType + ': heading = ' + heading.name + '; query = ' + JSON.stringify(query));
      if (query.length === 0) {
        params.hostSpecific[host]['qs'][queryType] = '';
        params.dontAsk[host] = true;
        console.log('**** dontAsk set to true for ' + host); 
      }
      else {
        patientId = nhsNo;

        if (this.userDefined.rippleUser && this.userDefined.rippleUser.nhsNumber && this.userDefined.rippleUser.nhsNumber[host]) {
          patientId = this.userDefined.rippleUser.nhsNumber[host];
        }

        if (query[1] === 'openEHRNo') patientId = openEHR.getEhrId(patientId, host);
        if (query[1] === 'ehrId') patientId = openEHR.getEhrId(patientId, host);
        params.hostSpecific[host]['qs'][queryType] = query[0] + patientId + query[2];
      }
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
      console.log('setting patientHeading global for ' + heading.name + ' / host ' + host);
      var patientHeading = new q.documentStore.DocumentNode('ripplePatients', [nhsNo, "headings", heading.name, host]);
      if (body.resultSet.length === 0) {
        patientHeading.value = 'empty';
      }
      else {
        patientHeading.setDocument(body.resultSet);
        var patientHeadingIndex = new q.documentStore.DocumentNode('ripplePatients', [nhsNo, "headingIndex", heading.name]);

        var count = 0;
        body.resultSet.forEach(function(result) {
          var index = {
            host: host,
            recNo: count
          };
          patientHeadingIndex.$(result.uid.split('::')[0]).setDocument(index);
          count++;
        });
      }
    }
  };

  openEHR.requests(params);

}

function getSelectedHeading(patientId, headingName, sessions, callback) {
  var heading = headings[headingName];
  if (!heading) {
    console.log('***!!! error in getSelectedHeading: ' + headingName + ' is not defined in headings object');
    var patientHeading = new q.documentStore.DocumentNode('ripplePatients', [patientId, "headings", headingName]);
    patientHeading.value = 'error';
    callback();
    return;
  }
  getHeading.call(this, patientId, heading, sessions, callback);
}

function getAllergies(nhsNo, sessions, callback) {
  getSelectedHeading(nhsNo, 'allergies', sessions, callback);
}

function getProblems(nhsNo, sessions, callback) {
  getSelectedHeading(nhsNo, 'problems', sessions, callback);
} 

function getMedications(nhsNo, sessions, callback) {
  getSelectedHeading(nhsNo, 'medications', sessions, callback);
}

function getContacts(nhsNo, sessions, callback) {
  getSelectedHeading(nhsNo, 'contacts', sessions, callback);
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
  getHeading: getSelectedHeading,
  headings: headings
};
