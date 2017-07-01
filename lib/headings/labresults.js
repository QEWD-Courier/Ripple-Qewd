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

10 April 2017

*/

module.exports = {
  name: 'labresults',
  textFieldName: 'test_name',
  headingTableFields: ['testName', 'sampleTaken', 'dateCreated'],

  get: {

    helperFunctions: {
      init: function(data) {
        // normalise Ethercis response data to look like Marand's

        if (typeof data.test_panel === 'undefined') {
          data.test_panel = {
            items: [
              {
                items: [
                  {
                    name: {
                      value: data.result_name || ''
                    },
                    value: {
                      magnitude: data.result_value || '',
                      units: data.result_unit || '',
                      normal_range: {
                        lower: {
                          magnitude: data.normal_range_lower || ''
                        },
                        upper: {
                          magnitude: data.normal_range_upper || ''
                        }
                      }
                    }
                  },
                  {
                    name: {
                      value: 'Comment'
                    },
                    value: {
                      value: data.result_comment || ''
                    },
                  }
                ]
              }
            ]
          };
        }
        return data;
      },
      getNormalRange: function(from, to) {
        if (typeof to === 'undefined') return from;
        return from + ' - ' + to;
      },
      getComment: function(item) {
        var comment = '';
        if (item && item.name && item.value && item.name.value === 'Comment') comment = item.value.value || '';
        return comment;
      }
    },

    transformTemplate: {
      testName:    '{{test_name}}',
      sampleTaken: '=> getRippleTime(sample_taken)',
      status:      '{{status}}',
      conclusion:  '{{conclusion}}',
      testResults: [
        '{{test_panel.items}}',
        {
          result:      '{{items[0].name.value}}',
          value:       '{{items[0].value.magnitude}}',
          unit:        '{{items[0].value.units}}',
          normalRange: '=> getNormalRange(items[0].value.normalRange.interval.lower.magnitude, items[0].value.normalRange.interval.upper.magnitude)',
          comment:     '=> getComment(items[1])'
        }
      ],
      author:      '{{author}}',
      dateCreated: '=> getRippleTime(date_created)',
      source:      '=> getSource()',
      sourceId:    '=> getUid(uid)'
    }

  }
};
