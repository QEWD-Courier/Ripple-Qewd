
const definition = {
  testResults: {
    type: "array",
    "items": {
      type: "object",
      properties: {
        result: { type: "string" },
        value: { type: "string" },
        unit: { type: "string" },
        normalRange: { type: "string" },
        comment: { type: "string" }
      }
    }
  }
};

module.exports = {
  definition: definition
};