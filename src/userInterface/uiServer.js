const express = require('express');
const path = require('path');
const router = express.Router();
const reqManager = require('../requestManager/reqManager.js');
const http = require('http');
// const WebSocket = require('ws');
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
                ws.emit('list', reqManager.getRequestsStates());
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

        // define the about route
        router.get('/reqList', function (req, res) {
            res.send(JSON.stringify(reqManager.list));
        });
        return router
    }
}

module.exports = new uiServer();
