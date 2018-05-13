const fs = require('fs');
const filendir = require('filendir');
const proxiedRequest = require('./proxiedRequest.js');
const fileName = 'requests.json';
const axios = require('axios');
const cache = require('../cacheResponds/cache.js');

class RequestManager {
    constructor () {
        this.list = [];
    }

    getRequestsStates () {
        return this.list.map(r => r.getState());
    }

    testAPI (url) {
        const req = this._getMatchRequest(url);
        return this.getApiRespond(req);
    }

    envelopeRespondChunks(request) {
        return new Promise((resolve, reject) => {
            const reqTime = Date.now();
            request.on('response', (apiRes) => {
                let body = [];
                apiRes.on('data', (chunk) => body.push(chunk));// Data is Buffer when gzip, text when not-gzip
                apiRes.on('end', () => {
                    const resTime = Date.now();
                    const encoding = apiRes.headers['content-encoding'];
                    const buffer = Buffer.concat(body);
                    if (encoding === 'gzip') {
                        body = zlib.gunzipSync(buffer);
                    } else if (encoding === 'deflate') {
                        body = zlib.inflateSync(buffer);
                    } else {
                        body = buffer;
                    }
                    body = body ? body.toString() : '';
                    resolve({body, resTime, reqTime, headers: apiRes.headers , statusCode: apiRes.statusCode});
                });
            });
            request.on('error', (error) => {
                reject(error);
            });
        });
    }
    getApiRespond (requested) {
        let apiURL = requested.getTargetUrl();
        const reqTime = Date.now();

        // req.pipe(request(apiURL))

        const getResponseData = (data) => {
            return {
                body: data.response.data,
                statusCode: data.response.status,
                headers: data.response.headers,
                resTime: Date.now()
            }
        };

        return axios({
            url: apiURL,
            headers: requested.req.headers,
            method: requested.req.method
        }).then(getResponseData, getResponseData).then((data) => {
            data.reqTime = reqTime;
            if (data && requested.checkAndSerializeDataToCache(data)) {
                cache.saveRequest(data);
            }
            return data;
        })
        // return this.envelopeRespondChunks(reqStream).then((respond) => {
        //     if (requested.checkAndSerializeDataToCache(respond)) {
        //         cache.saveRequest(respond);
        //     }
        //     return respond
        // });
    }

    start ({dir}) {
        this.savePath = dir + fileName;
        let data;
        try {
            data = fs.readFileSync(this.savePath, 'utf-8');
        } catch (e) {
            console.log(e.message);
        }
        if (data) {
            const parsed = JSON.parse(data);
            this.list = parsed.map((rq) => {
                return new proxiedRequest(rq);
            });
        }
    }

    _updateReqFile () {
        filendir.writeFile(this.savePath, JSON.stringify(this.list.map(req => req.serialize())), function (err) {
            if (err) {
                console.log('File could not be saved in ' + this.savePath);
                throw err;
            }
        }.bind(this));
    }

    _getMatchRequest (url) {
        const matches = this.list.filter(r => r.match(url));
        let match;
        if (!matches.length) {
            match = new proxiedRequest();
            this.list.push(match);
        } else {
            match = matches[0];
        }
        return match;
    }

    accessed (req) {
        const match = this._getMatchRequest(req.url);
        match.requested(req);
        this._updateReqFile();
        return match;
    }
    respondWith (req, type, data) {

    }
    hasRedirect (req) {

    }
    getRedirectExpr (req) {

    }
    getCachedName (req) {
        return req.url.slice(0, 100) + Date.now();
    }
    getCacheChecks (req) {

    }
}

module.exports = new RequestManager();