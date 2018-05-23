import config from '../../../../../defaultconfig.js'
import Vue from 'vue'
import Vuex from 'vuex'
// import createPersistedState from 'vuex-persistedstate'
import VueSocketio from 'vue-socket.io';
import socketio from 'socket.io-client';

import requests from './requests'

Vue.use(Vuex)


const store = new Vuex.Store({
  // plugins: [createPersistedState()],
  modules: {
    requests
  }
})

Vue.use(VueSocketio, socketio({path: config.socketPath}), store);

export default store
