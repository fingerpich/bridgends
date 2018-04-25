const fs = require('fs');
const filendir = require('filendir');
const getRawBody = require('raw-body');

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
        let match;
        if (!matches.length) {
            match = new request();
            this.list.push(match);
        } else {
            match = matches[0];
        }
        match.accessed(req);
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
        if (req) { Object.assign(this, req); }
    }


    getRespondSetting() {
        return new Promise((resolve, reject) => {
            if (this.fake) {
                return resolve({responder:'fake', fakeID: this.fake});
            } else if (this.cache) {
                return resolve({responder:'cache', cacheID: this.cache});
            } else {
                return resolve({responder:'api'});
            }
        });
    }

    accessed (req) {
        this.req = {url: req.url};
        if (req.method !== 'GET') {
            getRawBody(req).then((bodyBuffer) => {
                this.req.reqBody = bodyBuffer.toString();
            }, () => {
                console.log('Unhandled error in getRawBody', arguments)
            })
        }

        this.usedDates.unshift(Date.now());
        if (this.usedDates.length > 10) this.usedDates.pop();
        this.lastUsed = this.usedDates[0];
    }

    getCacheData (apiResponded) {
        let saveInCache = true;
        const isRespondError = apiResponded.statusCode !== 200;
        const isRespondHasData = apiResponded.body;
        if (this.checkIsNotError) saveInCache = saveInCache && isRespondError;
        if (this.hasData) saveInCache = saveInCache && isRespondHasData;
        if (saveInCache) return Promise.resolve({cacheID: 1, ...apiResponded});
        else Promise.reject('decided to not cache it');
    }
}

module.exports = new RequestManager();