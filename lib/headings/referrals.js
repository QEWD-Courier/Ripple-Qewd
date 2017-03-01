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

24 February 2017

*/

var dateTime = require('.././dateTime');

module.exports = {
  name: 'referrals',
  textFieldName: 'referral_from',
  headingTableFields: ['dateOfReferral', 'referralFrom', 'referralTo'],
  fieldMap: {
    author: 'author',
    dateOfReferral: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    },
    referralType: 'referral_type',
    referralReason: 'reason',
    referralSummary: 'summary',
    referralFrom: 'referralFrom',
    referralTo: 'referralTo',
    referralRef: 'referral_ref',
    referralOutcome: 'Outcome',
    referralStateDate: function(data, host) {
       return dateTime.getRippleTime(data.dateOfState, host);
    },
    referralState: 'state',
    referralStateCode: 'stateCode',
    referralCareFlow: 'careflow',
    referralServiceName: 'service_name'
  },
  post: {
    templateId: 'IDCR - Service Request.v0',
    // Default to Marand - EtherCIS not ready for Referrals yet - 24-Feb-2017
    destination: 'marand',
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
        field: 'dateCreate',
        default: function(data) {
          return dateTime.format(new Date());
        }
      },
      'request_for_service/referral_details/service_request:0/request:0/service_name': {
        field: 'referralServiceName'
      },
      'request_for_service/referral_details/service_request:0/request:0/reason_for_request': {
        field: 'referralReason'
      },
      'request_for_service/referral_details/service_request:0/request:0/reason_description': {
        field: 'referralSummary'
      },
      'request_for_service/referral_details/service_request:0/request:0/timing': {
        field: 'referralStateDate'
      },
      'request_for_service/referral_details/service_request:0/request:0/timing|formalism': {
        default: 'timing'
      },
      'request_for_service/referral_details/service_request:0/requestor/person_name/unstructured_name': {
        field: 'referralFrom'
      },
      'request_for_service/referral_details/service_request:0/receiver_identifier': {
        field: 'referralRef'
      },
      'request_for_service/referral_details/service_request:0/receiver/name_of_organisation': {
        field: 'referralTo'
      },
      'request_for_service/referral_details/service_request:0/narrative': {
        field: 'referralServiceName'
      },
      'request_for_service/referral_details/service:0/receiver_identifier': {
        field: 'referralRef'
      },
      'request_for_service/referral_details/service:0/ism_transition/current_state|code': {
        default: '526'
      },
      'request_for_service/referral_details/service:0/ism_transition/careflow_step|code': {
        default: 'at0026'
      },
      'request_for_service/referral_details/service:0/service_name': {
        field: 'referralServiceName'
      }
   }
  }
};
