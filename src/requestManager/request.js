let cacheIDCounter = 111;
const respondFile = require('../respondFiles/respondFile.js');
const RespondTypes = require('./respondType.js');

class Request {
    constructor(req) {
        this.usedDates = [];
        this.respondOptions = [];
        if (req) { Object.assign(this, req); }
    }

    serialize () {
        return {
            req: this.req,
            isContainer: this.isContainer,
            timeout: this.timeout,
            target: this.target,
            status: this.status,
            usedDates: this.usedDates,
            respondOptions : this.respondOptions,
            respondWay : this.respondWay,
            reqFileName : this.reqFileName,
            headers : this.headers,
        }
    }

    _getMocks () {
        return this.respondOptions.filter(ro => ro.type === RespondTypes.MOCK);
    }
    _getMock (name) {
        return this._getMocks().find(ro => ro.name === name);
    }
    _getActivatedMock() {
        return this._getMocks().find(ro => ro.lastActivated);
    }

    matchExactly (url, method) {
        return (this.req.url === url && method === this.req.method);
    }

    setTarget(target) {
        // when the target is Inherit or something which is not point to a real target it will set it null
        if (/(\.|\/|\:)/g.test(target)) {
            this.target = target;
        } else {
            this.target = ''
        }
    }
    getTarget () {
        return this.target;
    }

    setHeaders(headers) {
        this.headers = headers;
    }
    getHeaders () {
        return this.headers;
    }

    addMockToOptions (mockData) {
        this._getMocks().forEach(m => m.lastActivated = false);
        const mockOption = {name: mockData.name, type: RespondTypes.MOCK, file: this._getFileName(), lastActivated: true};
        this.respondOptions.push(mockOption);
        delete mockData.name;
        respondFile.save(mockData, mockOption.file);
        return mockOption;
    }
    editMockInOptions (editedMockData) {
        const mockOption = this.respondOptions.filter((ro) => ro.file === editedMockData.file)[0];
        Object.assign(mockOption, editedMockData);
        delete editedMockData.name;
        respondFile.save(editedMockData, mockOption.file);
        return mockOption
    }
    removeMockFromOptions (mockData) {
        this.respondOptions = this.respondOptions.filter((ro) => !(ro.file === mockData.file));
        const mocks = this.respondOptions.filter(ro => ro.type === RespondTypes.MOCK);
        if (mocks.length > 0) {
            mocks[0].lastActivated = true;
            return mocks[0];
        }
    }

    _getFileName() {
        return ++cacheIDCounter + '' + Date.now();
    }
}

module.exports = Request;
