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
var domains = require('./domains');

var headings = domains.headings;

function getPatientSummary(nhsNo, sessions, callback) {

  var q = this;

  var ready = {
    allergies: false,
    medications: false,
    problems: false,
    contacts: false
  };

  domains.getAllergies(nhsNo, sessions, function() {
    q.emit('domainReady', 'allergies', ready, callback);
  });

  domains.getProblems(nhsNo, sessions, function() {
    q.emit('domainReady', 'problems', ready, callback);
  });

  domains.getMedications(nhsNo, sessions, function() {
    q.emit('domainReady', 'medications', ready, callback);
  });

  domains.getContacts(nhsNo, sessions, function() {
    q.emit('domainReady', 'contacts', ready, callback);
  });

}

function formatSummary(nhsNo) {
  var patient = new this.documentStore.DocumentNode('ripplePatients', [nhsNo]);
  var patientDomains = patient.$('domains');
  var results = {
    allergies: [],
    problems: [],
    medications: [],
    contacts: [],
    transfers: []
  };

  /*
  var textFieldNames = {
    allergies: allergies.textFieldName,
    problems: 'problem',
    medications: 'name',
    contacts: 'name',
    transfers: ''
  };

  headings[domain].textFieldName
  */

  var domain;
  var summary;

  for (domain in results) {
    for (var host in openEHR.servers) {      
      patientDomains.$(domain).$(host).forEachChild(function(index, childNode) {
        var text = childNode.$(headings[domain].textFieldName).value;
        if (text !== null && text !== '') {
          summary = {
            sourceId: childNode.$('uid').value.split('::')[0],
            source: openEHR.servers[host].sourceName,
            text: text
          }
          results[domain].push(summary);
        }
      });
    }
  }
  results.id = nhsNo;
  results.name = patient.$('name').value;
  results.gender = patient.$('gender').value;
  results.dateOfBirth = patient.$('dateOfBirth').value;
  results.nhsNumber = nhsNo;
  results.address = patient.$('address').value;
  results.pasNumber = patient.$('pasNo').value;
  results.gpDetails = patient.$('gpDetails').value;
  results.telephone = patient.$('phone').value;
  return results;
}

function getDomainTable(nhsNo, domain, callback) {
  if (!domains.headings[domain]) {
    console.log('*** ' + domain + ' has not yet been added to middle-tier processing');
    callback([]);
    return;
  }
  var patientDomain = new this.documentStore.DocumentNode('ripplePatients', [nhsNo, 'domains', domains.headings[domain].name]);
  if (!patientDomain.exists) {
    // fetch it!
    var q = this;
    console.log('*** domain ' + domain + ' needs to be fetched!')
    openEHR.startSessions(function(sessions) {
      console.log('*** sessions: ' + JSON.stringify(sessions));
      openEHR.mapNHSNo(nhsNo, sessions, function() {
        console.log('*** NHS no mapped');
        domains.getDomain(nhsNo, domain, sessions, function() {
          openEHR.stopSessions(sessions);
          // now try again!
          console.log('**** trying again!');
          getDomainTable.call(q, nhsNo, domain, callback);
        });
      });
    });
    return;
  }

  console.log('patientDomain exists for ' + nhsNo + ': domain ' + domain);
  var results = [];
  patientDomain.forEachChild(function(host, hostNode) {
    //console.log('**** forEachChild: host = ' + host);
    hostNode.forEachChild(function(index, domainNode) {
      //console.log('**** forEachChild index = ' + index);
      var record = domainNode.getDocument();
      var result = {
        sourceId: record.uid.split('::')[0],
        source: host
      }
      var emptyValues = 0;
      
      headings[domain].domainTableFields.forEach(function(fieldName) {
        //console.log('***fieldName: ' + fieldName);
        var name = headings[domain].fieldMap[fieldName];
        if (typeof name === 'function') {
          value = name(record, host);
        }
        else {
          var value = record[name];
        }
        //console.log('*** value: ' + value);
        if (value === '') emptyValues++;
        result[fieldName] = value;
      });
      if (emptyValues !== headings[domain].domainTableFields.length) results.push(result);
    });
  });
  if (callback) callback(results);
}

function patientSummary(nhsNo, callback) {
  var patient = new this.documentStore.DocumentNode('ripplePatients', [nhsNo, 'domains']);
  if (patient.exists) {
    // we've already cached the domain data for this patient so just output from cache
    var summary = formatSummary.call(this, nhsNo);
    if (callback) callback(summary);
    return;
  }

  var q = this;

  openEHR.startSessions(function(sessions) {
    openEHR.mapNHSNo(nhsNo, sessions, function() {
      getPatientSummary.call(q, nhsNo, sessions, function() {
        openEHR.stopSessions(sessions);
        var summary = formatSummary.call(q, nhsNo);
        if (callback) callback(summary);
        
      });
    });
  });

}

function patientDomainDetail(nhsNo, domain, sourceId) {

  console.log('*** patientDomainDetail - domain = ' + domain);

  var patientDomainIndex = new this.documentStore.DocumentNode('ripplePatients', [nhsNo, 'domainIndex', domains.headings[domain].name]);
  if (!patientDomainIndex.exists) {
    
    // go and fetch it!

    var q = this;
    console.log('*** domain ' + domain + ' needs to be fetched!')
    openEHR.startSessions(function(sessions) {
      console.log('*** sessions: ' + JSON.stringify(sessions));
      openEHR.mapNHSNo(nhsNo, sessions, function() {
        console.log('*** NHS no mapped');
        getSelectedDomain(nhsNo, domain, sessions, function() {
          // now try again!
          console.log('**** trying again!');
          patientDomainDetail.call(q, nhsNo, domain, sourceId);
        });
      });
    });
    return;
  }
  console.log('**** sourceId: ' + sourceId);
  var indexSource = patientDomainIndex.$(sourceId);
  if (!indexSource.exists) {
    return {error: 'Invalid sourceId ' + sourceId + ' for patient ' + nhsNo + ' / domain ' + domain};
  }
  var index = indexSource.getDocument();

  var patientDomain = new this.documentStore.DocumentNode('ripplePatients', [nhsNo, 'domains', domains.headings[domain].name, index.host, index.recNo]);
  var record = patientDomain.getDocument();
  console.log('*** record: ' + JSON.stringify(record));
  var result = {
    sourceId: sourceId,
    source: openEHR.servers[index.host].sourceName
  };
  for (var name in headings[domain].fieldMap) {
    if (typeof headings[domain].fieldMap[name] === 'function') {
      result[name] = headings[domain].fieldMap[name](record, index.host);
    }
    else {
      result[name] = record[headings[domain].fieldMap[name]];
    }
  }
  return result;
}

function postDomain(nhsNo, domain, dataArr, callback) {
  if (headings[domain] && headings[domain].post) {
    var q = this;
    if (!Array.isArray(dataArr)) dataArr = [dataArr];
    dataArr.forEach(function(data) {
      var host = headings[domain].post.destination || 'ethercis';
      openEHR.startSession(host, function(session) {
        console.log('**** inside startSession callback - sessionId = ' + session.id);
        openEHR.mapNHSNoByHost(nhsNo, host, session.id, function(ehrId) {
          // force a reload of this heading after the update
          var patientDomain = new q.documentStore.DocumentNode('ripplePatients', [nhsNo, 'domains', domains.headings[domain].name]);
          var patientDomainIndex = new q.documentStore.DocumentNode('ripplePatients', [nhsNo, 'domainIndex', domains.headings[domain].name]);
          patientDomain.delete();
          patientDomainIndex.delete();
          postDomainData.call(q, domain, ehrId, host, session.id, data, function() {
            openEHR.stopSession(host, session.id);
            if (callback) callback();  
          });
        });
      });
    });
  }
}

function postDomainData(domain, ehrId, host, sessionId, data, callback) {
  if (headings[domain] && headings[domain].post) {
    var body = {};
    var post = headings[domain].post;
    var fieldMap = post.fieldMap;
    var map;
    for (var fieldName in fieldMap) {
      console.log('** ' + fieldName);
      map = fieldMap[fieldName];
      console.log('** map: ' + JSON.stringify(map));
      var mapped = false;
      if (map.field) {
        if (data[map.field]) {
          console.log('** body[' + fieldName + '] = ' + data[map.field]);
          body[fieldName] = data[map.field];
          mapped = true;
        }
      }
      if (!mapped && map.default) {
        if (typeof map.default === 'function') {
          body[fieldName] = map.default(data, host);
        }
        else {
          body[fieldName] = map.default;
        }
        console.log('*** default: body[' + fieldName + '] = ' + map.default);
      }
    }
    // ready to post
    var params = {
      host: host,
      callback: callback,
      url: '/rest/v1/composition',
      queryString: {
        templateId: post.templateId,
        ehrId: ehrId,
        format: 'FLAT'
      },
      method: 'POST',
      session: sessionId,
      options: {
        body: body
      }
    };
    console.log('**** about to post data: ' + JSON.stringify(params, null, 2));
    openEHR.request(params);
  }
}


module.exports = {

  init: function() {
    openEHR.init.call(this);
    domains.init.call(this);

    var q = this;

    this.on('domainReady', function(domain, ready, callback) {
      console.log(domain + ' ready!');
      ready[domain] = true;
      if (ready.allergies && ready.medications && ready.problems && ready.contacts) {
        callback.call(q);
        return;
      }
    });

  },

  patientSummary: patientSummary,
  getDomainTable: getDomainTable,
  patientDomainDetail: patientDomainDetail,
  postDomain: postDomain
};
