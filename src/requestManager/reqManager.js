const proxiedRequest = require('./proxiedRequest.js');
const fileName = 'requests';
const respondFile = require('../respondFiles/respondFile.js');
const RespondTypes = require('./respondType.js');

class RequestManager {
    constructor () {
        this.list = [];
    }

    serialize () {
        return this.list.map(r => r.serialize());
    }

    testAPI (url) {
        const req = this._getMatchRequest(url);
        return this.getApiRespond(req);
    }
    clearCache (url) {
        const req = this._getMatchRequest(url);
        return req.clearCache().then(res => {
            req.respond = respond;
            return req.serialize();
        })
    }

    start (targets, defaultTimeout) {
        this.targets = targets;
        this.defaultTimeout = defaultTimeout;

        respondFile.load(fileName).then((parsed) => {
            this.list = parsed.map((rq) => {
                return new proxiedRequest(rq);
            });
        });
        // Update requests file in every 10 minute
        setInterval(() => {
            respondFile.save(this.serialize(), fileName);
        },1000 * 10);
    }

    _getMatchRequest (url) {
        const matches = this.list.filter(r => r.matchUrl(url));
        let match;
        if (!matches.length) {
            match = new proxiedRequest(null, this.targets, this.defaultTimeout);
            this.list.push(match);
        } else {
            match = matches[0];
        }
        return match;
    }

    respondAlternatives (url) {
        return new Promise((resolve, reject) => {
            const requested = this._getMatchRequest(url);
            if (!requested.respondWay.alternativeWay) {
                const simReq = this.findSimilarCachedRequest(url);
                if (simReq) {
                    requested.setAlternativeWay({type: RespondTypes.API, data: simReq.req.url, auto: true});
                } else {
                    reject('can not find any similar cached request for' + requested.req.url);
                    return;
                }
            }
            const alternativeWay = requested.respondWay.alternativeWay;
            if (alternativeWay) {
                if (alternativeWay.type !== RespondTypes.API) {
                    requested.getRespond(alternativeWay.type, alternativeWay.data).then((data) => {
                        resolve(data);
                    });
                } else {
                    // It will respond as another request
                    this._getMatchRequest(alternativeWay.data)
                        .getRespond(RespondTypes.CACHE)
                        .then((cacheData) => {
                            resolve(cacheData);
                        });
                }
            } else {
                console.log('alternative way is empty');
            }
        });
    }

    findSimilarCachedRequest (originUrl) {
        let url = originUrl;
        const removeFromEnd = (url, char) => {
            return url.slice(0, url.lastIndexOf(char));
        };

        const chars = ['&', '?', '/'];
        for (let c in chars) {
            while (url.indexOf(c) > 0) {
                url = removeFromEnd(url, '&');
                const lst = this.list.filter((pr) => pr.req.url !== originUrl && pr.req.url.indexOf(url) > -1 && pr.hasCache());
                if (lst.length) {
                    return lst[lst.length - 1];
                }
            }
        }

        return 0;
    }


    accessed (req) {
        const match = this._getMatchRequest(req.url);
        match.requested(req);
        return match;
    }
}

module.exports = new RequestManager();