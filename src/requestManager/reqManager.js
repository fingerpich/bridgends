const fs = require('fs');
const filendir = require('filendir');
const proxiedRequest = require('./proxiedRequest.js');
const fileName = 'requests.json';

class RequestManager {
    constructor () {
        this.list = [];
    }

    getRequestsStates () {
        return this.list.map(r => r.getState());
    }

    start ({dir}) {
        this.savePath = dir + fileName;
        let data;
        try {
            data = fs.readFileSync(this.savePath, 'utf-8');
        } catch (e) {
            console.log('error in reading ' + fileName + ' file');
            console.log(e);
        }
        if (data) {
            const parsed = JSON.parse(data);
            this.list = parsed.map((rq) => {
                return new proxiedRequest(rq);
            });
        }
    }

    _updateReqFile () {
        filendir.writeFile(this.savePath, JSON.stringify(this.list.map(req => req.serialize())), function (err) {
            if (err) {
                console.log('File could not be saved in ' + this.savePath);
                throw err;
            }
        }.bind(this));
    }

    accessed (req) {
        const matches = this.list.filter(r => r.req.url === req.url);
        let match;
        if (!matches.length) {
            match = new proxiedRequest();
            this.list.push(match);
        } else {
            match = matches[0];
        }
        match.requested(req);
        this._updateReqFile();
        return match;
    }
    respondWith (req, type, data) {

    }
    hasRedirect (req) {

    }
    getRedirectExpr (req) {

    }
    getCachedName (req) {
        return req.url.slice(0, 100) + Date.now();
    }
    getCacheChecks (req) {

    }
}

module.exports = new RequestManager();