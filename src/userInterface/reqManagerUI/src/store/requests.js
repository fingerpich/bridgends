import axios from 'axios'
import config from '../../../../../config.js';
import moment from 'jalali-moment';
import RespondType from "../../../../requestManager/respondType.js"

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  requests: [],
  selectedReq: null,
}

// getters
const getters = {
  allRequests: state => state.requests,
  selectedRequest: state => state.selectedReq,
  getType: (state, type) => state.selectedReq.respondOptions.filter(res => res.type === type),
  getMocks: state => getters.getType(state,RespondType.MOCK),
  getCache: state => getters.getType(state,RespondType.CACHE)[0],
  getAPIs: state => getters.getType(state,RespondType.API),
  targetOptions: state =>  [
    {label:'165.1654.1654.21', value: 'http://231.21621.23152.231'},
    {label:'165.21.66.216', value: 'http://231.21621.23152.321'}
  ],
  respondWay: state => state.selectedReq.respondWay,
  respondOptions: state => state.selectedReq.respondOptions,
  alternativeOptions: state => state.selectedReq.respondOptions.filter(o => o !== state.selectedReq.respondWay),
}

// actions
const actions = {
  loadRequests ({dispatch, commit}, options) {
    // return axios.get(config.uiPath + '/reqList', {params: options}).then(res => {
    //   commit('fillRequests', res.data)
    // })
    dispatch('sendMessage', 'getList')
  },
  sendMessage ({dispatch, commit}, message) {
    dispatch('newMessage', message);
  },
  setSelectedRequest({dispatch, commit}, req) {
    commit('setSelectedReq', req);
  }
}
// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const processReq = (req) => {
  req.freq = req.usedDates.filter((d) => (Date.now() - d) < 1000 * 60).length;
  const m = moment(req.lastUsed);
  req.formatedDate = m.format('H:mm:ss:') + m.millisecond();
  return req;
};

const mutations = {
  updateAlternativeWay(state, choosenWay) {
    state.selectedReq = {...state.selectedReq};
    state.selectedReq.respondWay.alternativeWay = choosenWay;
  },
  setCacheContent(state, content) {
    state.selectedReq = {...state.selectedReq};
    state.selectedReq.cacheContent = content;
  },
  updateApiTarget(state, target) {
    state.selectedReq = {...state.selectedReq};
    state.selectedReq.respondWay.target = target;
  },
  updateRespondWay(state, choosenRespondWayType) {
    let typeOptions = getters.getType(state, choosenRespondWayType)
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
