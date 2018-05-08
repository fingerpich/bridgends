class Mock {
    constructor () {

    }
    start (config) {
        config.dir
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
module.exports = new Mock();