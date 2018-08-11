const RespondTypes = require('./requestManager/respondType.js');

const respondFile = require('./respondFiles/respondFile.js');
const express = require('express');
const uiServer = require('./userInterface/uiServer.js');
const proxy = require('http-proxy-middleware');
const reqManager = require('./requestManager/reqManager.js');

class Bridgends {

    constructor() {

    }

    respondClient (res, data) {
        if (!res.headersSent) {
            res.writeHead(data.statusCode, data.headers);
            res.end(data.body);
        }
    }

    _cacheMiddleWare () {
        const removeProxy = (req) => {
            req.url = req.url.replace(this.config.proxyPath, '');
        }
        return proxy({
            target: this.config.targets[0],
            pathRewrite: {[this.config.proxyPath]: ''},
            router: (req) => {
                // it will re-target option.target for specific requests
                removeProxy(req);
                reqManager.addNewRequestIfItsNotExist(req); // list will update if it was a new request
                const list = reqManager.getRequestAndParents(req.url, req.method);
                reqManager.markRequestsPulsed(req, list);
                return reqManager.getTarget(list);
            },
            onError: (err) => {

            },
            onProxyReq: (proxyReq, req, res) => {
                removeProxy(req);
                const requested = reqManager.getExactRequest(req.url,req.method);
                uiServer.broadCast(requested.serialize());

                const respondWay = requested.getRespondWay();
                if (respondWay.type !== RespondTypes.API) { // Its Mock or Cache
                    requested.getRespond().then(data => {
                        this.respondClient(res, data);
                    });
                }

                requested.onTimeout = () => {
                    reqManager.respondAlternatives(requested.req.url).then(data => {
                        this.respondClient(res, data);
                    }, (err) => {
                        this.respondClient(res, {body:{err}});
                    });
                }
            },
            onProxyRes: (proxyRes, req, res) => {
                removeProxy(req);
                const requested = reqManager.getExactRequest(req.url, req.method);
                let body = '';
                proxyRes.on('data', (data) => {
                    data = data.toString('utf-8');
                    body += data;
                });
                proxyRes.on('end', (data) => {
                    const envelope = {
                        body: body,
                        reqTime: requested.usedDates[0],
                        statusCode: proxyRes.statusCode,
                        headers: proxyRes.headers,
                        resTime: Date.now()
                    };
                    if (requested.isValidResponse(envelope)) {
                        this.respondClient(res, envelope);
                    } else {
                        reqManager.respondAlternatives(req.url, req.method).then((data) => {
                            this.respondClient(res, data);
                        }, (err) => {
                            console.log('error in finding alternative way', err);
                            this.respondClient(res, envelope);
                        });
                    }
                    uiServer.broadCast(requested.serialize());
                });
            }
        });
    }

    start (config) {
        this.config = config;
        const app = express();
        respondFile.start({dir: config.savePath, instanceName: config.name});
        reqManager.start(config.targets, config.requestTimeout);
        app.use(config.proxyPath, (req, res, next)=> {
            // req.url = req.url.split(config.proxyPath)[1];
            next();
        }, this._cacheMiddleWare());
        app.use(config.uiPath, uiServer.uiMiddleware(app));
        const httpServer = app.listen(config.port, '0.0.0.0', () => {
            console.log(`open http://localhost:${config.port + config.uiPath}!`);
        });
        uiServer.startWebSocket(httpServer, config.socketPath);
    }
}

module.exports = new Bridgends();