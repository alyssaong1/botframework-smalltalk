var builder = require('botbuilder');
const natural = require('natural');
const smallTalkReplies = require('../lib/smalltalk');


let st_classifier = null;
natural.BayesClassifier.load('natural/smalltalk-classifier.json', null, function(err, classifier) {
   st_classifier = classifier;
});

//=========================================================
// Bot Setup
//=========================================================

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});



// Bot Storage: Here we register the state storage for your bot.
// Default store: volatile in-memory store - Only for prototyping!
// We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
// For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
var inMemoryStorage = new builder.MemoryBotStorage();

var bot = new builder.UniversalBot(connector, '/').set('storage', inMemoryStorage); // Register in memory storage;

bot.dialog('/', [
    (session, args) => {
        // Post user's question to classifier
        var intent = st_classifier.classify(session.message.text);
        // Obtain the response based on intent
        var botreplylist = smallTalkReplies[intent];
        var botreply = botreplylist[Math.floor(Math.random() * botreplylist.length)];
        // Send response back to user
        session.send(botreply);
    }
]);

// Enable Conversation Data persistence
bot.set('persistConversationData', true);

// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function(message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function(identity) {
            if (identity.id === message.address.bot.id) {
                // bot.beginDialog(message.address, '/');
                var msg = new builder.Message().address(message.address);
                msg.text('Hello, how may I help you?');
                msg.textLocale('en-US');
                bot.send(msg);
            }
        });
    }
});

// Connector listener wrapper to capture site url
function listen() {
    return connector.listen();
}

// Other wrapper functions
function beginDialog(address, dialogId, dialogArgs) {
    bot.beginDialog(address, dialogId, dialogArgs);
}

function sendMessage(message) {
    bot.send(message);
}

module.exports = {
    listen: listen,
    beginDialog: beginDialog,
    sendMessage: sendMessage
};
