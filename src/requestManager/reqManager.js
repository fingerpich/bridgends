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
        const req = this.getExactRequest(url);
        return this.getApiRespond(req);
    }
    clearCache (url) {
        const req = this.getExactRequest(url);
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
        }).then(() => {
            if (!this.list.filter(r => r.matchUrl('/')).length) {
                this.list.push(new proxiedRequest({req: {url:'/'}}, this.defaultTimeout, true));
            }
        });

        // Update requests file in every 10 minute
        setInterval(() => {
            respondFile.save(this.serialize(), fileName);
        },1000 * 10);
    }

    getExactRequest (url, method) {
        return this.list.filters(r => r.matchExactly(url, method));
    }
    getRequestAndParents(url, method) {
        return this.list.filter(r => r.matchUrl(url, method));
    }

    respondAlternatives (url) {
        return new Promise((resolve, reject) => {
            const requested = this.getExactRequest(url);
            const alternativeWay = requested.respondWay.alternativeWay;
            if (alternativeWay) {
                if (alternativeWay.type === RespondTypes.API) {
                    // It will respond as another request
                    this.getExactRequest(alternativeWay.data)
                        .getRespond(RespondTypes.CACHE)
                        .then((cacheData) => {
                            resolve(cacheData);
                        });

                } else {
                    requested.getRespond(alternativeWay.type, alternativeWay.data).then((data) => {
                        resolve(data);
                    });
                }
            } else {
                const simReq = this.findSimilarCachedRequest(url);
                if (simReq) {
                    requested.setAlternativeWay({type: RespondTypes.API, data: simReq.req.url, auto: true});
                    return this.respondAlternatives(url);
                } else {
                    reject('can not find any similar cached request for' + requested.req.url);
                }
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

    setRequestAccessedAndGetTarget (req) {
        // TODO: add a container request if there is some request with the same base url which has not added before
        const matches = this.getRequestAndParents(req.url, req.method);
        if(!matches.filter(r => r.req.url === req.url).length) {
            const req = new proxiedRequest(null, this.defaultTimeout);
            this.list.push(req);
            matches.push(req);
        }
        matches.forEach(r => r.requested(req));
        const targets = matches
            .filter(r => r.isContainer)
            .sort((a, b) => a.req.url.length - b.req.url.length)
            .map(r => {r.getTarget()})
            .filter(t => !!t);
        if (targets.length) {
            return targets[targets.length - 1]; // its nearest parent which has set target
        } else {
            return '0.0.0.0';
        }

    }
}

module.exports = new RequestManager();