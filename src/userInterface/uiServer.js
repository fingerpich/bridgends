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
                    const pReq = reqManager.getExactRequest(req.url, req.method);
                    pReq.clearCache(url).then((respond) => {
                        const reqData = pReq.serialize();
                        reqData.respond = respond;
                        this.broadCast(reqData);
                    });
                });
                ws.on('changeRespondWay', ({req, respondWay}) => {
                    const pReq = reqManager.getExactRequest(req.url, req.method);
                    pReq.setRespondWay(respondWay).then((respond) => {
                        const reqData = pReq.serialize();
                        reqData.respond = respond;
                        this.broadCast(reqData);
                    });
                });

                ws.on('addNewMock', ({req, newMock}) => {
                    const pReq = reqManager.getExactRequest(req.url, req.method);
                    pReq.addMock(newMock);
                    this.broadCast(pReq.serialize());
                });
                ws.on('removeMock', ({req, mock}) => {
                    const pReq = reqManager.getExactRequest(req.url, req.method);
                    pReq.removeMock(mock);
                    this.broadCast(pReq.serialize());
                });
                ws.on('editMock', ({req, newMock}) => {
                    const pReq = reqManager.getExactRequest(req.url, req.method);
                    pReq.editMock(newMock);
                    this.broadCast(pReq.serialize());
                });

                ws.on('getRespond', ({req}) => {
                    const pReq = reqManager.getExactRequest(req.url, req.method);
                    pReq.getRespond().then((respond) => {
                        const reqData = pReq.serialize();
                        reqData.respond = respond;
                        ws.emit('update', JSON.stringify(reqData));
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
