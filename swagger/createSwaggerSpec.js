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

  8 June 2017

*/

var transform = require('qewd-transform-json').transform;
var traverse = require('traverse');
var fs = require('fs');
var headings = require('qewd-ripple/lib/headings/headings').headings;
delete headings.transfers;
delete headings.counts;

var path = 'www/swagger/';

function getFile(file) {
  file = path + file;
  var text = fs.readFileSync(file, 'utf-8');
  //console.log('text: ' + text);
  return JSON.parse(text);
}

function json() {
  return ["application/json"];
}

function auth() {
  return [{QEWDToken: []}];
}

function schema(ref) {
  console.log('schema: ref= ' + ref);
  return {
    $ref: '#/definitions/' + ref
  };
}

function headingPostSchema(heading) {
  return {
    $ref: '#/definitions/' + heading + 'Schema'
  };
}

function headingSummaryDescription(heading) {
  return 'Get ' + heading + ' summary data';
}

function headingPostDescription(heading) {
  return 'Save a new ' + heading + ' record';
}

function headingDetailDescription(heading) {
  return 'Get complete ' + heading + ' data';
}

function getPostFields(headingObj, headingName) {

  var templateObj = headingObj.post.transformTemplate;
  var fields = [];
  traverse(templateObj).map(function(node) {

    if (typeof node === 'string') {
      var pieces;
      var name;

      if (node.indexOf('{{') !== -1) {
        pieces = node.split('{{');
        pieces = pieces[1].split('}}');
        name = pieces[0].trim();
        fields.push(name);
      }
      if (node.indexOf('=>') !== -1) {
        pieces = node.split('(');
        pieces = pieces[1].split(',');
        name = pieces[0].trim();
        if (name !== ')') fields.push(name);
      }
    }
  });
  return fields;
}

function get(file, ...arr) {
  console.log('arr = ' + JSON.stringify(arr));
  var params = {};
  if (Array.isArray(arr)) {
    params[arr[0]] = arr[1];
    if (arr[2]) params[arr[2]] = arr[3];
    if (arr[4]) params[arr[4]] = arr[5];
  }

  if (params.headingDetail) {
    params.desc = params.desc + ' for ' + params.headingDetail;
    params.ref = params.headingDetail + 'Detail' + params.ref;
  }

  if (params.headingSummary) {
    params.desc = params.desc + ' for ' + params.headingSummary;
    params.ref = params.headingSummary + 'Summary' + params.ref;
  }

  console.log('get: file = ' + file + '; params: ' + JSON.stringify(params));
  var obj = getFile(file);
  //console.log('json: ' + JSON.stringify(obj));
  return transform(obj, params, {get, schema, json, auth, headingSummaryDescription, headingDetailDescription, headingPostDescription, headingPostSchema});
}



var json1 = get('swaggerTemplate.json');

var json2;
var headingObj;
var summaryFields;
var detailFields;
var template;
var properties;
var name;

for (var heading in headings) {
  console.log('--- ' + heading + ' ----');
  
  json2 = get('heading-summary.json', 'headingName', heading);
  json1.paths['/api/patients/{patientId}/' + heading] = {
    get: json2
  };

  headingObj = require('qewd-ripple/lib/headings/' + heading);
  summaryFields = headingObj.headingTableFields;
  //console.log('template for ' + heading + ': ' + JSON.stringify(template));
  properties = {
    source: {
      description: 'Source OpenEHR System',
      type: 'string'
    },
    sourceId: {
      description: 'Source OpenEHR Composition Id',
      type: 'string'
    }
  };
  summaryFields.forEach(function(name) {
    properties[name] = {
      type: 'string'
    };
  });


  json1.definitions[heading + 'SummaryResponse'] = {
    properties: properties
  }

  // detailed heading data...

  json2 = get('heading-detail.json', 'headingName', heading);
  json1.paths['/api/patients/{patientId}/' + heading + '/{sourceId}'] = {
    get: json2
  }

  detailFields = headingObj.get.transformTemplate;
  properties = {
    source: {
      description: 'Source OpenEHR System',
      type: 'string'
    },
    sourceId: {
      description: 'Source OpenEHR Composition Id',
      type: 'string'
    }
  };
  for (name in detailFields) {
    properties[name] = {
      type: 'string'
    };
  };


  json1.definitions[heading + 'DetailResponse'] = {
    properties: properties
  }

  // post headings

  if (headingObj.post) {

    var fields = getPostFields(headingObj, heading);
    properties = {};
    fields.forEach(function(name) {
      properties[name] = {
        type: 'string'
      };
    });

    json2 = get('heading-post.json', 'headingName', heading);
    json1.paths['/api/patients/{patientId}/' + heading].post = json2;

    json1.definitions[heading + 'Schema'] = {
      properties: properties
    } 
  }

}

var text = JSON.stringify(json1, null, 2) + '\n';

console.log('text: ' + text);

fs.writeFileSync(path + 'swagger.json', text, 'utf-8');


//console.log('ok');
//console.log(text);
