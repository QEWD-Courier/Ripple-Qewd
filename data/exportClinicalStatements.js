var DocumentStore = require('ewd-document-store');
var interface = require('nodem');
var db = new interface.Gtm();
var ok = db.open();
var documentStore = new DocumentStore(db);
var fs = require('fs');

var contentStore = new documentStore.DocumentNode('qewdContentStore');
var json = contentStore.getDocument(true);
fs.writeFileSync('contentStore.json', JSON.stringify(json, null, 2), 'utf-8');

var clinicalStatements = new documentStore.DocumentNode('rippleClinStatements');
json = clinicalStatements.getDocument(true);
fs.writeFileSync('clinicalStatements.json', JSON.stringify(json, null, 2), 'utf-8');

console.log('done');

db.close();