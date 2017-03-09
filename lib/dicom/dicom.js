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
  if (!date) return '';
  if (date.indexOf('.') === -1) {
    date = date.slice(0,4) + '.' + date.slice(4,6) + '.' + date.slice(6)
  }
  return dateTime.getRippleTime(date, 'ethercis');
}

function convertTime(time, date) {
  if (!time) return '';
  var pieces = time.split(':');
  var time = (pieces[0] * 3600) + (pieces[1] * 60) + parseInt(pieces[2]);
  if (dateTime.isDST(date)) time = time - 3600;
  return time * 1000;
}

function capture(type, obj) {
  console.log('capture type ' + type);
  var str = JSON.stringify(obj);
  var dicomLog = new this.documentStore.DocumentNode('qewdDicomLog');
  var index = dicomLog.increment();
  dicomLog.$([index, type]).value = str;
  console.log('capture done');
}


function proxy(args, options, callback) {

  console.log('proxying: ' + JSON.stringify(options));

  capture.call(this, "args", args);
  capture.call(this, "options", options);

  var self = this;
  request(options, function(error, response, body) {
    if (error) {
      callback({error: error});
      return;
    }
    capture.call(self, "body", body);
    callback(body);
  });
}

function studies(args, callback) {

  if (args.sourceId !== 'studies') {
    callback({error: 'Invalid DICOM endpoint requested'});
    return;
  }

  var sessionStudies = args.session.data.$(['dicom', 'studies']);

  if (sessionStudies.exists) {
    // retrieve Dicom study data from QEWD session cache instead of Orthanc server

    var results = sessionStudies.$('studiesResponse').getDocument(true);
    callback(results);
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

            var response = {
              studyId: studyId,
              source: server.source,
              studyDescription: studyDescription,
              dateRecorded: dateRecorded
            }; 
            results.push(response);
            // save to Session cache
            sessionStudies.$(['raw', studyId]).setDocument(body);
          }

          count++;
          if (count === noOfResults) {
            sessionStudies.$('studiesResponse').setDocument(results);
            callback(results);
            return;
          }
        });
      }(studyId));
    }
  });
}

function detailL2(args, callback) {

   /*

     eg /api/patients/9999999000/dicom/series/9927f4d0-7ba0f736-ad0cd3a0-8cd74dba-5a23637e?source=undefined


     matches /api/patients/:patientId/:heading/:sourceId/:identifier

      args.patientId =  9999999000
      args.heading =    dicom
      args.sourceId =   series
      args.identifier = 9927f4d0-7ba0f736-ad0cd3a0-8cd74dba-5a23637  = seriesId

     eg /api/patients/9999999000/dicom/instances/7d739ad5-d3a3d79c-68ea3c77-5d22eadb-42c40467?source=undefined

      args.patientId =  9999999000
      args.heading =    dicom
      args.sourceId =   instances
      args.identifier = 7d739ad5-d3a3d79c-68ea3c77-5d22eadb-42c40467  = instanceId


  */


  if (args.sourceId !== 'studies' && args.sourceId !== 'series' && args.sourceId !== 'instances') {
    callback({error: 'Invalid DICOM endpoint requested'});
    return;
  }

  if (args.sourceId === 'series') {
    getSeriesDetail.call(this, args, callback);
    return;
  }

  if (args.sourceId === 'instances') {
    getInstanceDetail.call(this, args, callback);
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

  proxy.call(this, args, options, callback);
}

function getSeriesDetail(args, callback) {

  var seriesId = args.identifier;
  var sessionSeries = args.session.data.$(['dicom', 'series', seriesId]);

  if (sessionSeries.exists) {
    // fetch the series results from the session cache
    console.log('Dicom seriesDetail: fetching from Session cache');

    callback(sessionSeries.$('seriesDetailResponse').getDocument());
    return;
  }

  // fetch the series details

  var url = '' + server.host;
  if (server.port && server.port !== '') url = url + ':' + server.port;

  var options = {
    url: url + '/series/' + seriesId,
    method: 'GET',
    json: true
  };

  console.log('** getSeriesDetail sending request:' + JSON.stringify(options));

  request(options, function(error, response, body) {
    if (error) {
      callback({error: error});
      return;
    }

    console.log('** /series response = ' + JSON.stringify(body));
    sessionSeries.$('raw').setDocument(body);

    // re-package response

    var results = {
      source: server.source,
      sourceId: seriesId,
      modality: body.MainDicomTags.Modality || '',
      seriesDate: convertDate(body.MainDicomTags.SeriesDate),
      seriesTime: convertTime(body.MainDicomTags.SeriesTime, body.MainDicomTags.SeriesDate),
      stationName: body.MainDicomTags.StationName || '',
      operatorsName: body.MainDicomTags.OperatorsName || '',
      seriesNumber: body.MainDicomTags.SeriesNumber || '',
      instanceIds: body.Instances || [],
      protocolName: body.MainDicomTags.ProtocolName || '',      
    };

    sessionSeries.$('seriesDetailResponse').setDocument(results);
    callback(results);
  });
}

function getSeries(args, callback) {

  var sessionSeries = args.session.data.$(['dicom', 'studies', 'raw', args.identifier, 'Series']);

  if (sessionSeries.exists) {
    // fetch the series results from the session cache
    console.log('Dicom series: fetching from Session cache');
    callback({
      studyId: args.identifier,
      source: server.source,
      seriesIds: sessionSeries.getDocument(true)
    });
    return;
  }

  // fetch the studies to create Session cache

  var self = this;
  console.log('Dicom getSeries - session cache not available - fetch studies');
  studies.call(this, args, function() {
    // Session cache will now exist
    console.log('Try Session cache again');
    getSeries.call(self, args, callback);
  });
  return;
}


function getInstance(args, callback) {

  var seriesId = args.identifier;
  var sessionSeries = args.session.data.$(['dicom', 'series', seriesId]);

  if (sessionSeries.exists) {
    console.log('Dicom: getting instance from Session cache');
    var instances = sessionSeries.$(['raw', 'Instances']).getDocument(true);
    var instanceId = instances[0] || '';
    callback({
      instanceId: instanceId
    });
    return;
  }

  var self = this;
  getSeriesDetail.call(this, args, function() {
    // now it should be in session cache
    console.log('Dicom: fetching series details from Orthanc');
    getInstance.call(this, args, callback);
  });

}

function getInstanceDetail(args, callback) {
  var instanceId = args.identifier;
  var sessionInstance = args.session.data.$(['dicom', 'instances', instanceId]);

  if (sessionInstance.exists) {
    callback(sessionInstance.$('instanceResponse').getDocument());
    return;
  }

  var url = '' + server.host;
  if (server.port && server.port !== '') url = url + ':' + server.port;

  var options = {
    url: url + '/instances/' + instanceId,
    method: 'GET',
    json: true
  };

  console.log('** getInstanceDetail sending request:' + JSON.stringify(options));

  request(options, function(error, response, body) {
    if (error) {
      callback({error: error});
      return;
    }

    console.log('** /instances response = ' + JSON.stringify(body));

    var results = {
      sourceId: instanceId,
      source: server.source,
      fileUuid: body.FileUuid || '',
      parentSeries: body.ParentSeries || ''
    }
    sessionInstance.$('raw').setDocument(body);
    sessionInstance.$('instanceResponse').setDocument(results);
    callback(results);
  });
}

function detailL3(args, callback) {

   /*

   eg /api/patients/9999999000/dicom/studies/55a9fcd2-e8197ca2-1af7a8e2-0e1ab147-841c65ba/series?source=orthanc

    matches /api/patients/:patientId/:heading/:sourceId/:identifier/:subId

      args.patientId =  9999999000
      args.heading =    dicom
      args.sourceId =   studies
      args.identifier = 55a9fcd2-e8197ca2-1af7a8e2-0e1ab147-841c65ba
      args.subId =      series

   eg /api/patients/9999999000/dicom/series/9927f4d0-7ba0f736-ad0cd3a0-8cd74dba-5a23637e/instance?source=orthanc
   matches: /api/patients/:patientId/:heading/:sourceId/:identifier/:subId'

      args.patientId =  9999999000
      args.heading =    dicom
      args.sourceId =   series
      args.identifier = 9927f4d0-7ba0f736-ad0cd3a0-8cd74dba-5a23637e   = seriesId
      args.subId =      instance


  */

  if (args.sourceId !== 'studies' && args.sourceId !== 'series') {
    callback({error: 'Invalid DICOM endpoint requested'});
    return;
  }

  if (args.sourceId === 'studies' && args.subId === 'series') {
    getSeries.call(this, args, callback);
    return;
  }

  if (args.sourceId === 'series' && args.subId === 'instance') {
    getInstance.call(this, args, callback);
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

  //if (args.sourceId === 'studies') {
    proxy.call(this, args, options, callback);
    return;
  //}
 
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
  detailL3: detailL3,
  convertTime: convertTime
};
