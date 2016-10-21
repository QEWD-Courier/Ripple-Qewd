var routeParser = require('route-parser');

function init(routeArray) {
  routeArray.forEach(function(route) {
    route.route = new routeParser(route.url);
  });
  return routeArray;
}

function process(res, routeArray, callback) {
  var route;
  var args;
  var url = res.path;
  var matched = false;
  for (var i = 0; i < routeArray.length; i++) {
    route = routeArray[i];
    args = route.route.match(url);
    if (args !== false) {
      matched = true;
      args.res = res;
      if (route.method) route.method.call(this, args, callback);
      break;
    }
  }
  if (!matched) {
    callback({error: 'url could not be matched'});
  }
}

function test() {

  // define the test processing functions

 //  they should be functions with 2 arguments: the args object from the route parser
 //  and a callback function that will handle an object called results

  var spv = {
    getPatientSummary: function(args, callback) {
      var results = {
        ran: 'spv.getPatientSummary',
        args: args
      };
      callback(results);
    },
    getHeadingDetail: function(args, callback) {
      var results = {
        ran: 'spv.getHeadingDetail',
        args: args
      };
      callback(results);
    },
    getHeadingTable: function(args, callback) {
      var results = {
        ran: 'spv.getHeadingTable',
        args: args
      };
      callback(results);
    }
  };

  var mpv = {
    getPatients: function(args, callback) {
      var results = {
        ran: 'mpv.getPatients',
        args: args
      };
      callback(results);
    }
  };

  var routes = [
    {
      url: '/api/patients/:patientId/:heading/:sourceId',
      method: spv.getHeadingDetail
    },
    {
      url: '/api/patients/:patientId/:heading',
      method: spv.getHeadingTable
    },
    {
      url: '/api/patients/:patientId',
      method: spv.getPatientSummary
    },
    {
      url: '/api/patients',
      method: mpv.getPatients
    }
  ];
  // set up the routing
  routes = init(routes);

  var res = {path: '/api/patients/123'};
  process(res, routes, function(results) {
    console.log('results = ' + JSON.stringify(results));
  });

  res = {path: '/api/patients'};
  process(res, routes, function(results) {
    console.log('results = ' + JSON.stringify(results));
  });

  res = {path: '/api/patients/123/allergies'};
  process(res, routes, function(results) {
    console.log('results = ' + JSON.stringify(results));
  });

  res = {path: '/api/patients/123/allergies/khkjhjhkhkjhkjhhkj'};
  process(res, routes, function(results) {
    console.log('results = ' + JSON.stringify(results));
  });

  var aql =       "select " +
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_created, " +
        "b_a/data[at0001]/items[at0002]/value/value as cause, " +
        "b_a/data[at0001]/items[at0002]/value/defining_code/code_string as cause_terminology, " +
        "b_a/data[at0001]/items[at0002]/value/defining_code/terminology_id/value as cause_code, " +
        "b_a/data[at0001]/items[at0009]/items[at0011]/value/value as reaction, " +
        "b_a/data[at0001]/items[at0009]/items[at0011]/value/defining_code/codeString as reaction_code, " +
        "b_a/data[at0001]/items[at0009]/items[at0011]/value/terminology_id/value as reaction_terminology " +
      "from EHR e [ehr_id/value = '" +
      ":patientId" +
      "'] " +
      "contains COMPOSITION a[openEHR-EHR-COMPOSITION.adverse_reaction_list.v1] " +
      "contains EVALUATION b_a[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1] " +
      "where " +
        "a/name/value='Adverse reaction list'";
  var route = new routeParser(aql);
  console.log('** ' + unescape(route.reverse({patientId: 123445})));

}

module.exports = {
  initialise: init,
  process: process,
  test: test
};