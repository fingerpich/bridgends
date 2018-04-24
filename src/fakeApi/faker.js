class FakeApi {
    constructor () {

    }
    start (config) {
        config.saveDir
    }

    addFakeResponse (req, res) {

    }
    editFakeResponse(req) {

    }
    removeFakeResponse(req) {

    }

    has(req) {
        return false;
    }

    respond (req) {
        return req;
    }
}
module.exports = new FakeApi();