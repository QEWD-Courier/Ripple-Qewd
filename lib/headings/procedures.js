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
 | Author: Dinesh Patel - Leidos                                            |
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

var dateTime = require('.././dateTime');

module.exports = {
  name: 'procedures',
  textFieldName: 'procedure_name',
  headingTableFields: ['name', 'date', 'time'],

  get: {

    transformTemplate: {
      name:                 '{{procedure_name}}',
      procedureName:        '{{procedure_name}}',
      procedureCode:        '{{procedure_code}}',
      date:                 '=> getRippleTime(procedure_datetime)',
      time:                 '=> msAfterMidnight(procedure_datetime)',
      procedureTerminology: '{{procedure_terminology}}',
      notes:                '{{procedure_notes}}',
      performer:            '{{performer}}',
      currentStatus:        '{{procedure_state}}',
      author:               '{{author}}',
      dateSubmitted:        '=> getRippleTime(date_submitted)',
      source:               '=> getSource()',
      sourceId:             '=> getUid(uid)',
      originalComposition:  '{{originalComposition}}',
      originalSource:       '{{originalSource}}'
    }

  },

  post: {
    // destination: 'ethercis',
    templateId: 'IDCR - Procedures List.v1',

    helperFunctions: {
      combineDateAndTime: function(date, time) {
        var d = new Date(date);
        var t = new Date(time);
        var dt = new Date(d.toDateString() + ' ' + t.toTimeString());
        return dateTime.format(dt);
      }
    },

    transformTemplate: {
      ctx: {
        composer_name:               '=> either(author, "Dr Tony Shannon")',
        'health_care_facility|id':   '=> either(healthcareFacilityId, "999999-345")',
        'health_care_facility|name': '=> either(healthcareFacilityName, "Rippleburgh General Hospital")',
        id_namespace:                'NHS-UK',
        id_scheme:                   '2.16.840.1.113883.2.1.4.3',
        language:                    'en',
        territory:                   'GB',
        time:                        '=> now()'
      },
      procedures_list: {
        procedures: {
          procedure: [
            {
              'procedure_name|value':       '{{procedureName}}',
              procedure_notes:              '{{notes}}',
              ism_transition: {
                'current_state|value':      '{{status}}',
                'careflow_step|code':        'at0043'
              },
              'procedure_name|terminology': 'SNOMED-CT',
              'procedure_name|code':        '{{procedureCode}}',
              _other_participation: [
                {
                  '|name':                  'Performer',
                  '|function':              '{{performer}}'
                }
              ],
              time:                         '=> combineDateAndTime(date, time)',
              "_provider|name":             '=> either(originalComposition, "<!delete>")',
              "_provider|id":               '=> either(originalSource, "<!delete>")',  
            }
          ]
        }
      },
    }
  }
};
