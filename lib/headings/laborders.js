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

  26 January 2017

*/

var dateTime = require('.././dateTime');

module.exports = {
  name: 'laborders',
  textFieldName: 'name',
  headingTableFields: ['name', 'orderDate'],
  fieldMap: {
    name: 'name',
    code: 'code',
    terminology: 'terminology',
    orderDate: function(data, host) {
      return dateTime.getRippleTime(data.date_ordered, host);
    },
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  },
  post: {
    // destination: 'ethercis',
    templateId: 'IDCR - Laboratory Order.v0',
    fieldMap: {
      'ctx/composer_name': {
        field: 'author',
        default: 'Dr Tony Shannon'
      },
      'ctx/health_care_facility|id': {
        field: 'healthcareFacilityId',
        default: '999999-345'
      },
      'ctx/health_care_facility|name':  {
        field: 'healthcareFacilityName',
        default: 'Northumbria Community NHS'
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
        field: 'dateTimeRecorded',
        default: function(data) {
          return new Date().toISOString()
        }
      },
      'laboratory_order/laboratory_test_request/lab_request/service_requested|code': {
        field: 'code'
      },
      'laboratory_order/laboratory_test_request/lab_request/service_requested|value': {
        field: 'name'
      },
      'laboratory_order/laboratory_test_request/lab_request/service_requested|terminology': {
        field: 'terminology',
        default: 'SNOMED-CT'
      },
      'laboratory_order/laboratory_test_request/lab_request/timing': {
        field: 'dateCreated'
      },
      'laboratory_order/laboratory_test_request/lab_request/timing|formalism': {
        default: 'timing'
      },
      'laboratory_order/laboratory_test_request/narrative': {
        field: 'name'
      },
      'laboratory_order/laboratory_test_tracker/ism_transition/current_state|code': {
        default: '526'
      },
      'laboratory_order/laboratory_test_tracker/ism_transition/current_state|value': {
        default: 'planned'
      },
      'laboratory_order/laboratory_test_tracker/ism_transition/current_state|terminology': {
        default: 'openehr'
      },
      'laboratory_order/laboratory_test_tracker/ism_transition/careflow_step|code': {
        default: 'at0003'
      },
      'laboratory_order/laboratory_test_tracker/ism_transition/careflow_step|value': {
        default: 'Test Requested'
      },
      'laboratory_order/laboratory_test_tracker/ism_transition/careflow_step|terminology': {
        default: 'local'
      },

      'laboratory_order/laboratory_test_tracker/test_name|code': {
        field: 'code'
      },
      'laboratory_order/laboratory_test_tracker/test_name|value': {
        field: 'name'
      },
      'laboratory_order/laboratory_test_tracker/test_name|terminology': {
        field: 'terminology',
        default: 'SNOMED-CT'
      }
    }
  }
};
