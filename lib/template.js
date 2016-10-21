function replace(string, substitutions) {
  var pieces = string.split("{{");
  if (pieces.length === 1) return string; // no replacements needed
  var output = '';
  pieces.forEach(function(piece) {
    var pieces2 = piece.split("}}");
    if (pieces2.length === 1) {
      output = piece;
    }
    else {
      var name = pieces2[0];
      if (substitutions[name]) {
        output = output + substitutions[name] + pieces2[1];
      }
      else {
        output = output + pieces2[1]; // no substitution possible
      }
    }
  });
  return output;
}

function test() {

  var string = 'This is a test string';

  var subs = {
    patientId: 123456,
    aaaa: 'replacement for aaa',
    bbb: 'replacement for bbb'
  };

  var string = 'This is a test string';
  var output = replace(string, subs);
  console.log('-----');
  console.log(string);
  console.log(output);

  var string = '{{aaa}}This is a test string';
  var output = replace(string, subs);
  console.log('-----');
  console.log(string);
  console.log(output);

  var string = '{{aaaa}}This is a test string';
  var output = replace(string, subs);
  console.log('-----');
  console.log(string);
  console.log(output);

  var string = 'This is a test string {{aaaa}}';
  var output = replace(string, subs);
  console.log('-----');
  console.log(string);
  console.log(output);

  var string = '{{aaaa}} This {{bbb}} is a test string';
  var output = replace(string, subs);
  console.log('-----');
  console.log(string);
  console.log(output);

  var string = '{{aaaa}} This {{bbb}} is a test string {{patientId}}';
  var output = replace(string, subs);
  console.log('-----');
  console.log(string);
  console.log(output);

  var string = '{{aaaa}} This is a test string {{patientId}}';
  var output = replace(string, subs);
  console.log('-----');
  console.log(string);
  console.log(output);

}

module.exports = {
  replace: replace,
  test: test
};