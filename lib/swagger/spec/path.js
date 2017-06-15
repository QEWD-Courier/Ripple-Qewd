var patients = require('../../patients/patients');

function getPatientIdOperations(heading, summaryDefinition, detailDefinition) {
    const get = getGetSummary(heading, summaryDefinition);
    const post = getPostDetail(heading, detailDefinition);

    var swagger = {};
    if (get !== undefined) {
        swagger.get = get;
    }

    if (post !== undefined) {
        swagger.post = post;
    }

    const url = patients.getHeadingSummaryUrl(heading);

    const operations = {
        swagger: swagger,
        url: url
    }

    return operations;
}

function getPatientIdAndIdOperations(heading, detailDefinition) {
    const get = getGetDetail(heading, detailDefinition);;
    
    var swagger = { get: get};
    const url = patients.getHeadingDetailUrl(heading);

    const operations = {
        swagger: swagger,
        url: url
    }

    return operations;
}

function getGetDetail(heading, detailDefinition) {
    const get = {
        "summary": "Finds detail by patient and Id",
        "description": "Returns detail",
        "operationId": "get.detail." + heading,
        "produces": [
            "application/json"
        ],
        "tags": [heading],
        "parameters": [
            {
                "name": "patientId",
                "in": "path",
                "description": "ID of patient",
                "required": true,
                "type": "integer",
            },
            {
                "name": "sourceId",
                "in": "path",
                "description": "ID of the record on the source system",
                "required": true,
                "type": "integer",
            },
            {
                "name":"source",
                "in":"query",
                "description":"source of the record",
                "required":true,
                "type":"string",
            }            
        ],
        "responses": {
            "200": {
                "description": "successful operation",
                "schema": {
                    "type": "object",
                    "$ref": detailDefinition
                }
            },
            "400": {
                "description": "Invalid patient identifier and/or invalid identifier"
            }
        }
    }

    return get;
}

function getGetSummary(heading, definition) {
    const get = {
        "summary": "Finds summary by patient",
        "description": "Returns a collection of summary data",
        "operationId": "get.summary." + heading,
        "produces": [
            "application/json"
        ],
        "tags": [heading],
        "parameters": [
            {
                "name": "patientId",
                "in": "path",
                "description": "ID of patient",
                "required": true,
                "type": "integer",
                "format": "int64"
            }
        ],
        "responses": {
            "200": {
                "description": "successful operation",
                "schema": {
                    "type": "array",
                    "items": {
                        "$ref": definition
                    }
                }
            },
            "400": {
                "description": "Invalid patient identifier"
            }
        }
    }

    return get;
}

function getPostDetail(heading, definition) {
    const post = {
        "summary": "Adds a new record for the given patient",
        "description": "",
        "operationId": "post.detail." + heading,
        "consumes": [
            "application/json"
        ],
        "produces": [
            "application/json"
        ],
        "tags": [heading],
        "parameters": [
            {
                "name": "patientId",
                "in": "path",
                "description": "ID of patient",
                "required": true,
                "type": "integer",
                "format": "int64"
            },
            {
                "in": "body",
                "name": "body",
                "description": "Record to be created",
                "required": true,
                "schema": {
                    "type": "object",
                    "$ref": definition
                }
            }
        ],
        "responses": {
            "200": {
                "description": "Successful operation"
            },
            "400": {
                "description": "Invalid input or invalid patient identifer"
            }
        }
    }

    return post;
}

module.exports = {
    getPatientIdOperations: getPatientIdOperations,
    getPatientIdAndIdOperations: getPatientIdAndIdOperations
};