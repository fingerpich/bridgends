const getRawBody = require('raw-body');
let cacheIDCounter = 111;
const RespondTypes = require('./respondType.js');
const respondFile = require('../respondFiles/respondFile.js');

class ProxiedRequest {
    constructor (req, targets) {
        this.usedDates = [];
        this.reqFileName = 0;
        if (req) { Object.assign(this, req); }
        this.respondOptions = targets.map((target, i) => {
            return {type: RespondTypes.API, target, file: this._getFileName()}
        });
        if (!this.respondWay) {
            this.respondWay = this.respondOptions[0];
            this.respondWay.lastActivated = true;
        }
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
            reqFileName : this.reqFileName,
        }
    }

    getRespond () {
        return respondFile.load(this.respondWay.file);
    }

    setRespondWay (respondWay) {
        if (this.respondWay && this.respondWay.type === respondWay.type) {
            this.respondOptions
                .filter(ro => ro.type === respondWay.type)
                .forEach(ro => ro.lastActivated = ro.file === respondWay.file);
        }
        this.respondWay = this.respondOptions.filter(ro => ro.file === respondWay.file)[0];
        return respondFile.load(this.respondWay.file);
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

        this.previousState = this.status;
        this.status = 0;

        this.usedDates.unshift(Date.now());
        if (this.usedDates.length > 10) this.usedDates.pop();
        this.lastUsed = this.usedDates[0];
    }

    addMock (mockData) {
        this.respondOptions.filter(ro => ro.type === RespondTypes.MOCK).forEach(m => m.lastActivated = false)
        const mockOption = {name: mockData.name, type: RespondTypes.MOCK, file: this._getFileName(), lastActivated: true};
        this.respondOptions.push(mockOption);
        delete mockData.name;
        respondFile.save(mockData, mockOption.file);
    }
    editMock (editedMockData) {
        const mockOption = this.respondOptions.filter((ro) => ro.file === editedMockData.file)[0];
        Object.assign(mockOption, editedMockData);
        delete editedMockData.name;
        respondFile.save(editedMockData, mockOption.file);
    }
    removeMock (mockData) {
        this.respondOptions = this.respondOptions.filter((ro) => !(ro.file === mockData.file));
        const mocks = this.respondOptions.filter(ro => ro.type === RespondTypes.MOCK);
        if (mocks.length > 0) {
            this.respondWay = mocks[0];
            this.respondWay.lastActivated = true;
        }
    }

    _getFileName() {
        return ++cacheIDCounter + '' + Date.now();
    }

    setResponse (apiResponded) {
        const isRespondError = apiResponded.statusCode !== 200;
        const isRespondHasData = apiResponded.body;
        this.status = apiResponded.statusCode;

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