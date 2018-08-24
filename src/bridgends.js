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
        const removeProxy = (url) => {
            return url.replace(this.config.proxyPath, '');
        };
        return proxy({
            target: this.config.targets[0],
            pathRewrite: {[this.config.proxyPath]: ''},
            router: (req) => {
                // it will re-target option.target for specific requests
                const url = removeProxy(req.url);
                const newContainerAdded = reqManager.addNewRequestIfItsNotExist(url, req.method); // list will update if it was a new request
                if (newContainerAdded) uiServer.broadCastList();
                const list = reqManager.getRequestAndParents(url, req.method);
                reqManager.markRequestsPulsed(url, req, list);
                const target = reqManager.getTarget(list);
                return target;
            },
            onError: (err) => {

            },
            onProxyReq: (proxyReq, req, res) => {
                const url = removeProxy(req.url);

                const list = reqManager.getRequestAndParents(url, req.method);
                const headers = reqManager.getHeaders(list);
                headers.forEach(h => {
                    for (const [key, value] of Object.entries(h)) {
                        if (!proxyReq._headerSent) {
                            proxyReq.setHeader(key, value);
                        }
                    }
                });

                const requested = reqManager.getExactRequest(url, req.method);
                uiServer.broadCast(requested.serialize());

                const {respondWay, requester} = reqManager.getRespondWay(list);
                if (respondWay.type !== RespondTypes.API) { // Its Mock or Cache
                    requester.getRespond().then(data => {
                        this.respondClient(res, data);
                    });
                }

                requested.onTimeout = () => {
                    reqManager.respondAlternatives(requested, respondWay).then(data => {
                        this.respondClient(res, data);
                    }, (err) => {
                        this.respondClient(res, {body:{err}});
                    });
                }
            },
            onProxyRes: (proxyRes, req, res) => {
                const url = removeProxy(req.url);
                const requested = reqManager.getExactRequest(url, req.method);

                const _writeHead = res.writeHead;
                const _end = res.end;
                let _writeHeadArgs;
                let body = '';

                proxyRes.on('data', (data) => {
                    data = data.toString('utf-8');
                    body += data;
                });

                // Defer writeHead
                res.writeHead = ( ...writeHeadArgs ) => {
                    _writeHeadArgs = writeHeadArgs;
                };
                // Defer all writes
                res.write = () => {};

                const respondClientByForce = (data) => {
                    _writeHead.call(res, data.statusCode, data.headers );
                    _end.call(res, data.body );
                };
                res.end = () => {
                    const envelope = {
                        body: body,
                        reqTime: requested.usedDates[0],
                        statusCode: proxyRes.statusCode,
                        headers: proxyRes.headers,
                        resTime: Date.now()
                    };

                    if (requested.isValidResponse(envelope)) {
                        respondClientByForce(envelope);
                    } else {
                        reqManager.respondAlternatives(requested, requested.respondWay).then((data) => {
                            respondClientByForce(data);
                        }, (err) => {
                            console.log('error in finding alternative way', err);
                            // this.respondClient(res, envelope);
                            respondClientByForce(envelope);
                        });
                    }
                    uiServer.broadCast(requested.serialize());
                }
                proxyRes.on('end', (data) => {

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