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

    deserialize (list) {
        this.list = list.map((rq) => {return new proxiedRequest(rq);});
        this.addRootUrl();
    }

    addRootUrl () {
        if (!this.list.find(r => r.matchUrl('/'))) {
            const root = new proxiedRequest({req: {url: '/'}}, this.defaultTimeout, true);
            root.setTarget(this.targets[0]);
            this.list.push(root);
        }
    }

    testAPI (url, method) {
        const req = this.getExactRequest(url, method);
        return this.getApiRespond(req);
    }

    start (targets, defaultTimeout) {
        this.targets = targets;
        this.defaultTimeout = defaultTimeout;
        if (respondFile.has(fileName)) {
            respondFile.load(fileName).then((parsed) => {
                this.deserialize(parsed);
            })
        } else {
            this.addRootUrl();
        }

        // Update requests file in every 10 minute
        setInterval(() => {
            respondFile.save(this.serialize(), fileName);
        }, 1000 * 10);
    }

    getExactRequest (url, method) {
        return this.list.find(r => r.matchExactly(url, method));
    }
    getRequestAndParents(url, method) {
        return this.list.filter(r => r.matchUrl(url, method));
    }

    respondAlternatives (url, method) {
        return new Promise((resolve, reject) => {
            const requested = this.getExactRequest(url, method);
            const alternativeWay = requested.respondWay.alternativeWay;
            if (alternativeWay) {
                if (alternativeWay.type === RespondTypes.API) {
                    // It will respond as another request
                    this.getExactRequest(alternativeWay.data, method)
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
                const simReq = this.findSimilarCachedRequest(url, method);
                if (simReq) {
                    requested.setAlternativeWay({type: RespondTypes.API, data: simReq.req.url, auto: true});
                    return this.respondAlternatives(url, method);
                } else {
                    reject('can not find any similar cached request for' + requested.req.url);
                }
            }
        });
    }

    findSimilarCachedRequest (originUrl, method) {
        // TODO: use method
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

    // add container requests whenever childrens gets more than what user can handle them
    normalizeTreeByAddingContainer () {
        const sensitiveCount = 5;
        // this.list.forEach(r => r.parent = null);
        const containers = this.list.filter(r => r.isContainer);

        // get containers and all child which are in nested tree of this container
        const containersChildCounts = containers.map(cr => {
            return {container: cr, childCounts: this.list.filter(r => r.req.url.includes(cr.req.url)).length};
        });

        // update container count to children which are child of this container not a grand child
        containersChildCounts
            .sort((a, b) => a.childCounts - b.childCounts)
            .forEach(crcc => {
                const childs = this.list
                    .filter(r => !r.parent && r.req.url.includes(crcc.container.req.url))
                // childs.forEach(r => r.parent = crcc.container);
                crcc.childs = childs;
                crcc.childCounts = childs.length;
            });

        // filter containers which has more than 5 child
        const branchingContainers = containersChildCounts
            .filter(crcc => crcc.childCounts > sensitiveCount)

        branchingContainers.forEach((bc) => {
            const slicedUrls = bc.childs.map(c => c.req.url.slice(bc.container.req.url.length))
            const candidates = slicedUrls.map(url => {
                const candidate = [url];
                while(url){
                    url = url.slice(0, /(\/|\&|\?)/g.test(url).lastIndex);
                    candidate.push(url)
                }
                return candidate;
            })
            candidates
                .map(candid => {
                    let cover = slicedUrls.filter(url => url.indexOf(candid) === 0).length;
                    if (cover === slicedUrls.length) { cover = 0; }
                    return {candid, cover };
                })
                .sort((cc1, cc2) => {
                    // sort which includes more request and then sort by length of common string in url
                    return cc2.cover - cc1.cover || cc2.candid.length - cc1.candid.length
                });
            const bestCandidate = candidates[0];
            if (bestCandidate.cover > (slicedUrls.length / 2)) {
                const req = new proxiedRequest({req:{url: bc.container.req.url + bestCandidate.candid}}, this.defaultTimeout);
                this.list.push(req)
            }
        })
    }

    addNewRequestIfItsNotExist (req) {
        if (!this.list.find(r => r.matchExactly(req.url, req.method))) {
            this.list.push(new proxiedRequest({req}, this.defaultTimeout));
            try {
                this.normalizeTreeByAddingContainer();
            } catch(e) {
                console.log(e);
            }
        }
    }
    markRequestsPulsed (req, list) {
        list.forEach(r => r.requested(req));
    }
    getTarget(list) {
        const targets = list
            .filter(r => r.isContainer)
            .sort((a, b) => a.req.url.length - b.req.url.length)
            .map(r => r.getTarget())
            .filter(t => !!t);
        if (targets.length) {
            return targets[targets.length - 1]; // its nearest parent which has set target
        } else {
            return '0.0.0.0';
        }
    }
}

module.exports = new RequestManager();