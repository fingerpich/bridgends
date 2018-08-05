import moment from 'jalali-moment';
import RespondType from "../../../../requestManager/respondType.js"

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  requests: [],
  selectedReq: null,
}
const INHERIT = 'Inherit';

// getters
const getters = {
  treeRequests: state => {
    const count = (str, regex) => (str.match(regex) || []).length;
    const containers = state.requests.map(r => ({r, s: count(r.req.url, /(\/|\&|\?)/g)}));
    containers.sort((a, b) => a.s - b.s);
    const flattenTree = [];
    const tree = [];
    containers.forEach(({r,s}) => {
      const newItem = {id:r.req.url, label: r.req.url, children: [], req: r};
      if (flattenTree.length) {
        const ancestors = flattenTree.filter(item => r.req.url.includes(item.id));
        const parent = ancestors.reduce((acc, item) => item.id.length > acc.id.length ? item : acc, flattenTree[0]);
        newItem.label = newItem.label.slice(parent.label.length);
        parent.children.push(newItem);
      } else {
        tree.push(newItem);
      }
      flattenTree.push(newItem);
    });
    return tree;
  },
  getAllTargets: state => {
    const list = Object.keys(state.requests.reduce((targets, r) => {
      if(r.target) targets[r.target] = 1;
      return targets;
    }, {}));
    if (state.selectedReq.req.url !== '/') {
      list.push(INHERIT);
    }
    return list;
  },
  getSelectedRequestTarget: state => {
    return state.selectedReq.target || INHERIT
  },
  allRequests: state => state.requests,
  selectedRequest: state => state.selectedReq,
  getType: (state, type) => state.selectedReq.respondOptions.filter(res => res.type === type),
  getMocks: state => getters.getType(state, RespondType.MOCK),
  getCache: state => getters.getType(state, RespondType.CACHE)[0],
  getAPIs: state => getters.getType(state, RespondType.API),
  respondWay: state => state.selectedReq.respondWay,
  respondOptions: state => state.selectedReq.respondOptions,
  alternativeOptions: state => state.selectedReq.respondOptions.filter(o => o !== state.selectedReq.respondWay),
}

// actions
const actions = {
  loadRequests ({dispatch, commit}, options) {
    this._vm.$socket.emit('getList', {});
  },

  changeRespondWay (context, respondWay) {
    const data = {req: getters.selectedRequest(context.state).req, respondWay};
    this._vm.$socket.emit('changeRespondWay', data);
    context.commit('changeRespondWay', data.respondWay);
  },

  changeTarget(context, target) {
    const data = {req: getters.selectedRequest(context.state).req, target};
    this._vm.$socket.emit('changeTarget', data);
  },

  changeRespondWayType (context, selectedWayType) {
    if (getters.getType(context.state, selectedWayType).length) {
      const respondWay = getters.getType(context.state, selectedWayType).filter(tway => tway.lastActivated)[0];
      context.dispatch('changeRespondWay', respondWay)
    } else {
      context.commit('setSelectedReq', {
        ...context.state.selectedReq,
        ...{
          respondWay: {type: selectedWayType},
          lastRespondWay: context.state.selectedReq.respondWay.type,
          respond: null
        }
      });
    }
  },
  changeAlternativeWay (context, selectedAlternative) {
    const respondWay = getters.selectedRequest(context.state).respondWay;
    respondWay.alternativeWay = selectedAlternative;
    context.dispatch('changeRespondWay', respondWay)
  },

  setSelectedRequest({dispatch, commit}, req) {
    commit('setSelectedReq', req);
    this._vm.$socket.emit('getRespond', {req: req.req});
  }
}
// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const processReq = (req) => {
  req.freq = req.usedDates.filter((d) => (Date.now() - d) < 1000 * 60).length;
  const m = moment(req.usedDates[0]);
  req.formatedDate = m.format('H:mm:ss:') + m.millisecond();
  return req;
};

const mutations = {
  changeRespondWay(state, way) {
    if (way.type === state.selectedReq.respondWay.type) {
      state.selectedReq.respondOptions
        .filter(ro => ro.type === way.type)
        .forEach(ro => {
          ro.lastActivated = ro.file === way.file;
        });
    }
    state.selectedReq = {...state.selectedReq, respondWay: way};
  },
  updateRespondWay(state, choosenRespondWayType) {
    let typeOptions = getters.getType(state, choosenRespondWayType);
    if (typeOptions.length > 1) {
      typeOptions = typeOptions.filter(ro => ro.lastActivated)
    }
    if (typeOptions.length) {
      state.selectedReq = {...state.selectedReq, respondWay: typeOptions[0]};
    }
  },
  addNewRespondWay(state, newWay) {
    newWay = {};
    state.selectedReq.respondOptions.push(newWay);
    state.selectedReq.respondWay = newWay;
  },
  setSelectedReq (state, req) {
    if (req) {
      state.selectedReq = req;
    }
  },
  SOCKET_CONNECT (state,  status ) {
    state.connectionStatus = status;
    console.log("user is connected");
  },
  SOCKET_TEST_RESPONSE (state,  message) {
    const resp = message[0];
    console.log('we have got message of server in socket');
    state.selectedReq.apiRespond = resp;
  },
  SOCKET_LIST (state,  message) {
    const reqs = message[0];
    console.log('we have got message of server in socket');
    state.requests = reqs.map(processReq);
  },
  SOCKET_UPDATE (state, data) {
    const changedReq = JSON.parse(data[0]);
    let matchReq = state.requests.filter(r => {
      return r.req.url === changedReq.req.url;
    });
    if (matchReq.length) {
      matchReq = matchReq[0];
      matchReq = Object.assign(matchReq, processReq(changedReq));
      if (state.selectedReq && state.selectedReq.req.url === matchReq.req.url) {
        state.selectedReq = matchReq;
      }
      if(!matchReq.updateTime) matchReq.updateTime = 0;
      matchReq.updateTime++;
      setTimeout(()=> {
        matchReq.updateTime--;
      },300);
    } else {
      state.requests.push(processReq(changedReq));
    }
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
