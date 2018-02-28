// FlowWSService
import flowService from './flowservice'

export default {

  install (Vue, options) {
    Vue.prototype.$flowService = flowService
  }

}
