'use strict';

var swaggerGenerator = require('../lib/swagger/swaggerGenerator');


main(process.argv[2], process.argv[3], process.argv[4]);

function main(outputDir, host, basePath) {

  swaggerGenerator.writeSpec(outputDir, host, basePath);

}


