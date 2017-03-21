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

17 March 2017

*/
var index = require('./spec/index');
var info = require('./spec/info');
var definition = require('./spec/definitions/definition');
var path = require('./spec/path');
var tag = require('./spec/tag');
var headings = require("../headings/headings").headings;
var fs = require('fs');

function writeSpec(outputDir, host, basePath) {
  // create api-docs sub dir
  var writeSpec

  writeInfo(mkdir(outputDir, "info"));
  writeDefinitions(mkdir(outputDir, "definitions"));
  writePaths(mkdir(outputDir, "paths"), createPath("..", "definitions"));
  writeTags(mkdir(outputDir, "tags"));
  writeIndex(outputDir, host, basePath, "info/index.json", "paths/index.json", "definitions/index.json", "externalDocs/index.json", "tags/index.json");
  
}

function createPath(parent, name) {
   return parent + "/" + name;
}

function mkdir(parent, name) {
  const dir = createPath(parent, name);
  fs.mkdirSync(dir);

  return dir;
}

function writeFile(file, content) {
  fs.writeFile(file, content, function (err) {
    if (err) {
      console.log(err);
    }
  });
}

function writeTags(outputDir) {
  var tags = [];
  for(heading in headings) {
    tags.push(tag.getTag(heading));
  }

  writeFile(createPath(outputDir, "index.json"), JSON.stringify(tags));
}

function writeIndex(outputDir, host, basePath, infoRef, pathsRef, definitionsRef, externalDocsRef) {
  writeFile(createPath(outputDir, "index.json"), JSON.stringify(index.getIndex(host, basePath, infoRef, pathsRef, definitionsRef, externalDocsRef)));
}

function writeInfo(outputDir) {
  writeFile(createPath(outputDir, "index.json"), JSON.stringify(info.getInfo()));
}

function writePaths(outputDir, definitionsDir) {
    var index = {};
    
    var patientIdOperations
    var patientIdAndIdOperations;

    var headingDefinitionPath
    var summaryDefinitionRef;
    var detailDefinitionRef;

    for(heading in headings) {
      console.log("About to create paths for heading " + heading + ' outputDir ' + outputDir);
      var dir = mkdir(outputDir, heading);

      headingDefinitionPath = createPath("..", createPath(definitionsDir,  getDefinitionPath(heading)));
      summaryDefinitionRef = definition.getSummaryDefinitionRef(headingDefinitionPath);
      detailDefinitionRef = definition.getDetailDefinitionRef(headingDefinitionPath);

      patientIdOperations = path.getPatientIdOperations(headings[heading].name, summaryDefinitionRef, detailDefinitionRef);
      writeFile(createPath(dir, "patientIdOperations.json"), JSON.stringify(patientIdOperations.swagger));
      index[patientIdOperations.url] = {
        $ref: createPath(heading, "patientIdOperations.json")
      }      

      patientIdAndIdOperations = path.getPatientIdAndIdOperations(headings[heading].name, detailDefinitionRef);
      writeFile(createPath(dir, "patientIdAndIdOperations.json"), JSON.stringify(patientIdAndIdOperations.swagger));
      index[patientIdAndIdOperations.url] = {
        $ref: createPath(heading, "patientIdAndIdOperations.json")
      }
    } 
  
    writeFile(createPath(outputDir, "index.json"), JSON.stringify(index));
}

function writeDefinitions(outputDir) {
    var index = {};
    
    var detailAndSummaryDefinition;

    var headingDir;
    var headingIndexPath;
    for(heading in headings) {
      console.log("About to create definition for heading " + heading + ' outputDir ' + outputDir);

      // TODO - need to add source and sourceId properties manually :-()

      detailAndSummaryDefinition = definition.getDetailAndSummary(heading, headings[heading].fieldMap, headings[heading].headingTableFields);

      // save this to index.json
      headingDir = mkdir(outputDir, heading);
      writeFile(createPath(headingDir, "index.json"), JSON.stringify(detailAndSummaryDefinition));

      index[heading + "Detail"] = {
        $ref: createPath(heading, definition.getDetailDefinitionRef("index.json"))
      }

      index[heading + "Summary"] = {
        $ref: createPath(heading, definition.getSummaryDefinitionRef("index.json"))
      }
    }

    writeFile(createPath(outputDir, "index.json"), JSON.stringify(index));     
}

function getDefinitionPath(heading) {
  return createPath(heading, "index.json")
}



module.exports = {
  writeSpec: writeSpec
};