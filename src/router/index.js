import Vue from 'vue'
import Router from 'vue-router'
import AppFlow from '@/components/app-flow'
import AppReadme from '@/components/app-readme'

Vue.use(Router)

// Dynamic base
const parts = window.location.pathname.split('/')
parts.pop()
const base = parts.join('/') + '/'

export default new Router({
  mode: 'history',
  base: base,
  routes: [
    { path: '/readme', component: AppReadme },
    { path: '/*', component: AppFlow }
    // { path: '/*/s\\::sessId', component: AppFlow },
    // { path: '/s\\::sessId', component: AppFlow }
    // { path: '/*', component: AppFlow }

    // { path: '*?/s\\::sessId', component: AppFlow },
    // { path: '*?/help', component: AppHelp }

    // With a context
    /* { path: '/:context', component: AppFlow },
    { path: '/:context/s\\::sessId', component: AppFlow },
    { path: '/:context/help', component: AppHelp }, */
    // Backward compatibilitie
    // { path: '/:context/:sessId', redirect: '/:context/s\\::sessId' }

  ]

})
