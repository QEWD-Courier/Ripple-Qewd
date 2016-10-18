var dateTime = require('./dateTime');

module.exports = {
  name: 'appointments',
  query: {
    sql: [],
    aql: [
      "select " +
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_created, " +
        "b_a/description/items[at0011]/value/value as service_team, " +
        "b_a/description/items[at0026]/value/lower/value as appointment_date, " +
        "b_a/protocol/items/items/items[at0002]/value/value as location, " +
        "b_a/ism_transition/current_state/value as status " +
      "from EHR e " +
      "contains COMPOSITION a[openEHR-EHR-COMPOSITION.encounter.v1] " +
      "contains ACTION b_a[openEHR-EHR-ACTION.referral_uk.v1] " +
      "where a/name/value='Referral' " +
      "and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' " +
      "and e/ehr_status/subject/external_ref/id/value = '",

      'nhsNo',

      "'"
    ],
  },
  textFieldName: 'serviceTeam',
  domainTableFields: ['serviceTeam', 'dateOfAppointment', 'timeOfAppointment'],
  fieldMap: {
    serviceTeam: 'service_team',
    dateOfAppointment: function(data, host) {
      return dateTime.msAtMidnight(data.appointment_date, host, true);
    },
    timeOfAppointment: function(data, host) {
      console.log('*** appointmentDate: ' + data.appointment_date);
      var d = new Date(data.appointment_date).getTime() - 3600000;
      return dateTime.msSinceMidnight(d, host, true);
    },
    location: 'location',
    status: 'status',
    author: 'author',
    dateCreated: function(data, host) {
      console.log('*** date created: ' + data.date_created);
      return dateTime.getRippleTime(data.date_created, host);
    }
  },
  post: {
    destination: 'marand',
    templateId: 'RIPPLE - Minimal referral.v0',
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
        default: 'Rippleburgh GP Practice'
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
          return new Date().toISOString();
        }
      },

      'referral/referral_details:0/schedule_appointment/referral_to': {
        field: 'serviceTeam'
      },
      'referral/referral_details:0/schedule_appointment/appointment_schedule/lower': {
        default: function(data) {
          var apptDate = new Date(data.dateOfAppointment).getTime();
          var apptTime = dateTime.msSinceMidnight(data.timeOfAppointment) + 3600000;
          var d = new Date(apptDate + apptTime).toISOString();
          return d;
        }
      },
      'referral/referral_details:0/schedule_appointment/appointment_schedule/upper': {
        default: function(data) {
          var apptDate = new Date(data.dateOfAppointment).getTime();
          var apptTime = dateTime.msSinceMidnight(data.timeOfAppointment) + 7200000;
          var d = new Date(apptDate + apptTime).toISOString();
          return d;
        }
      },
      'referral/referral_details:0/schedule_appointment/receiver/address:0/location': {
        field: 'location'
      },
      'referral/referral_details:0/schedule_appointment/ism_transition/current_state|value': {
        field: 'status'
      },
      'referral/referral_details:0/schedule_appointment/time': {
        field: 'dateCreated'
      }
    }
  }
};
