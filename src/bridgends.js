const getRequestResult = require('./helpers/getRestResult.js');
const urlFixer = require('./helpers/urlFixer.js');
const cache = require('./cacheResponds/cache.js');
const Envelope = require('./cacheResponds/envelope.js');
const faker = require('./fakeApi/faker.js');
const express = require('express');
const request = require('request');

const reqManager = require('./requestManager/reqManager.js');

class Bridgends {

    _chooseRespondWay(way) {
        switch (way) {
            case 'fake': return Promise.resolve(faker.respond(req));
            case 'cache': return Promise.resolve(cache.respond(req));
            case 'api': return this.apiPromise;
        }
    }

    _cacheMiddleWare (req, res, next) {
        const requested = reqManager.accessed(req);
        this.apiPromise = this._sendRequestToApi(req).then((data) => {
            const parsedResp = Envelope.fromData(data);

            let shouldSave = true;
            const checks = requested.getCacheChecks(req);
            if (checks.checkIsNotError) shouldSave = shouldSave && parsedResp.checkError();
            if (checks.hasData) shouldSave = shouldSave && parsedResp.checkHasData();

            if (shouldSave) {
                cache.saveRequest(parsedResp);
            }
            requested.respondWith(shouldSave, parsedResp.checkError(), parsedResp.checkHasData());
            return data;
        });

        this._chooseRespondWay(requested.way).then((data) => {
            reqManager.respondWith(req, data);
            if (!res.headersSent) {
                res.writeHead(200, data.headers);
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
        this.config = {...{
                apiPath:'/api',
                port: 6464,
                saveDir:'cache_api/'
            }, ...config};
        const app = express();

        faker.start({ dir: this.config.saveDir});
        cache.start({ dir: this.config.saveDir});
        reqManager.start({ dir: this.config.saveDir});

        app.use(this.config.apiPath, this._cacheMiddleWare.bind(this));
        app.listen(this.config.port, () => {console.log(`open http://localhost:${this.config.port}!`);});
    }
}

module.exports = new Bridgends();