const express = require('express');
const path = require('path');
const router = express.Router();
const reqManager = require('../requestManager/reqManager.js');
const io = require('socket.io');

class uiServer{
    constructor() {
    }

    startWebSocket (httpServer, socketPath) {
        this.wss = io.listen(httpServer, {path: socketPath});
        const getTheRequest = (req) => {
            const r = reqManager.getExactRequest(req.url, req.method);
            if (r) {
                return Promise.resolve(r);
            } else {
                console.log(req.url, 'not exist');
                return Promise.reject('error');
            }
        }
        this.wss
            .on('connection', (ws) => {
                const ip = ws.handshake.headers.host;
                console.log("user " + ip + " connected");
                ws.emit('list', reqManager.serialize());
                ws.on('testApi', ({req}) => {
                    reqManager.testAPI(req.url, req.method).then((res) => {
                        ws.emit('update', res);
                    });
                });
                ws.on('clearCache', ({req}) => {
                    getTheRequest(req).then(pReq => {
                        pReq.clearCache(url).then((respond) => {
                            const reqData = pReq.serialize();
                            reqData.respond = respond;
                            this.broadCast(reqData);
                        });
                    });
                });

                ws.on('changeTarget', ({req, target}) => {
                    getTheRequest(req).then(pReq => {
                        pReq.setTarget(target);
                        const reqData = pReq.serialize();
                        // TODO: get new target respond and fill the respond
                        // reqData.respond = respond;
                        this.broadCast(reqData);
                    });
                });

                ws.on('changeRespondWay', ({req, respondWay}) => {
                    getTheRequest(req).then(pReq => {
                        pReq.setRespondWay(respondWay).then((respond) => {
                            const reqData = pReq.serialize();
                            reqData.respond = respond;
                            this.broadCast(reqData);
                        });
                    });
                });

                ws.on('addNewMock', ({req, newMock}) => {
                    getTheRequest(req).then(pReq => {
                        pReq.addMock(newMock);
                        this.broadCast(pReq.serialize());
                    });
                });
                ws.on('removeMock', ({req, mock}) => {
                    getTheRequest(req).then(pReq => {
                        pReq.removeMock(mock);
                        this.broadCast(pReq.serialize());
                    });
                });
                ws.on('editMock', ({req, newMock}) => {
                    getTheRequest(req).then(pReq => {
                        pReq.editMock(newMock);
                        this.broadCast(pReq.serialize());
                    });
                });

                ws.on('getRespond', ({req}) => {
                    getTheRequest(req).then(pReq => {
                        pReq.getRespond().then((respond) => {
                            const reqData = pReq.serialize();
                            reqData.respond = respond;
                            ws.emit('update', JSON.stringify(reqData));
                        });
                    });
                });
            });
    }

    broadCast(jsonData) {
        this.wss.sockets.emit('update', JSON.stringify(jsonData));
    }

    uiMiddleware(app) {
        const uiFilesPath = path.join(__dirname, './public');
        app.use(express.static(uiFilesPath));
        // define the home page route
        router.get('/', function (req, res) {
            res.sendFile(uiFilesPath + '/index.html');
        });

        return router
    }
}

module.exports = new uiServer();
