const getRawBody = require('raw-body');
let cacheIDCounter = 111;
const config = require('../../config.js');
const RespondTypes = require('./respondType.js');
const respondFile = require('../respondFiles/respondFile.js');

class ProxiedRequest {
    constructor (req) {
        this.usedDates = [];
        this.reqFileName = 0;

        if (req) { Object.assign(this, req); }
    }

    matchUrl (url) {
        return this.req.url === url
    }

    serialize () {
        return {
            req: this.req,
            status: this.status,
            usedDates: this.usedDates,
            respondOptions : this.respondOptions,
            respondWay : this.respondWay,
        }
    }

    getRespond () {
        return respondFile.load(this.respondWay.file);
    }

    setRespondWay (respondWay) {
        this.respondWay = respondWay;
        return respondFile
            .load(this.respondWay.file)
    }
    getRespondWay() {
        return this.respondWay;
    }

    getSelectedTarget () {
        return this.respondOptions.filter(ro => ro.type === RespondTypes.API && ro.lastActivated)[0].target;
    }

    saveRequestData (req) {
        if (!this.reqFileName){
            this.reqFileName = this._getFileName();
        }
        const reqData = {
            headers: req.headers
        };
        if (req.method !== 'GET') {
            getRawBody(req).then((bodyBuffer) => {
                reqData.reqBody = bodyBuffer.toString();
                respondFile.save(reqData, this.reqFileName);
            }, () => {
                console.log('Unhandled error in getRawBody', arguments);
            });
        } else {
            respondFile.save(reqData, this.reqFileName);
        }
    }

    requested (req) {
        this.req = {
            url: req.url,
            method: req.method,
            baseUrl: req.url.split('?')[0],
            params: req.url.split('?')[1]
        };
        this.saveRequestData(req);

        if (!this.respondOptions) {
            this.respondOptions = config.targets.map((target, i) => {return {type: RespondTypes.API, target, file: this._getFileName()}});
        }
        if (!this.respondWay) {
            this.respondWay = this.respondOptions[0];
            this.respondWay.lastActivated = true;
        }

        this.previousState = this.status;
        this.status = 0;

        this.usedDates.unshift(Date.now());
        if (this.usedDates.length > 10) this.usedDates.pop();
        this.lastUsed = this.usedDates[0];
    }

    addMock (mockData) {
        const mockOption = {name: mockData.name, type: RespondTypes.MOCK, file: this._getFileName(), lastActivated: true};
        this.respondOptions.push(mockOption);
        delete mockData.name;
        respondFile.save(mockData, mockOption.file);
    }
    editMock (mockData) {
        const mock = this.respondOptions.filter((ro) => !(ro.type === RespondTypes.MOCK && ro.name === mockName));
        Object.assign(mock[0], mockData);
    }
    removeMock (mockName) {
        this.respondOptions = this.respondOptions.filter((ro) => !(ro.type === RespondTypes.MOCK && ro.name === mockName));
    }

    _getFileName() {
        return ++cacheIDCounter + '' + Date.now();
    }

    setResponse (apiResponded) {
        const isRespondError = apiResponded.statusCode !== 200;
        const isRespondHasData = apiResponded.body;
        this.status = apiResponded.statusCode;
        this.targets = config.targets;

        respondFile.save(apiResponded, this.respondOptions.filter(ro => ro.target === this.getSelectedTarget())[0].file);
        if (!isRespondError && isRespondHasData) {
            if (!this.respondOptions.filter(ro => ro.type === RespondTypes.CACHE).length) {
                const cacheRespond = {type: RespondTypes.CACHE, file: this._getFileName(), lastActivated: true};
                this.respondOptions.push(cacheRespond);
                this.respondWay = cacheRespond;
                respondFile.save(apiResponded, cacheRespond.file);
            }
        }
    }
}

module.exports = ProxiedRequest;