function getInfo() {
  var swagger = {
    "description": "The endpoints and data structures that make up the core API",
    "version": "1.0.0",
    "title": "The Ripple IDCR core API",
    "contact": {
      "email": "codecustodian@rippleosi.org"
    },
    "license": {
      "name": "Apache 2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
    }
  }
  return swagger;
}

module.exports = {
  getInfo: getInfo
};