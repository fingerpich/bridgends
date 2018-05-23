const proxiedRequest = require('./proxiedRequest.js');
const fileName = 'requests';
const respondFile = require('../respondFiles/respondFile.js');

class RequestManager {
    constructor () {
        this.list = [];
    }

    serialize () {
        return this.list.map(r => r.serialize());
    }

    testAPI (url) {
        const req = this._getMatchRequest(url);
        return this.getApiRespond(req);
    }

    start (targets) {
        this.targets = targets;
        respondFile.load(fileName).then((parsed) => {
            this.list = parsed.map((rq) => {
                return new proxiedRequest(rq, this.targets);
            });
        });
        // Update requests file in every 10 minute
        setInterval(() => {
            respondFile.save(this.serialize(), fileName);
        },1000 * 10);
    }

    _getMatchRequest (url) {
        const matches = this.list.filter(r => r.matchUrl(url));
        let match;
        if (!matches.length) {
            match = new proxiedRequest(null, this.targets);
            this.list.push(match);
        } else {
            match = matches[0];
        }
        return match;
    }

    accessed (req) {
        const match = this._getMatchRequest(req.url);
        match.requested(req);
        return match;
    }
}

module.exports = new RequestManager();