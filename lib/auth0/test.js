var util = require('util');


function test(args, finished) {
  console.log(util.inspect(args));

  finished({uri: args.req.originalUri});
}

module.exports = test;

