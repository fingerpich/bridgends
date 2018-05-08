const getRawBody = require('raw-body');
let cacheIDCounter = 111;
const config = require('../../config.js');
const RespondTypes = require('./respondType.js');

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
            respondOptions : this.respondOptions,
            respondWay : this.respondWay,
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

    getRespondWay() {
        return Promise.resolve(this.respondWay);
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

        if (!this.respondOptions) {
            this.respondOptions = config.targets.map(target => [{type: RespondTypes.API, target: target}]);
            this.selectedTarget = config.targets[0];
        }
        if (!this.respondWay) { this.respondWay = this.respondOptions[0]; }

        this.previousState = this.status;
        this.status = 0;

        this.usedDates.unshift(Date.now());
        if (this.usedDates.length > 10) this.usedDates.pop();
        this.lastUsed = this.usedDates[0];
    }

    addMock() {
        this.respondOptions.push({type:RespondTypes.MOCK, MockID});
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
            this.targets = config.targets;
            if (saveInCache) {
                if (!this.cacheID) {
                    this.cacheID = ++cacheIDCounter;
                    // const caches = this.respondOptions.filter(option => option.type === RespondTypes.CACHE);
                    const cacheRespond = {type: RespondTypes.CACHE, cacheID: this.cacheID};
                    this.respondOptions.push(cacheRespond);
                    this.respondWay = cacheRespond;
                }
                resolve({cacheID: this.cacheID, ...apiResponded});
            } else reject('decided to not cache it');
        });
    }
}

module.exports = ProxiedRequest;