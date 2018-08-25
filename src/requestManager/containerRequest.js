const RespondTypes = require('./respondType.js');
const respondFile = require('../respondFiles/respondFile.js');
const Request = require('./request.js');

class ContainerRequest extends Request {
    constructor (req) {
        super(req);
        this.isContainer = true;
        if (!this.respondWay) {
            this.respondWay = RespondTypes.AS_THEY_SETTLED;
        }
    }

    matchUrl (url, method) {
        return url.includes(this.req.url);
    }

    getRespond (type, name) {
        const splitted = this.respondWay.split(RespondTypes.Delimiter);
        if (splitted[0] === RespondTypes.MOCK_ALL) {
            const matched = this._getMock(splitted[1]);
            if (matched) {
                return respondFile.load(matched.file);
            } else {
                return Promise.reject(type + ' has not defined');
            }
        } else {
            return Promise.reject('container dont have data');
        }
    }

    setRespondWay (respondWay) {
        this.respondWay = respondWay;
    }

    getRespondWay() {
        return this.respondWay;
    }

    // this req is going to proxied to the target
    requested (req) {
        this.lastChildReq = req.url;
        this.usedDates.unshift(Date.now());
        if (this.usedDates.length > 10) this.usedDates.pop();
    }

    addMock (mockData) {
        const newMock = this.addMockToOptions(mockData);
        this.setRespondWay(RespondTypes.MOCK_ALL + RespondTypes.Delimiter + newMock.name);
    }
    editMock (editedMockData) {
        const editedMock = this.editMockInOptions(mockData);
        this.setRespondWay(RespondTypes.MOCK_ALL + RespondTypes.Delimiter + editedMock.name);
    }
    removeMock (mockData) {
        const anotherMock = this.editMockInOptions(mockData);
        if (anotherMock) {
            this.setRespondWay(RespondTypes.MOCK_ALL + RespondTypes.Delimiter + anotherMock.name);
        } else {
            this.setRespondWay(RespondTypes.AS_THEY_SETTLED);
        }
    }

    clearCache () {
        // TODO: it will clear all sub requests cache
    }
}

module.exports = ContainerRequest;