const express = require('express');
const path = require('path');
const router = express.Router();
const reqManager = require('../requestManager/reqManager.js');
const io = require('socket.io');
const config = require('../../config.js');

class uiServer{
    constructor() {
    }

    startWebSocket (httpServer) {
        this.wss = io.listen(httpServer, {path: config.socketPath});
        this.wss
            .on('connection', (ws) => {
                const ip = ws.handshake.headers.host;
                console.log("user " + ip + " connected");
                ws.emit('list', reqManager.serialize());
                ws.on('testApi', (url) => {
                    reqManager.testAPI(url).then((res) => {
                        ws.emit('update', res);
                    });
                });
                ws.on('changeRespondWay', ({url, respondWay}) => {
                    const req = reqManager._getMatchRequest(url);
                    req.setRespondWay(respondWay).then((respond) => {
                        const reqData = req.serialize();
                        reqData.respond = respond;
                        this.broadCast(reqData);
                    });

                });

                ws.on('addNewMock', ({url, newMock}) => {
                    const req = reqManager._getMatchRequest(url);
                    req.addMock(newMock);
                    this.broadCast(req.serialize());
                });
                ws.on('removeMock', ({url, mockName}) => {
                    const req = reqManager._getMatchRequest(url);
                    req.removeMock(mockName);
                    this.broadCast(req.serialize());
                });
                ws.on('editMock', ({url, newMock}) => {
                    const req = reqManager._getMatchRequest(url);
                    req.editMock(newMock);
                    this.broadCast(req.serialize());
                });

                ws.on('getRespond', function (url) {
                    const req = reqManager._getMatchRequest(url);
                    req.getRespond().then((content) => {
                        content.url = url;
                        content.respondWayType = req.respondWay.type;
                        ws.emit('updateReq', content);
                    });
                });
            });
    }

    broadCast(jsonData) {
        this.wss.sockets.emit('update', JSON.stringify(jsonData));
    }

    uiMiddleware(app) {
        const uiPath = path.join(__dirname, 'reqManagerUI/dist');
        app.use(express.static(uiPath));
        // define the home page route
        router.get('/', function (req, res) {
            res.sendFile(uiPath + '/index.html');
        });

        return router
    }
}

module.exports = new uiServer();
