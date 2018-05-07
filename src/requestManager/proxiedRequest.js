const getRawBody = require('raw-body');
let cacheIDCounter = 111;

class ProxiedRequest {
    constructor (req) {
        this.usedDates = [];
        if (req) { Object.assign(this, req); }
    }

    serialize () {
        return {
            req: this.req,
            status: this.status,
            usedDates: this.usedDates,
            respondedBy : this.respondedBy,
            cacheID : this.cacheID,
            mockID : this.mockID
        }
    }

    getState () {
        const s = this.serialize();
        s.respond = this.respond;
        s.realRespond = this.realRespond;
        return s;
    }
    respondWith (respond) {
        this.respond = respond;
    }

    getRespondSetting() {
        return new Promise((resolve, reject) => {
            if (this.fake) {
                this.respondedBy = 'fake';
                return resolve({responder:'fake', fakeID: this.fakeID});
            } else if (this.cache) {
                this.respondedBy = 'cache';
                return resolve({responder:'cache', cacheID: this.cacheID});
            } else {
                this.respondedBy = 'api';
                return resolve({responder:'api'});
            }
        });
    }

    requested (req) {
        this.req = {
            url: req.url,
            baseUrl: req.url.split('?')[0],
            params: req.url.split('?')[1]
        };

        if (req.method !== 'GET') {
            getRawBody(req).then((bodyBuffer) => {
                this.req.reqBody = bodyBuffer.toString();
            }, () => {
                console.log('Unhandled error in getRawBody', arguments);
            });
        }
        this.previousState = this.status;
        this.status = 0;

        this.usedDates.unshift(Date.now());
        if (this.usedDates.length > 10) this.usedDates.pop();
        this.lastUsed = this.usedDates[0];
    }

    checkAndSerializeDataToCache (apiResponded) {
        this.realRespond = apiResponded;
        return new Promise((resolve, reject) => {
            let saveInCache = true;
            const isRespondError = apiResponded.statusCode !== 200;
            const isRespondHasData = apiResponded.body;
            this.status = apiResponded.statusCode;
            if (this.checkIsNotError) saveInCache = saveInCache && isRespondError;
            if (this.hasData) saveInCache = saveInCache && isRespondHasData;
            if (saveInCache) {
                const cacheID = this.cacheID || ++cacheIDCounter;
                this.cacheID =  cacheID;
                resolve({cacheID, ...apiResponded});
            } else reject('decided to not cache it');
        });
    }
}

module.exports = ProxiedRequest;