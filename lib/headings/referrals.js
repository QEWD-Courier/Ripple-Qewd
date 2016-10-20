/*

 ----------------------------------------------------------------------------
 | rippleosi-ewd3: EWD3/ewd-xpress Middle Tier for Ripple OSI               |
 |                                                                          |
 | Copyright (c) 2016 Ripple Foundation Community Interest Company          |
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

module.exports = {
  name: 'referrals',
  query: {
    sql: [],
    aql: [
      "select " +
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_submitted," +
        "a_a/items/activities/timing/value as referral_date, " +
        "a_a/items/protocol/items/items/value/value as referral_from, " +
        "a_a/items/activities/description/items[at0121]/value/value as referral_to, " +
        "a_a/items/activities/description/items[at0062]/value/value as referral_reason, " +
        "a_a/items/activities/description/items[at0064]/value/value as clinical_summary " +
      "from EHR e " +
        "contains COMPOSITION a[openEHR-EHR-COMPOSITION.encounter.v1] " +
        "contains SECTION a_a[openEHR-EHR-SECTION.referral_details_rcp.v1] " +
        "where a/name/value='Referral' " +
        "and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' " +
        "and e/ehr_status/subject/external_ref/id/value = '"
      ,

      'nhsNo',

      "'"
    ]
  },
  textFieldName: 'referral_from',
  headingTableFields: ['dateOfReferral', 'referralFrom', 'referralTo'],
  fieldMap: {
    dateOfReferral: function(data, host) {
      return dateTime.getRippleTime(data.referral_date, host);
    },
    referralFrom: 'referral_from',
    referralTo: 'referral_to'
  }
};
