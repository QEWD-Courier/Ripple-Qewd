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

module.exports = {
  name: 'mdtreports',
  textFieldName: 'serviceTeam',
  headingTableFields: ['serviceTeam', 'dateOfRequest', 'dateOfMeeting'],

  get: {

    transformTemplate: {
      serviceTeam:     '{{service_team}}',
      dateOfRequest:   '=> getRippleTime(request_date)',
      dateOfMeeting:   '=> getRippleTime(meeting_date)',
      timeOfMeeting:   '=> msAfterMidnight(meeting_date)',
      servicePageLink: '',
      question:        '{{question}}',
      notes:           '{{notes}}',
      source:          '=> getSource()',
      sourceId:        '=> getUid(uid)'
    }

  }
};
