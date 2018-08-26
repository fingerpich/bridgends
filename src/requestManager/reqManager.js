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

        // this.addRootUrl();
    }

    // addRootUrl () {
    //     if (!this.list.find(r => r.matchUrl('/'))) {
    //         const root = new ContainerRequest({req: {url: '/'}});
    //         root.setTarget(this.targets[0]);
    //         this.list.push(root);
    //     }
    // }

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
            // this.addRootUrl();
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
        const alternativeWay = respondWay.alternativeWay;
        if (alternativeWay) {
            if (alternativeWay.type === RespondTypes.API) {
                // It will respond as another request
                return this.getExactRequest(alternativeWay.data, requested.req.method)
                    .getRespond(RespondTypes.CACHE);
            } else {
                return requested.getRespond(alternativeWay.type, alternativeWay.data);
            }
        } else {
            const url = requested.req.url;
            const method = requested.req.method;
            const simReq = this.findSimilarCachedRequest(url, method);
            if (simReq) {
                requested.setAlternativeWay({type: RespondTypes.API, data: simReq.req.url, auto: true});
                return this.respondAlternatives(requested, respondWay);
            } else {
                return Promise.reject('can not find any similar cached request for' + requested.req.url);
            }
        }
    }

    findSimilarCachedRequest (originUrl, method) {
        const filtered = this.list.filter(r => !r.isContainer && (r.req.method === method) && r.hasCache());
        if (filtered.length) {
            let url = originUrl;
            const removeFromEnd = (url, char) => {
                const lio = url.lastIndexOf(char);
                return url.slice(0, lio);
            };

            const chars = ['&', '?', '/'];
            for (let c of chars) {
                    while (url.includes(c)) {
                        url = removeFromEnd(url, c);
                        const lst = filtered.filter((pr) => {
                            return pr.req.url.includes(url)
                        });
                        if (lst.length) {
                            return lst[lst.length - 1];
                        }
                    }
            }
        }
        return 0;
    }

    addContainerForEveryRequest (url) {
        const regex = /(\/|\&|\?)/g;
        const splitted = url.split(regex);
        const lst = [splitted[1]];
        let urlAcc = '';
        for (let i = 1; i < splitted.length;i += 2) {
            if (i > 1) {lst.push(urlAcc);}
            urlAcc += splitted[i] + splitted[i+1];
        }
        const addedList = lst.filter(url => !this.getExactRequest(url, undefined));
        addedList.forEach(url => {
            const req = new ContainerRequest({req:{url: url}});
            if (url.length === 1 && this.targets && this.targets.length) {
                req.setTarget(this.targets[0]);
            }
            this.list.push(req);
        });
        return addedList.length;
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
            // return this.normalizeTreeByAddingContainer();
            return this.addContainerForEveryRequest(url);
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
            const splitted = nearFather.rw.split(RespondTypes.Delimiter)
            const way = splitted[0];
            const data = splitted[1];
            if (way === RespondTypes.MOCK_ALL) {
                const mockName = data;
                return {respondWay: nearFather.r._getMock(mockName), requester: nearFather.r};
            } else if (way === RespondTypes.PRIORITY) {
                const priority = data;
                if (priority === RespondTypes.API_CACHE_MOCK) {
                    const apiWay = theRequest.getApiWay();
                    if (theRequest.hasCache()) {
                        apiWay.alternativeWay = theRequest._getCache()
                    } else if (theRequest._getMocks().length) {
                        apiWay.alternativeWay = theRequest._getActivatedMock()
                    }
                    return {respondWay: apiWay, requester: theRequest.r};
                } else if (priority === RespondTypes.CACHE_API_MOCK) {
                    if (theRequest.hasCache()) {
                        return {respondWay: theRequest._getCache(), requester: theRequest.r};
                    } else {
                        const apiWay = theRequest.getApiWay();
                        if (theRequest._getMocks().length) {
                            apiWay.alternativeWay = theRequest._getActivatedMock();
                        }
                        return {respondWay: apiWay, requester: theRequest.r};
                    }
                } else if (priority === RespondTypes.MOCK_CACHE_API) {
                    if (theRequest._getMocks().length) {
                        return {respondWay: theRequest._getActivatedMock(), requester: theRequest.r};
                    } else if (theRequest.hasCache()) {
                        return {respondWay: theRequest._getCache(), requester: theRequest.r};
                    } else {
                        return {respondWay: theRequest.getApiWay(), requester: theRequest.r};
                    }
                }
            } else if (way === RespondTypes.AS_ANOTHER_REQUEST) {
                const anotherUrl = data;
                const anotherReq = this.getExactRequest(anotherUrl, theRequest.method);
                if (anotherReq.hasCache()) {
                    return {respondWay: anotherReq.getCache(), requester: anotherReq};
                } else {
                    return {respondWay: theRequest.rw, requester: theRequest.r};
                }
            }
        } else {
            return {respondWay: theRequest.rw, requester: theRequest.r};
        }
    }
}

module.exports = new RequestManager();