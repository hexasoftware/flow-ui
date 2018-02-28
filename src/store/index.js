import Vuex from 'vuex'
import Vue from 'vue'

import plugin from './ws'

import flow from './flow'
import chat from './chat'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  modules: {
    chat: {
      namespaced: true,
      ...chat
    },
    flow: {
      namespaced: true,
      ...flow
    }
  },
  plugins: [plugin]
})
