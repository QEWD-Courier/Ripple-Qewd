var headings = require('./../lib/headings/headings');
var openEHR = require('./../lib/openEHR/openEHR');
var template = require('./../lib/template');

Object.keys(openEHR.servers).forEach(function(server) {
  var session;

  // Create a session with the current openEHR server
  beforeEach(function(done) {
    openEHR.startSession(server, function(res) {
      session = res.id;
      done();
    });
  });

  afterEach(function(done) {
    openEHR.stopSession(server, session, done);
  });

  function request(url, data, done, process) {
    openEHR.request({
      url: url,
      queryString: data,
      host: server,
      session: session,
      processBody: process,
      callback: done
    });
  }

  describe("OpenEHR Server " + server, function() {
    var ivorCoxNhsId = 9999999000;
    var ivorCoxEhrId;

    beforeEach(function(done) {
      request('/rest/v1/ehr', {
          subjectId: ivorCoxNhsId,
          subjectNamespace: 'uk.nhs.nhs_number'
        }, done, function(res) { ivorCoxEhrId = res.ehrId;}
      );
    });

    // For each heading which has an aql defined
    Object.keys(headings.headings).forEach(function(headingName) {
      var heading = headings.headings[headingName];
      describe("using " + headingName, function() {
        if(heading.query && heading.query.aql) {
          it("can get Ivor Cox details using AQL", function(done) {
            aql = template.replace(heading.query.aql,{
              patientId: ivorCoxNhsId, ehrId: ivorCoxEhrId
            });

            request('/rest/v1/query', {aql:aql}, done, function(res) {
              expect(res.resultSet).toBeTruthy();
            });
          });
        }
      });
    });
  });
});
