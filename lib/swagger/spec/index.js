function getIndex(host, basePath, infoRef, pathsRef, definitionsRef, tagsRef) {
  var swagger = {
    "swagger": "2.0",
    "host": host,
    "basePath": basePath,
    "info": {
      "$ref": infoRef
    },
    "paths": {
      "$ref": pathsRef
    },
    "definitions": {
      "$ref": definitionsRef
    },
    "tags": {
      "$ref" : tagsRef
    }
  }
  return swagger;
}

module.exports = {
  getIndex: getIndex
};