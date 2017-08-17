var request = require('request');
var smallTalkReplies = require('./smalltalk');

function Client(opts) {
    if (!opts.knowledgeBaseId) throw new Error('knowledgeBaseId is required');
    if (!opts.subscriptionKey) throw new Error('subscriptionKey is required');

    var self = this;
    this.knowledgeBaseId = opts.knowledgeBaseId;
    this.subscriptionKey = opts.subscriptionKey;
    this.scoreThreshold = opts.scoreThreshold ? opts.scoreThreshold : 20; // 20 is the default
}

Client.prototype.post = function (opts, cb) {
    return new Promise((resolve, reject) => {

        if (!opts.question) throw new Error('question is required');
        cb = cb || (() => { });

        var self = this;

        var url = 'https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/' + this.knowledgeBaseId + '/generateAnswer';

        var options = {
            url: url,
            json: true,
            body: opts,
            headers: {
                "Ocp-Apim-Subscription-Key": this.subscriptionKey,
                "Content-Type": "application/json"
            }
        };

        return request.post(options, function (err, response, result) {
            if (err) {
                reject(err);
                return cb(err);
            }

            if (response.statusCode !== 200) {
                var error = new Error('Error invoking web request, statusCode: ' +
                    response.statusCode + ' statusMessage: ' +
                    response.statusMessage + ' URL: ' + options.url);

                reject(error);
                return cb(error)
            }

            resolve(result);

            var botreply;
            var answerobj = result.answers[0];

            if (answerobj.score >= self.scoreThreshold) {
                // Answer confidence score is acceptable - use QnA maker's response
                var botreplylist = smallTalkReplies[answerobj.answer];
                botreply = botreplylist[Math.floor(Math.random() * botreplylist.length)];
            }

            return cb(null, botreply);
        });
    });
}

module.exports = Client;
