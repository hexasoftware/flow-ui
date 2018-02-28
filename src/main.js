import Vue from 'vue'
import App from './App.vue'

import { sync } from 'vuex-router-sync'
import router from './router'
import store from '@/store'

import FlowService from '@/services/flowservice-vue'

Vue.use(FlowService)
sync(store, router)

window.app = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
