const RespondTypes = require('./requestManager/respondType.js');

const respondFile = require('./respondFiles/respondFile.js');
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
                uiServer.broadCast(requested.serialize());
                const respondBack = (data) => {
                    if (!res.headersSent) {
                        res.writeHead(data.statusCode, data.headers);
                        res.end(data.body);
                    }
                };
                const respondWay = requested.getRespondWay();
                switch (respondWay.type) {
                    case RespondTypes.MOCK: respondFile.load(respondWay.file).then(respondBack); break;
                    case RespondTypes.CACHE: respondFile.load(respondWay.file).then(respondBack); break;
                    // case RespondTypes.API: return this.apiPromise;
                }
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

                    requested.setResponse(envelope);
                    uiServer.broadCast(requested.serialize());
                });
            }
        });
    }

    start (config) {
        this.config = config;
        const app = express();
        respondFile.start({dir: this.config.savePath});
        reqManager.start(config.targets);
        app.use(this.config.apiPath, this._cacheMiddleWare());
        app.use(this.config.uiPath, uiServer.uiMiddleware(app));
        const httpServer = app.listen(this.config.port, () => {
            console.log(`open http://localhost:${this.config.port + this.config.uiPath}!`);
        });
        uiServer.startWebSocket(httpServer, config.socketPath);
    }
}

module.exports = new Bridgends();