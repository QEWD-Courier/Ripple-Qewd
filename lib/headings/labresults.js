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

18 October 2016

*/

var dateTime = require('.././dateTime');

function getTestResults(record) {
  //console.log('******!!!! record = ' + JSON.stringify(record));

  if (!record.test_panel) {
    // ethercis record
    var nrange = '';
    if (record.normal_range_lower && record.normal_range_upper) {
      nrange = record.normal_range_lower + ' - ' + record.normal_range_upper;
    }
    var results = [
      {
        result: record.result_name || '',
        value:  record.result_value || '',
        unit:   record.result_unit || '',
        normalRange: nrange,
        comment: record.result_comment || ''
      }
    ];
    return results;
  }

  // marand / AQL result

  var tests = record.test_panel.items;
  var results = [];
  var test;
  for (var index in tests) {
    test = tests[index];
    var item = test.items[0];
    var nrange = item.value.normal_range;
    var range = null;
    if (nrange) range = nrange.lower.magnitude + ' - ' + nrange.upper.magnitude;
    var comment = '';
    var commentItem = test.items[1];
    if (commentItem && commentItem.name.value === 'Comment') {
      comment = commentItem.value.value;
    }
    
    var result = {
      result: item.name.value,
      value: item.value.magnitude,
      unit: item.value.units,
      normalRange: range,
      comment: comment
    };
    results.push(result);

  }
  return results;
  /*
  return  [{
        "result": "Urea xxxxx",
        "value": "7.6",
        "unit": "mmol/l",
        "normalRange": null,
        "comment": "may be technical artefact"
  }];
  */
}

module.exports = {
  name: 'labresults',
  textFieldName: 'test_name',
  headingTableFields: ['testName', 'sampleTaken', 'dateCreated'],
  fieldMap: {
    testName: 'test_name',
    sampleTaken: function(data, host) {
      return dateTime.getRippleTime(data.sample_taken, host);
    },
    status: 'status',
    conclusion: 'conclusion',
    testResults: getTestResults,
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  }
};
