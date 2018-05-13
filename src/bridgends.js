const RespondTypes = require('./requestManager/respondType.js');

const cache = require('./cacheResponds/cache.js');
const mock = require('./mock/mock.js');
const express = require('express');
const uiServer = require('./userInterface/uiServer.js');
const proxy = require('http-proxy-middleware');

const reqManager = require('./requestManager/reqManager.js');

class Bridgends {

    constructor() {

    }
    _cacheMiddleWare () {
        return proxy({
            target: this.config.targets[0],
            router: (req) => {
                const requested = reqManager.accessed(req);
                return requested.getSelectedTarget();
            },
            onError: (err) => {

            },
            onProxyReq: (proxyReq, req, res) => {
                const requested = reqManager._getMatchRequest(req.url);
                uiServer.broadCast(requested.getState());
                const respondBack = (data) => {
                    if (!res.headersSent) {
                        res.writeHead(data.statusCode, data.headers);
                        res.end(data.body);
                    }
                };
                requested.getRespondWay()
                    .then(respondWay => {
                        switch (respondWay.type) {
                            case RespondTypes.MOCK: mock.respond(respondWay.mockID).then(respondBack); break;
                            case RespondTypes.CACHE: cache.respond(respondWay.cacheID).then(respondBack); break;
                            // case RespondTypes.API: return this.apiPromise;
                        }
                    })
            },
            onProxyRes: (proxyRes, req, res) => {
                const requested = reqManager._getMatchRequest(req.url);

                // https://github.com/chimurai/http-proxy-middleware/issues/97#issuecomment-268180448
                let body = '';
                proxyRes.on('data', (data) => {
                    data = data.toString('utf-8');
                    body += data;
                });
                proxyRes.on('end', (data) => {
                    const envelope = {
                        body: body,
                        reqTime: requested.lastUsed,
                        statusCode: proxyRes.statusCode,
                        headers: proxyRes.headers,
                        resTime: Date.now()
                    };

                    if (envelope && requested.checkAndSerializeDataToCache(envelope)) {
                        cache.saveRequest(envelope);
                    }
                    uiServer.broadCast(requested.getState());
                });
            }
        });
    }

    start (config) {
        this.config = config;
        const app = express();

        mock.start({ dir: this.config.saveDir});
        cache.start({ dir: this.config.saveDir});
        reqManager.start({ dir: this.config.saveDir});
        app.use(this.config.apiPath, this._cacheMiddleWare());
        app.use(this.config.uiPath, uiServer.uiMiddleware(app));
        const httpServer = app.listen(this.config.port, () => {console.log(`open http://localhost:${this.config.port + this.config.uiPath}!`);});
        uiServer.startWebSocket(httpServer);

    }
}

module.exports = new Bridgends();