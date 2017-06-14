var DocumentStore = require('ewd-document-store');
var interface = require('nodem');
var db = new interface.Gtm();
var ok = db.open();
var documentStore = new DocumentStore(db);
var fs = require('fs');

var text = fs.readFileSync('node_modules/qewd-ripple/data/contentStore.json', 'utf-8');
var json = JSON.parse(text);

var contentStore = new documentStore.DocumentNode('qewdContentStore');
contentStore.setDocument(json);

text = fs.readFileSync('node_modules/qewd-ripple/data/clinicalStatements.json', 'utf-8');
json = JSON.parse(text);
var clinicalStatements = new documentStore.DocumentNode('rippleClinStatements');
clinicalStatements.setDocument(json);

console.log('done');

db.close();
