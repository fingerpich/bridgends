const fs = require('fs');
const filendir = require('filendir');
const getRawBody = require('getRawBody');

class RequestManager {
    constructor () {
        this.list = [];
    }

    start ({dir}) {
        this.savePath = dir + 'requests.json';
        let data;
        try {
            data = fs.readFileSync(this.savePath, 'utf-8');
        } catch (e) {

        }
        if (data) {
            const parsed = JSON.parse(data);
            parsed.map((rq) => {
                return new request(rq);
            })
        }
    }

    _updateReqFile () {
        filendir.writeFile(this.savePath, JSON.stringify(this.list), function (err) {
            if (err) {
                console.log('File could not be saved in ' + this.savePath);
                throw err;
            }
        }.bind(this));
    }

    accessed (req) {
        const matches = this.list.filter(r => r.req.url === req.url);
        let match = matches[0];
        if (!matches.length) {
            match = new request(req);
            this.list.push(match);
        }
        match.accessed();
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

class request {
    constructor (req) {
        this.usedDates = [];
        if (req.method !== 'GET') {
            getRawBody(req).then(function (bodyBuffer) {
                this.reqBody = bodyBuffer.toString()
            }).catch(function () {
                console.log('Unhandled error in getRawBody', arguments)
            })
        }
        this.req = {url: req.url};
    }

    accessed () {
        this.usedDates.push(Date.now());
    }
}

module.exports = new RequestManager();