const natural = require('natural');
let classifier = new natural.BayesClassifier();

var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

var inputFile='smalltalkkb.tsv';

var parser = parse({delimiter: '\t'}, function (err, data) {
    for (var i = 0; i < data.length; i++) {
        if (i > 0) {
            classifier.addDocument(data[i][0], data[i][1]);
        }
    }

    classifier.train();
    console.log('Training complete for Small talk classifier.');

    classifier.save('natural/smalltalk-classifier.json', function(err, classifier) {
        // the classifier is saved to a json file!
        if (err) {
            console.log(err)
        }
        console.log('Small talk classifier saved as smalltalk-classifier.json.');
    });
});
fs.createReadStream(inputFile).pipe(parser);

