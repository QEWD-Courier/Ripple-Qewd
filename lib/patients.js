var mpv = require('./mpv'); // Multiple Patient View
var spv = require('./spv'); // Single Patient View

function patients(messageObj, finished) {
  if (messageObj.params && messageObj.params['0']) {
    var path = messageObj.params['0'];
    if (path !== '') {
      var pathArr = path.split('/');
      var nhsNo = pathArr[0];
      var domain = pathArr[1];
      var sourceId = pathArr[2];
      var results;
      if (!domain) {
        spv.patientSummary.call(this, nhsNo, function(results) {
          finished(results);
          return;
        });
        return;
      }
      if (domain === 'diagnoses') domain = 'problems';
      if (!sourceId) {
        if (messageObj.method === 'POST') {
          spv.postDomain.call(this, nhsNo, domain, messageObj.body, function() {
            finished({ok: true});
          });
          return;
        }
        spv.getDomainTable.call(this, nhsNo, domain, function(results) {
          finished(results);
          return;
        });
        return;
      }
      results = spv.patientDomainDetail.call(this, nhsNo, domain, sourceId);
      finished(results);
      return;
    }
    finished({error: 'Missing patient Id in path: ' + JSON.stringify(messageObj)});
    return;
  }
  // no patient Id specified, so fetch entire list
  mpv.getPatients.call(this, finished);
}

module.exports = {
  init: function() {
    mpv.init.call(this);
    spv.init.call(this);
  },
  api: patients
};
