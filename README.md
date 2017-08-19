# Small Talk Module for the Microsoft Bot Framework #
Ever had the problem of needing to handle countless types of small talk (e.g. "hello", "goodbye", "tell me a joke", "what's up")? This is a plug n play small talk module, using QnA maker and combinable with LUIS. 

*Note: This is a port over from API.AI's small talk module. It uses the same intents and scripted replies.*

I have used QnA maker because 1. It is the most cost effective solution, and 2. Creating an intent for each type of smalltalk intent is not scalable in the long run. I understand that QnA maker is traditionally used for knowledge base scenarios, but hey if it works then why not. 

**How it works:** An excel containing the question and intent matches is uploaded to QnA maker. In the bot, the result from QnA maker is mapped to a list of possible responses (see *smalltalk.js* in the *lib* folder), which are selected at random. 

## Demo ##
To be uploaded

## Installation and usage instructions ##

### Configure QnA Maker
Create a QnA maker service for free [here](https://qnamaker.ai). Start from scratch.

Click on "Replace knowledge base". Upload the smalltalk.tsv file. Publish it as a web service.

### Populate the environment variables
Go into the .env file and replace with knowledge base id and subscription key which you can find in the settings page of the QnA maker portal.

### Running the sample

Build using `npm install` then run it using `npm start`. You can now test it in the Bot Framework emulator.

### Call the QnA module in your own bot code
```js
var QnAClient = require('../lib/client');
...
var qnaClient = new QnAClient({
    knowledgeBaseId: process.env.KB_ID,
    subscriptionKey: process.env.QNA_KEY,
    scoreThreshold: 0.5 // OPTIONAL: Default value is 0.2
});
...
// Post user's question to QnA smalltalk kb
qnaClient.post({ question: session.message.text }, function (err, res) {
    if (err) {
        console.error('Error from callback:', err);
        session.send('Oops - something went wrong.');
        return;
    }

    if (res) {
        // Send reply from QnA back to user
        session.send(res);
    } else {
        // Confidence in top result is not high enough - discard result
        session.send('Hmm, I didn\'t quite understand you there. Care to rephrase?')
    }
});
```

### Optional: Integrating with your existing LUIS model
We are going to create an intent called "smalltalk" and upload all the smalltalk utterances into this intent through the LUIS API. 

Go to the LUIS portal, create an intent called "smalltalk". Then `cd` into the luis folder, and run `node uploadtoluis`. Wait for all the utterances to be uploaded to LUIS (you'll see the batch request success message about ~10 times). You should see on your intents dashboard that there are ~1473 utterances in the smalltalk intent. 

Retrain and publish your LUIS model - any smalltalk from the user will now be routed to the smalltalk intent, which you can pass to the QnA maker smalltalk module in your code.

### Customising responses ###
You can customize responses or add additional utterances through the .tsv file (then reupload to QnA maker) or directly in the QnA maker portal.

