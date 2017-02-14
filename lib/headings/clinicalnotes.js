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

 14 February 2017

*/

var dateTime = require('../dateTime')

var heading = {
  name: 'clinicalnotes',
  textFieldName: 'author',
  headingTableFields: ['author', 'dateCreated',  'clinicalNotesType'],
  fieldMap: {
    note: 'note',
    clinicalNotesType: 'type',
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  },
  post: {
    templateId: 'RIPPLE - Clinical Notes.v1',
    // destination: 'marand',
    fieldMap: {
      'ctx/composer_name': {
        field: 'author',

        default: 'Dr Tony Shannon'
      },
      'ctx/health_care_facility|id': {
        default: '999999-345'
      },
      'ctx/health_care_facility|name':  {
        default: 'Ripple View Care Home'
      },
      'ctx/id_namespace': {
        default: 'NHS-UK'
      },
      'ctx/id_scheme': {
        default: '2.16.840.1.113883.2.1.4.3'
      },
      'ctx/language': {
        default: 'en'
      },
      'ctx/territory': {
        default: 'GB'
      },
      'ctx/time': {
        field: 'dateCreated',
        default: function(data) {
          return dateTime.format(new Date());
        }
      },
      'clinical_notes/clinical_synopsis:0/_name|value': {
        field: 'clinicalNotesType'
      },
      'clinical_notes/clinical_synopsis:0/notes': {
        field: 'note'
      }
    }
  }
};

module.exports = heading;
