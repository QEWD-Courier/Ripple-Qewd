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

  27 February 2017

  Dicom / Orthanc Server proxy endpoints

*/

var request = require('request');
var server = require('./server');
var dateTime = require('../dateTime');

function convertDate(date, time) {
  if (date.indexOf('.') === -1) {
    date = date.slice(0,4) + '.' + date.slice(4,6) + '.' + date.slice(6)
  }
  return dateTime.getRippleTime(date, 'ethercis');
}

function proxy(options, callback) {

  console.log('proxying: ' + JSON.stringify(options));

  request(options, function(error, response, body) {
    if (error) {
      callback({error: error});
      return;
    }
    callback(body);
  });
}

function studies(args, callback) {

  if (args.sourceId !== 'studies') {
    callback({error: 'Invalid DICOM endpoint requested'});
    return;
  }

  var url = '' + server.host;
  if (server.port && server.port !== '') url = url + ':' + server.port;

  var options = {
    url: url + '/studies',
    method: 'GET',
    json: true
  };

  console.log('** studies sending request:' + JSON.stringify(options));

  request(options, function(error, response, body) {
    if (error) {
      callback({error: error});
      return;
    }

    console.log('** /studies response = ' + JSON.stringify(body));

    if (!Array.isArray(body)) {
      var error = 'Bad /studies response: ' + JSON.stringify(body);
      callback({error: error});
      return;
    }

    // body contains an array of study UIDs.  Now request each one
    // and build a composite result

    var results = [];
    var noOfResults = body.length;
    var count = 0;
    var studyId;

    for (var i = 0; i < body.length; i++) {
      studyId = body[i];
      var options = {
        url: url + '/studies/' + studyId,
        method: 'GET',
        json: true
      };

      console.log('** studies/{studyid} sending request:' + JSON.stringify(options));

      (function(studyId) {
        request(options, function(error, response, body) {
          if (error) {
            console.log('error! ' + error);
            results.push({
              studyId: studyId,
              source: server.source,
              error: error
            });
          }
          else {
            console.log('*** /studies/{id} response: ' + JSON.stringify(body));
            // get studyDescription and convert date format

            var studyDescription = '';
            var dateRecorded = '';
            if (body.MainDicomTags) {
              if(body.MainDicomTags.StudyDescription) {
                studyDescription = body.MainDicomTags.StudyDescription;
              }
              if(body.MainDicomTags.StudyDate && body.MainDicomTags.StudyTime) {
                dateRecorded = convertDate(body.MainDicomTags.StudyDate, body.MainDicomTags.StudyTime);
              }
            }
 
            results.push({
              studyId: studyId,
              source: server.source,
              studyDescription: studyDescription,
              dateRecorded: dateRecorded
            });
          }

          count++;
          if (count === noOfResults) {
            callback(results);
            return;
          }
        });
      }(studyId));
    }
  });
}

function detailL2(args, callback) {
  if (args.sourceId !== 'studies' && args.sourceId !== 'series' && args.sourceId !== 'instances') {
    callback({error: 'Invalid DICOM endpoint requested'});
    return;
  }

  var url = '' + server.host;
  var port = ''; //server.port;

  if (port && port !== '') url = url + ':' + port;
  //url = url + '/' + args.sourceId + '/' + args.identifier;

  url = url + '/api/patients/' + args.patientId + '/' + args.heading;
  url = url + '/' + args.sourceId + '/' + args.identifier;


  var options = {
    url: url,
    method: 'GET',
    json: true
  };

  proxy(options, callback);
}

function detailL3(args, callback) {
  if (args.sourceId !== 'studies' && args.sourceId !== 'series') {
    callback({error: 'Invalid DICOM endpoint requested'});
    return;
  }

  var url = '' + server.host;
  var port = ''; //server.port;

  if (port && port !== '') url = url + ':' + port;
  //url = url + '/' + args.sourceId + '/' + args.identifier;

  url = url + '/api/patients/' + args.patientId + '/' + args.heading;
  url = url + '/' + args.sourceId + '/' + args.identifier + '/' + args.subId;

  var options = {
    url: url,
    method: 'GET',
    json: true
  };

  if (args.sourceId === 'studies') {
    proxy(options, callback);
    return;
  }
 
  // /series

  if (args.subId !== 'instance') {
    callback({error: 'Invalid DICOM endpoint requested'});
    return;
  }

  // /series/{seriesId}/instance  maps to /series/{seriesId}
  //  but only returns the first instance from the collection

  request(options, function(error, response, body) {
    if (error) {
      callback({error: error});
      return;
    }
    var instance = '';
    if (body.Instances) instance = body.Instances[0];
    callback({
      instanceId: instance
    });
  });

}

module.exports = {
  studies: studies,
  detailL2: detailL2,
  detailL3: detailL3
};
