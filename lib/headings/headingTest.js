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

  6 April 2017

*/

var transform = require('qewd-transform-json').transform;
var helperFns = require('./headingHelpers');
var aql = require('./getHeadingAqlFields');
var flatten = require('../objectToFlatJSON');

var readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function test(headingName, host) {
  var heading = require('./' + headingName);  
  var input = aql.getTestData(headingName);

  if (headingName === 'labresults') {
    if (host !== 'ethercis') {
      input = {
        "conclusion": "Deteriorating",
        "uid": "e557afc8-b386-42a0-8d23-40c27bd35a5b::ripple_osi.ehrscape.c4h::1",
        "test_panel": {
            "@class": "CLUSTER",
            "name": {
                  "@class": "DV_TEXT",
                  "value": "Laboratory test panel"
            },
            "archetype_details": {
                "@class": "ARCHETYPED",
                "archetype_id": {
                    "@class": "ARCHETYPE_ID",
                    "value": "openEHR-EHR-CLUSTER.laboratory_test_panel.v0"
                },
                "rm_version": "1.0.1"
            },
            "archetype_node_id": "openEHR-EHR-CLUSTER.laboratory_test_panel.v0",
            "items": [{
                "@class": "CLUSTER",
                "name": {
                    "@class": "DV_TEXT",
                    "value": "Laboratory result"
                },
                "archetype_node_id": "at0002",
                "items": [{
                    "@class": "ELEMENT",
                    "name": {
                        "@class": "DV_CODED_TEXT",
                        "value": "Urea",
                        "defining_code": {
                            "@class": "CODE_PHRASE",
                            "terminology_id": {
                                "@class": "TERMINOLOGY_ID",
                                "value": "SNOMED-CT"
                            },
                            "code_string": "365755003"
                        }
                    },
                    "archetype_node_id": "at0001",
                    "value": {
                        "@class": "DV_QUANTITY",
                        "normal_range": {
                            "@class": "DV_INTERVAL",
                            "lower": {
                                "@class": "DV_QUANTITY",
                                "magnitude": 2.5,
                                "units": "mmol/l"
                            },
                            "upper": {
                                "@class": "DV_QUANTITY",
                                "magnitude": 6.6,
                                "units": "mmol/l"
                            },
                            "lower_unbounded": false,
                            "upper_unbounded": false
                        },
                        "magnitude": 7.6,
                        "units": "mmol/l"
                    }
                }, {
                    "@class": "ELEMENT",
                    "name": {
                        "@class": "DV_TEXT",
                        "value": "Comment"
                    },
                    "archetype_node_id": "at0003",
                    "value": {
                        "@class": "DV_TEXT",
                        "value": "may be technical artefact"
                    }
                }]
            }, {
                "@class": "CLUSTER",
                "name": {
                    "@class": "DV_TEXT",
                    "value": "Laboratory result #2"
                },
                "archetype_node_id": "at0002",
                "items": [{
                    "@class": "ELEMENT",
                    "name": {
                        "@class": "DV_CODED_TEXT",
                        "value": "Creatinine",
                        "defining_code": {
                            "@class": "CODE_PHRASE",
                            "terminology_id": {
                                "@class": "TERMINOLOGY_ID",
                                "value": "SNOMED-CT"
                            },
                            "code_string": "70901006"
                        }
                    },
                    "archetype_node_id": "at0001",
                    "value": {
                        "@class": "DV_QUANTITY",
                        "normal_range": {
                            "@class": "DV_INTERVAL",
                            "lower": {
                                "@class": "DV_QUANTITY",
                                "magnitude": 80,
                                "units": "mmol/l"
                            },
                            "upper": {
                                "@class": "DV_QUANTITY",
                                "magnitude": 110,
                                "units": "mmol/l"
                            },
                            "lower_unbounded": false,
                            "upper_unbounded": false
                        },
                        "magnitude": 130,
                        "units": "mmol/l"
                    }
                }]
            }, {
                "@class": "CLUSTER",
                "name": {
                    "@class": "DV_TEXT",
                    "value": "Laboratory result #3"
                },
                "archetype_node_id": "at0002",
                "items": [{
                    "@class": "ELEMENT",
                    "name": {
                        "@class": "DV_CODED_TEXT",
                        "value": "Sodium",
                        "defining_code": {
                            "@class": "CODE_PHRASE",
                            "terminology_id": {
                                "@class": "TERMINOLOGY_ID",
                                "value": "SNOMED-CT"
                            },
                            "code_string": "365761000"
                        }
                    },
                    "archetype_node_id": "at0001",
                    "value": {
                        "@class": "DV_QUANTITY",
                        "normal_range": {
                            "@class": "DV_INTERVAL",
                            "lower": {
                                "@class": "DV_QUANTITY",
                                "magnitude": 133,
                                "units": "mmol/l"
                            },
                            "upper": {
                                "@class": "DV_QUANTITY",
                                "magnitude": 146,
                                "units": "mmol/l"
                            },
                            "lower_unbounded": false,
                            "upper_unbounded": false
                        },
                        "magnitude": 135,
                        "units": "mmol/l"
                    }
                }]
            }, {
                "@class": "CLUSTER",
                "name": {
                    "@class": "DV_TEXT",
                    "value": "Laboratory result #4"
                },
                "archetype_node_id": "at0002",
                "items": [{
                    "@class": "ELEMENT",
                    "name": {
                        "@class": "DV_CODED_TEXT",
                        "value": "365760004",
                        "defining_code": {
                            "@class": "CODE_PHRASE",
                            "terminology_id": {
                                "@class": "TERMINOLOGY_ID",
                                "value": "SNOMED-CT"
                            },
                            "code_string": "Potassium"
                        }
                    },
                    "archetype_node_id": "at0001",
                    "value": {
                        "@class": "DV_QUANTITY",
                        "normal_range": {
                            "@class": "DV_INTERVAL",
                            "lower": {
                                "@class": "DV_QUANTITY",
                                "magnitude": 3.5,
                                "units": "mmol/l"
                            },
                            "upper": {
                                "@class": "DV_QUANTITY",
                                "magnitude": 5.3,
                                "units": "mmol/l"
                            },
                            "lower_unbounded": false,
                            "upper_unbounded": false
                        },
                        "magnitude": 5.5,
                        "units": "mmol/l"
                    }
                }]
            }]
        },
        "author": "Dr Lab",
        "date_created": "2015-03-23T00:11:02.518+02:00",
        "sample_taken": "2015-02-23T00:11:02.518+02:00",
        "test_name": "Urea, electrolytes and creatinine measurement",
        "status": "Final"
      };
    }
    else {
      input = {
        "date_created": "2015-03-22T06:11:02Z",
        "author": "Dr Lab",
        "result_comment": "The Comment",
        "conclusion": "The Conclusion",
        "uid": "810272ac-28e8-4928-b61b-79dcef4b4170",
        "result_name": "Urea",
        "sample_taken": "2015-03-21T00:11:02.518+02:00",
        "result_value": 7.6,
        "result_unit": "mmol/l",
        "test_name": "The Test Name",
        "status": "The Status",
        "normal_range_lower": 2.5,
        "normal_range_upper": 6.6
      };
    }
  }

  console.log('Example input from OpenEHR: ' + JSON.stringify(input, null, 2));

  var template = heading.get.transformTemplate;
  var helpers = helperFns(host, headingName, 'get');

  var output = transform(template, input, helpers);
  console.log('GET response sent to browser: ' + JSON.stringify(output, null, 2));
  var flat = {};

  if (heading.post && heading.post.transformTemplate) {
    template = heading.post.transformTemplate;
    helpers = helperFns(host, headingName, 'post');
    var postOutput = transform(template, output, helpers);
    flat = flatten(postOutput);
    console.log('POST flat request to OpenEHR: ' + JSON.stringify(flat, null, 2));
  }
  return flat;

}

function run() {
  rl.question('Enter heading: ', (heading) => {
    rl.question('Enter host (eg ethercis): ', (host) => {
      if (!host || host === '') host = 'ethercis';
      var output = test(heading, host);
      rl.close();
    });
  });
}

module.exports = run;
