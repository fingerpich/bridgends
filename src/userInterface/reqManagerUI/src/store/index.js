import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import requests from './requests'

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [createPersistedState()],
  modules: {
    requests
  }
})

export default store
