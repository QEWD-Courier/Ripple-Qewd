var routeParser = require('route-parser');

function init(routeArray) {
  routeArray.forEach(function(route) {
    route.route = new routeParser(route.url);
  });
  return routeArray;
}

function process(url, routeArray, callback) {
  var route;
  var args;
  var matched = false;
  for (var i = 0; i < routeArray.length; i++) {
    route = routeArray[i];
    args = route.route.match(url);
    if (args !== false) {
      matched = true;
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

  var url = '/api/patients/123'
  process(url, routes, function(results) {
    console.log('results = ' + JSON.stringify(results));
  });

  url = '/api/patients'
  process(url, routes, function(results) {
    console.log('results = ' + JSON.stringify(results));
  });

  var url = '/api/patients/123/allergies'
  process(url, routes, function(results) {
    console.log('results = ' + JSON.stringify(results));
  });

  var url = '/api/patients/123/allergies/khkjhjhkhkjhkjhhkj'
  process(url, routes, function(results) {
    console.log('results = ' + JSON.stringify(results));
  });

}

module.exports = {
  initialise: init,
  process: process,
  test: test
};