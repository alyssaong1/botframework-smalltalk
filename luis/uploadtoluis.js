/*-----------------------------------------------------------------------------
This script uploads all the small talk utterances to a single small talk intent 
in LUIS. When a user's utterance falls into the small talk intent, it should go
to the QnA maker to obtain a response. 
-----------------------------------------------------------------------------*/

// This loads the environment variables from the .env file
require('dotenv-extended').load();

var rp = require('request-promise');
var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('smalltalkkb.txt');

var batchlabels = [];
var count = 0;

var appId = process.env.LUIS_APP_ID;
var subKey = process.env.LUIS_KEY;
var version = process.env.LUIS_VERSION;

// Iterate through the lines
lr.on('line', function (line) {
    var label = {};
    label.text = line;
    label.intentName = "SmallTalk"; // change this to the intent name for smalltalk in your luis model
    batchlabels.push(label);
    count += 1;
    if (count >= 100) {
        lr.pause();
        // Process the 100 lines - send as batch to LUIS
        labelsToSend = batchlabels;
        setTimeout(function () {
            uploadToLuis(labelsToSend);
            batchlabels = [];
            count = 0;
        }, 1000)
    }
});

lr.on('close', function () {
    uploadToLuis(batchlabels)
})


function uploadToLuis(labels) {
    var options = {
        method: 'POST',
        uri: 'https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/' + appId + '/versions/' + version + '/examples',
        json: true,
        body: labels,
        headers: {
            "Ocp-Apim-Subscription-Key": subKey,
            "Content-Type": "application/json"
        }
    };
    rp(options)
        .then(function (body) {
            // POST succeeded
            console.log('Batch post successful.');
            lr.resume();
        })
        .catch(function (err) {
            // POST failed
            console.log('Web request failed: ' + response.statusMessage);
            lr.close(); // stop line reader
            return;
        });
}