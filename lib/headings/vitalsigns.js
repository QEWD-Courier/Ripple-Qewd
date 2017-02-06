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

 31 January 2017

 */

var dateTime = require('../dateTime')

var heading = {
  name: 'vitalsigns',
  textFieldName: 'author',
  headingTableFields: ['author', 'dateCreated'],
  fieldMap: {
    respiratoryRate: 'respiratoryRate',
    onAir: 'onAir',
    heartRate: 'heartRate',
    temperature: 'temperature',
    levelOfConsciousnessCode: 'levelOfConsciousnessCode',
    systolic: 'systolic',
    diastolic: 'diastolic',
    oxygenSats: 'oxygenSats',
    newsScore: 'newsScore',
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  },
  post: {
    templateId: 'IDCR - Vital Signs Encounter.v1',
    destination: 'ethercis',
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
      'vital_signs_observations/vital_signs/respirations/rate|magnitude': {
        field: 'respiratoryRate'
      },
      'vital_signs_observations/vital_signs/respirations/inspired_oxygen/on_air': {
        default: function(data) {
          var boolValue = (data.onAir === 'true');
          // return the inverted value as a string
          return boolValue ? 'false' : 'true';
        }
      },
      'vital_signs_observations/vital_signs/pulse_heart_beat/heart_rate|magnitude': {
        field: 'heartRate'
      },
      'vital_signs_observations/vital_signs/body_temperature/temperature|magnitude': {
        field: 'temperature'
      },
      'vital_signs_observations/vital_signs/avpu/avpu_observation|code': {
        field: 'levelOfConsciousnessCode'
      },
      'vital_signs_observations/vital_signs/blood_pressure/systolic|magnitude': {
        field: 'systolic'
      },
      'vital_signs_observations/vital_signs/blood_pressure/diastolic|magnitude': {
        field: 'diastolic'
      },
      'vital_signs_observations/vital_signs/indirect_oximetry/spo2|numerator': {
        field: 'oxygenSats'
      },
      'vital_signs_observations/vital_signs/news_uk_rcp/total_score': {
        field: 'newsScore'
      }
    }
  }
};

module.exports = heading;
