var definitions = {
  labresults: require('./labresults')
}

function getDetailAndSummary(heading, detailPropertyNames, summaryPropertyNames) {
var swagger = {
    "Detail":{
        "type":"object",
        "properties": getDetailProperties(heading, detailPropertyNames) 
    },
    "Summary":{
        "type":"object",
        "properties": getSummaryProperties(heading, summaryPropertyNames) 
    }
  }

  return swagger;
}

function getSummaryProperties(heading, propertyNames) {
  var properties = getProperties();
  var propertyName;
  for(var propertyNameIndex in propertyNames) {
    propertyName = propertyNames[propertyNameIndex];
    properties[propertyName] = getPropertyDefintion(propertyName);
  }

  return properties;
}

function getDetailProperties(heading, propertyNames) {
  // do we have a hand-crafted heading definition
  var definition = {definition: {}};
  if(definitions[heading] !== undefined) {
    definition = definitions[heading];
  }
  
  var properties = getProperties();
  var propertyDefintion;
  var propertyName;
  for(var propertyNameIndex in propertyNames) {
    propertyDefintion = definition.definition[propertyNameIndex];
    if(propertyDefintion === undefined) {
      propertyDefintion = getPropertyDefintion(propertyNameIndex);
    }

    properties[propertyNameIndex] = propertyDefintion;
  } 

  return properties;
}

function getProperties() {
  return { sourceId : getPropertyDefintion("sourceId"), 
           source : getPropertyDefintion("source")};
}

function getPropertyDefintion(property) {
  var defintion = {type: "string"};

  if(property.startsWith("date")) {
    defintion = {type: "string", format: "date-time"};
  }

    return defintion;
}

function getDetailDefinitionRef(path) {
  return path + "#/Detail";
}

function getSummaryDefinitionRef(path) {
  return path + "#/Summary";
}


module.exports = {
  getDetailAndSummary: getDetailAndSummary,
  getDetailDefinitionRef: getDetailDefinitionRef,
  getSummaryDefinitionRef: getSummaryDefinitionRef
};