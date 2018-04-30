const getRequestResult = require('./helpers/getRestResult.js');
const urlFixer = require('./helpers/urlFixer.js');
const cache = require('./cacheResponds/cache.js');
const faker = require('./fakeApi/faker.js');
const express = require('express');
const uiServer = require('./userInterface/uiServer.js');
const request = require('request');

const reqManager = require('./requestManager/reqManager.js');

class Bridgends {

    _cacheMiddleWare (req, res, next) {
        const requested = reqManager.accessed(req);
        this.apiPromise = this._sendRequestToApi(req).then((parsedResp) => {
            requested.getCacheData(parsedResp).then((data) => {
                cache.saveRequest(data);
            });
            return parsedResp;
        });

        requested.getRespondSetting()
            .then(options => {
                switch (options.responder) {
                    case 'fake': return Promise.resolve(faker.respond(options.fakeID));
                    case 'cache': return Promise.resolve(cache.respond(options.cacheID));
                    case 'api': return this.apiPromise;
                }
            })
            .then((data) => {
                reqManager.respondWith(req, data);
                if (!res.headersSent) {
                    res.writeHead(data.statusCode, data.headers);
                    res.end(data.body);
                }
                next();
            });
    }

    _sendRequestToApi (req) {
        let apiURL = urlFixer.replaceRemoteAddress(req.url, this.config.target);
        apiURL = this.config.replace ? this.config.replace(apiURL) : apiURL || apiURL;
        const apiRequest = req.pipe(request(apiURL));
        return getRequestResult(apiRequest);
    }

    start (config) {
        const defaultConfig = {
            apiPath:'/api',
            port: 6464,
            uiPath: '/reqManger',
            saveDir:'cache_api/'
        };
        this.config = {...defaultConfig, ...config};
        const app = express();

        faker.start({ dir: this.config.saveDir});
        cache.start({ dir: this.config.saveDir});
        reqManager.start({ dir: this.config.saveDir});
        app.use(this.config.apiPath, this._cacheMiddleWare.bind(this));
        app.use(this.config.uiPath, uiServer);
        app.listen(this.config.port, () => {console.log(`open http://localhost:${this.config.port + this.config.uiPath}!`);});
    }
}

module.exports = new Bridgends();