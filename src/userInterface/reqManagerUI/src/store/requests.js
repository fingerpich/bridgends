import axios from 'axios'
import config from '../../../../../config.js';

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  requests: [],
}

// getters
const getters = {
  allrequests: state => state.requests,
}

// actions
const actions = {
  loadTests ({ commit }, options) {
    return axios.get(config.uiPath + '/reqlist', {params: options}).then(res => {
      commit('fillRequests', res.data.data)
    })
  }
}
// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  fillRequests (state, {items}) {
    state.requests = items
  },
}

export default {
  state,
  mutations,
  actions,
  getters
}
