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

    start () {
        respondFile.load(fileName).then((parsed) => {
            this.list = parsed.map((rq) => {
                return new proxiedRequest(rq);
            });
        });
    }

    _updateReqFile () {
        respondFile.save(this.serialize(), fileName);
    }

    _getMatchRequest (url) {
        const matches = this.list.filter(r => r.matchUrl(url));
        let match;
        if (!matches.length) {
            match = new proxiedRequest();
            this.list.push(match);
        } else {
            match = matches[0];
        }
        return match;
    }

    accessed (req) {
        const match = this._getMatchRequest(req.url);
        match.requested(req);
        this._updateReqFile();
        return match;
    }
}

module.exports = new RequestManager();