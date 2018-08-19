const getRawBody = require('raw-body');
const RespondTypes = require('./respondType.js');
const respondFile = require('../respondFiles/respondFile.js');
const Request = require('./request.js');

class LeafRequest extends Request {
    constructor (req, defaultTimeout) {
        super(req);
        this.reqFileName = 0;
        this.isContainer = false
        if (!this.timeout) { this.timeout = defaultTimeout; }
        this.respondOptions = [{type: RespondTypes.API, file: this._getFileName(), lastActivated: true}];
        this.respondWay = this.respondOptions[0];
    }

    matchUrl (url, method) {
        return (this.req.url === url && method === this.req.method);
    }

    //TODO: set Timeout for a single leaf request or on a container

    getRespond (type, name) {
        if (this.respondWay.type === RespondTypes.API && type && type!==RespondTypes.API) {
            try {
                if (type === RespondTypes.CACHE) {
                    const cacheRw = this._getCache();
                    return respondFile.load(cacheRw.file);
                } else if (type === RespondTypes.MOCK) {
                    if (name) {
                        return respondFile.load(this._getMock(name).file);
                    } else {
                        return respondFile.load(this._getActivatedMock().file);
                    }
                }
            } catch (e) {
                return Promise.reject(type + ' has not defined');
            }
        } else {
            return respondFile.load(this.respondWay.file);
        }
    }
    hasCache () {
        return !!this._getCache();
    }
    _getCache () {
        return this.respondOptions.find(ro => ro.type === RespondTypes.CACHE);
    }
    getApiWay() {
        return this.respondOptions.find(ro => ro.type === RespondTypes.API);
    }

    setRespondWay (respondWay) {
        if (this.respondWay && this.respondWay.type === respondWay.type) {
            this.respondOptions
                .filter(ro => ro.type === respondWay.type)
                .forEach(ro => ro.lastActivated = ro.file === respondWay.file);
        }
        this.respondWay = this.respondOptions.filter(ro => ro.file === respondWay.file)[0];

        if (respondWay.type === RespondTypes.API && respondWay.alternativeWay) {
            this.setAlternativeWay(respondWay.alternativeWay);
        }
        return respondFile.load(this.respondWay.file);
    }

    setAlternativeWay (alternativeWay) {
        this.getApiWay().alternativeWay = alternativeWay;
    }

    getRespondWay() {
        return this.respondWay;
    }

    _saveRequestData (req) {
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

    // this req is going to proxied to the target
    // req.url is like /proxy/....  but url is like /...
    requested (url, req) {
        this.req = {
            url: url,
            method: req.method,
        };

        if (this.onTimeout) {
            this.timeoutRef = setTimeout(() => {
                this.onTimeout();
            }, this.timeout * 1000);
        }
        this._saveRequestData(req);

        this.previousState = this.status;
        this.status = 0;
        this.usedDates.unshift(Date.now());
        if (this.usedDates.length > 10) this.usedDates.pop();
    }


    addMock (mockData) {
        const newMock = this.addMockToOptions(mockData);
        this.setRespondWay(newMock);
    }
    editMock (editedMockData) {
        const editedMock = this.editMockInOptions(mockData);
        this.setRespondWay(editedMock);
    }
    removeMock (mockData) {
        const anotherMock = this.editMockInOptions(mockData);
        if (anotherMock) {
            this.setRespondWay(anotherMock);
        } else {
            this.setRespondWay(this.respondOptions.find(r => r.lastActivated));
        }
    }

    clearCache () {
        const index = this.respondOptions.findIndex(ro => ro.type === RespondTypes.CACHE);
        this.respondOptions.splice(index, 1);
        this.respondOptions
            .filter(ro => ro.type === RespondTypes.API && ro.alternativeWay.type === RespondTypes.CACHE)
            .forEach(ro => ro.alternativeWay = null);
        if (this.respondWay.type === RespondTypes.CACHE) {
            return this.setRespondWay(this.respondOptions[index - 1]);
        }
    }

    cacheResponse (apiResponded) {
        if (!this.respondOptions.filter(ro => ro.type === RespondTypes.CACHE).length) {
            const cacheRespond = {type: RespondTypes.CACHE, file: this._getFileName(), lastActivated: true};
            this.respondOptions.push(cacheRespond);
            this.respondWay = cacheRespond;
            respondFile.save(apiResponded, cacheRespond.file);

            const altway = this.respondWay.alternativeWay;
            if (!altway || (altway && altway.auto)) {
                this.setAlternativeWay({type: RespondTypes.CACHE, data: RespondTypes.CACHE});
            }
        }
    }

    isValidResponse (apiResponded) {
        clearTimeout(this.timeoutRef);
        const isRespondError = apiResponded.statusCode !== 200;
        const isRespondHasData = apiResponded.body;
        this.status = apiResponded.statusCode;

        respondFile.save(apiResponded, this.getApiWay().file);
        if (!isRespondError && isRespondHasData) {
            this.cacheResponse(apiResponded);
            return true;
        }
    }
}

module.exports = LeafRequest;