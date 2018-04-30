const getRawBody = require('raw-body');
let cacheIDCounter = 111;

class ProxiedRequest {
    constructor (req) {
        this.usedDates = [];
        if (req) { Object.assign(this, req); }
    }


    getRespondSetting() {
        return new Promise((resolve, reject) => {
            if (this.fake) {
                return resolve({responder:'fake', fakeID: this.fakeID});
            } else if (this.cache) {
                return resolve({responder:'cache', cacheID: this.cacheID});
            } else {
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

    getCacheData (apiResponded) {
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
            }
            else reject('decided to not cache it');
        });
    }
}

module.exports = ProxiedRequest;