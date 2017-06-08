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

 8 June 2017

*/

var heading = {
  name: 'vitalsigns',
  textFieldName: 'author',
  headingTableFields: ['author', 'dateCreated',  'newsScore', 'respirationRate', 'oxygenSupplemental', 
    'heartRate', 'temperature', 'levelOfConsciousness', 'systolicBP', 'diastolicBP', 'oxygenSaturation'],

  get: {

    helperFunctions: {
      getOnAir: function(onAir) {
        var oppBool = (onAir !== 'true');
        return oppBool.toString();
      },
      getLevelOfConsciousness: function(levelOfConsciousnessCode) {
        switch (levelOfConsciousnessCode) {
          case "at0005":
            return "Alert";
            break;
          case "at0006":
            return "Voice";
            break;
          case "at0007":
            return "Pain";
            break;
          case "at0008":
            return "Unresponsive";
            break;
          default:
            return 'Not known'
        }
      }
    },

    transformTemplate: {
      respirationRate:      '{{respiratoryRate}}',
      oxygenSupplemental:   '=> getOnAir(onAir)',
      heartRate:            '{{heartRate}}',
      temperature:          '{{temperature}}',
      levelOfConsciousness: '=> getLevelOfConsciousness(levelOfConsciousnessCode)',
      systolicBP:           '{{systolic}}',
      diastolicBP:          '{{diastolic}}',
      oxygenSaturation:     '{{oxygenSats}}',
      newsScore:            '{{newsScore}}',
      author:               '{{author}}',
      dateCreated:          '=> getRippleTime(date_created)',
      source:               '=> getSource()',
      sourceId:             '=> getUid(uid)'
    }

  },

  post: {
    templateId: 'IDCR - Vital Signs Encounter.v1',

    helperFunctions: {
      getOnAir: function(oxSup) {
        var oppBool = (oxSup !== 'true');
        return oppBool.toString();
      },
      getAvpu: function(levelOfConsciousness) {
        switch (levelOfConsciousness) {
          case "Alert":
            return "at0005";
            break;
          case "Voice":
            return "at0006";
            break;
          case "Pain":
            return "at0007";
            break;
          case "Unresponsive":
            return "at0008";
            break;
          default:
            return 'Not known';
        }
      }
    },

    transformTemplate: {
      ctx: {
        composer_name:               '=> either(author, "Dr Tony Shannon")',
        'health_care_facility|id':   '=> either(healthcareFacilityId, "999999-345")',
        'health_care_facility|name': '=> either(healthcareFacilityName, "Ripple View Care Home")',
        id_namespace:                'NHS-UK',
        id_scheme:                   '2.16.840.1.113883.2.1.4.3',
        language:                    'en',
        territory:                   'GB',
        time:                        '=> now()'
      },

      vital_signs_observations: {
        vital_signs: {
          respirations: {
            'rate|magnitude':        '{{respirationRate}}',
            inspired_oxygen: {
              on_air:                '=> getOnAir(oxygenSupplemental)'
            }
          },
          pulse_heart_beat: {
            'heart_rate|magnitude':  '{{heartRate}}'
          },
          body_temperature: {
            'temperature|magnitude': '{{temperature}}'
          },
          avpu: {
            'avpu_observation|code': '=> getAvpu(levelOfConsciousness)'
          },
          blood_pressure: {
            'systolic|magnitude':    '{{systolicBP}}',
            'diastolic|magnitude':   '{{diastolicBP}}'
          },
          indirect_oximetry: {
            'spo2|numerator':        '{{oxygenSaturation}}'
          },
          news_uk_rcp: {
            total_score:             '{{newsScore}}'
          }
        }
      }
    }
  }
};

module.exports = heading;
