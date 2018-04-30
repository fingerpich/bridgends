import axios from 'axios'
import config from '../../../../../config.js';

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  requests: [],
}

// getters
const getters = {
  allRequests: state => state.requests,
}

// actions
const actions = {
  loadRequests ({ commit }, options) {
    return axios.get(config.uiPath + '/reqList', {params: options}).then(res => {
      commit('fillRequests', res.data)
    })
  }
}
// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  fillRequests (state, items) {
    state.requests = items
    state.requests.forEach((req) => {
      req.freq = req.usedDates.filter((d) => (Date.now() - d) < 1000 * 60).length
    })
  },
}

export default {
  state,
  mutations,
  actions,
  getters
}
