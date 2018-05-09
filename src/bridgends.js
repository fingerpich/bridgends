const RespondTypes = require('./requestManager/respondType.js');
const getRequestResult = require('./helpers/getRestResult.js');
const urlFixer = require('./helpers/urlFixer.js');
const cache = require('./cacheResponds/cache.js');
const mock = require('./mock/mock.js');
const express = require('express');
const uiServer = require('./userInterface/uiServer.js');
const request = require('request');

const reqManager = require('./requestManager/reqManager.js');

class Bridgends {

    _cacheMiddleWare (req, res, next) {
        const requested = reqManager.accessed(req);
        uiServer.broadCast(requested.serialize());

        let apiURL = urlFixer.replaceRemoteAddress(req.url, requested.selectedTarget);
        apiURL = this.config.replace ? this.config.replace(apiURL) : apiURL || apiURL;
        this.apiPromise = getRequestResult(req.pipe(request(apiURL)))
            .then((parsedResp) => {
                requested.checkAndSerializeDataToCache(parsedResp).then((data) => {
                    cache.saveRequest(data);
                });
                uiServer.broadCast(requested.serialize());
                return parsedResp;
            });

        requested.getRespondWay()
            .then(respondWay => {
                switch (respondWay.type) {
                    case RespondTypes.MOCK: return mock.respond(respondWay.mockID);
                    case RespondTypes.CACHE: return cache.respond(respondWay.cacheID);
                    case RespondTypes.API: return this.apiPromise;
                }
            })
            .then((data) => {
                requested.respondWith(data);
                uiServer.broadCast(requested.serialize());
                if (!res.headersSent) {
                    res.writeHead(data.statusCode, data.headers);
                    res.end(data.body);
                }
                next();
            }, (err) => {
                console.error(err);
            });
    }

    start (config) {
        this.config = config;
        const app = express();

        mock.start({ dir: this.config.saveDir});
        cache.start({ dir: this.config.saveDir});
        reqManager.start({ dir: this.config.saveDir});
        app.use(this.config.apiPath, this._cacheMiddleWare.bind(this));
        app.use(this.config.uiPath, uiServer.uiMiddleware(app));
        const httpServer = app.listen(this.config.port, () => {console.log(`open http://localhost:${this.config.port + this.config.uiPath}!`);});
        uiServer.startWebSocket(httpServer);

    }
}

module.exports = new Bridgends();