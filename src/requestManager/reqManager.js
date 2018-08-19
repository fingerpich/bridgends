const LeafRequest = require('./leafRequest.js');
const ContainerRequest = require('./containerRequest.js');
const respondFile = require('../respondFiles/respondFile.js');
const RespondTypes = require('./respondType.js');
const fileName = 'requests';

class RequestManager {
    constructor () {
        this.list = [];
    }

    serialize () {
        return this.list.map(r => r.serialize());
    }

    deserialize (list) {
        this.list = list.map((rq) => {
            if (rq.isContainer) {
                return new ContainerRequest(rq)
            }
            else {
                //we dont fed timeout because every request has its timeout and saved in list
                return new LeafRequest(rq);
            }
        });

        this.addRootUrl();
    }

    addRootUrl () {
        if (!this.list.find(r => r.matchUrl('/'))) {
            const root = new ContainerRequest({req: {url: '/'}});
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

    respondAlternatives (requested, respondWay) {
        return new Promise((resolve, reject) => {
            const alternativeWay = respondWay.alternativeWay;
            if (alternativeWay) {
                if (alternativeWay.type === RespondTypes.API) {
                    // It will respond as another request
                    this.getExactRequest(alternativeWay.data, method)
                        .getRespond(RespondTypes.CACHE)
                        .then((cacheData) => {
                            resolve(cacheData);
                        }, () => {
                            // TODO: return as its API or an error
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
        let url = originUrl;
        const removeFromEnd = (url, char) => {
            return url.slice(0, url.lastIndexOf(char));
        };

        const chars = ['&', '?', '/'];
        for (let c in chars) {
            while (url.indexOf(c) > 0) {
                url = removeFromEnd(url, '&');
                const lst = this.list.filter((pr) => {
                    return !pr.isContainer && pr.req.method === method && pr.req.url !== originUrl &&
                        pr.req.url.indexOf(url) > -1 && pr.hasCache()
                });
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
        this.list.forEach(r => r.parent = null);
        const containers = this.list.filter(r => r.isContainer);

        // get containers and all child which are in nested tree of this container
        const containersChildCounts = containers.map(cr => {
            return {container: cr,
                childCounts: this.list.filter(r => {
                    return (r.req.url !== cr.req.url) && (r.req.url.includes(cr.req.url))
                }).length};
        }).sort((a, b) => a.childCounts - b.childCounts);

        // update container count to children which are child of this container not a grand child
        containersChildCounts
            .forEach(crcc => {
                const childs = this.list
                    .filter(r => {
                        return !r.parent &&
                            r.req.url !== crcc.container.req.url &&
                            r.req.url.includes(crcc.container.req.url)
                    })
                childs.forEach(r => r.parent = crcc.container);
                crcc.childs = childs;
                crcc.childCounts = childs.length;
            });

        // filter containers which has more than 5 child
        const branchingContainers = containersChildCounts
            .filter(crcc => crcc.childCounts > sensitiveCount)

        let success = false;
        branchingContainers.forEach((bc) => {
            const slicedUrls = bc.childs.map(c => c.req.url.slice(bc.container.req.url.length))
            const candidates = Object.keys(slicedUrls.reduce((urlsObj, url) => {
                const regex = /(\/|\&|\?)/g;
                const splitted = url.split(regex);
                let urlPart = splitted[0];
                urlsObj[urlPart] = 1;
                for (let i = 1; i < splitted.length;i += 2) {
                    urlPart += splitted[i] + splitted[i+1];
                    urlsObj[urlPart] = 1;
                }
                return urlsObj;
            }, {}));
            const sortedCandidates = candidates
                .map(candid => {
                    //TODO: cover should be the number of node which is first child of this new container
                    let cover = slicedUrls.filter(url => url.indexOf(candid) === 0).length;
                    const ecover = (cover === slicedUrls.length || cover === 1) ? 0 : cover;
                    return {candid, cover, ecover };
                })
                .sort((cc1, cc2) => {
                    // sort which includes more request and then sort by length of common string in url
                    return cc2.ecover - cc1.ecover || cc2.candid.length - cc1.candid.length
                });
            const bestCandidate = sortedCandidates[0];
            if (bestCandidate.ecover > sensitiveCount) {
                const req = new ContainerRequest({req:{url: bc.container.req.url + bestCandidate.candid}});
                this.list.push(req);
                success = true;
            }
        });
        return success;
    }

    addNewRequestIfItsNotExist (url, method) {
        if (!this.list.find(r => r.matchExactly(url, method))) {
            this.list.push(new LeafRequest({req:{url: url, method: method}}, this.defaultTimeout));
            return this.normalizeTreeByAddingContainer();
        }
    }
    markRequestsPulsed (url, req, list) {
        list.forEach(r => r.requested(url, req));
    }
    getTarget(list) {
        const targets = list
            .sort((a, b) => a.req.url.length - b.req.url.length)
            .map(r => r.getTarget())
            .filter(t => !!t);
        if (targets.length) {
            return targets[targets.length - 1]; // its nearest parent which has set target
        } else {
            return '0.0.0.0';
        }
    }
    getHeaders(list) {
        const headers = list
            .map(r => r.getHeaders())
            .filter(h => !!h)
        return headers;
    }

    getRespondWay(list) {
        const rws = list.sort((a, b) => b.req.url.length - a.req.url.length)
            .map(r => {return {r, rw: r.getRespondWay()}})
            .filter(rrw => rrw.rw !== RespondTypes.AS_THEY_SETTLED);
        // rws[0].rw is respond way for the request
        // rws[1].rw is respond way for his nearest parent if changed its way
        const theRequest = rws[0];
        const nearFather = rws[1];
        if (nearFather) {
            if (nearFather.rw.indexOf(RespondTypes.MOCK_ALL) > -1) {
                const mockName = nearFather.rw.slice(RespondTypes.MOCK_ALL.length);
                return nearFather.r._getMock(mockName);
            } else if (nearFather.rw.indexOf(RespondTypes.PRIORITY) > -1) {
                const priority = nearFather.rw.slice(RespondTypes.PRIORITY.length);
                if (priority === RespondTypes.API_CACHE_MOCK) {
                    const apiWay = theRequest.getApiWay();
                    if (theRequest.hasCache()) {
                        apiWay.alternativeWay = theRequest._getCache()
                    } else if (theRequest._getMocks().length) {
                        apiWay.alternativeWay = theRequest._getActivatedMock()
                    }
                    return apiWay;
                } else if (priority === RespondTypes.CACHE_API_MOCK) {
                    if (theRequest.hasCache()) {
                        return theRequest._getCache();
                    } else {
                        const apiWay = theRequest.getApiWay();
                        if (theRequest._getMocks().length) {
                            apiWay.alternativeWay = theRequest._getActivatedMock();
                        }
                        return apiWay;
                    }
                }
                } else if (priority === RespondTypes.MOCK_CACHE_API) {
                    if (theRequest._getMocks().length) {
                        return theRequest._getActivatedMock();
                    } else if (theRequest.hasCache()) {
                        return theRequest._getCache();
                    } else {
                        return theRequest.getApiWay();
                    }
                }
            } else if (nearFather.rw.indexOf(RespondTypes.AS_ANOTHER_REQUEST) > -1) {
                const anotherUrl = nearFather.rw.slice(RespondTypes.AS_ANOTHER_REQUEST.length);
                const anotherReq = this.getExactRequest(anotherUrl, theRequest.method);
                if (anotherReq.hasCache()) {
                    return anotherReq.getCache();
                } else {
                    return theRequest.rw;
                }

        } else {
            return theRequest.rw;
        }
    }
}

module.exports = new RequestManager();