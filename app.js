// This loads the environment variables from the .env file
require('dotenv-extended').load();

// Register bot
var bot = require('./bot');
// Initialize server
var restify = require('restify');
var server = restify.createServer();

server.post('/api/messages', bot.listen());

// Start listening
var port = process.env.port || process.env.PORT || 3979;
server.listen(port, function () {
    console.log('Server listening on port %s', port);
});