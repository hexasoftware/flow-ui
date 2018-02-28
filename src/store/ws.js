import defRegistry from './flow/default-registry'
import flowMut from './flow/mutation-types'
import chatMut from './chat/mutation-types'
import flowService from '@/services/flowservice'
import utils from '@/utils/utils'

let flow = {}
let chat = {}
for (let k in flowMut) { flow[k] = 'flow/' + k }
for (let k in chatMut) { chat[k] = 'chat/' + k }

let targetws
// DEBUG PURPOSES
window.dbgDisconnect = () => {
  flowService.close()
}
window.dbgReconnect = () => {
  flowService.connect(targetws)
}

export default store => {
  store.subscribe(mut => {
    // console.log('I changed -- perform the connection somehow', mut)
    if (mut.type === 'route/ROUTE_CHANGED') {
      let route = window.location.pathname
      // let route = mut.payload.to.path
      const urlParts = route.split('/')
      urlParts[0] = window.location.host // Substitute first '/' with host
      urlParts[urlParts.length - 1] = 'conn' // 'substitute last with 'conn'
      const urlPath = urlParts.join('/')

      // Add protocol
      targetws = 'ws://' + urlPath
      if (window.location.protocol === 'https:') {
        targetws = 'wss://' + urlPath
      }
      flowService.connect(targetws)
    }
  })

  // Connected
  flowService.connected(() => {
    // Allow any persisted thing to be send first if any
    setTimeout(() => {
      const match = /.*\/s:(.*)/.exec(store.state.route.path)
      let sessId
      if (match != null) {
        sessId = match[1]
      }
      // Make this in a service
      if (sessId === undefined) {
        flowService.sessionNew()
        return
      }
      store.commit(flow.SESSID_UPDATE, sessId)
      flowService.sessionLoad(undefined, sessId)
    })
  })
  flowService.on('document', (v) => {
    utils.activity()
    store.commit(flow.DOCUMENT_UPDATE, v.data)
  })
  flowService.on('nodeUpdate', (v) => {
    utils.activity()
    store.commit(flow.NODE_UPDATE, v.data)
  })

  flowService.on('registry', (v) => {
    let res = {}
    for (let k of Object.keys(v.data)) {
      const e = v.data[k]
      res[k] = {
        categories: e.categories,
        inputs: e.inputs,
        inputDesc: e.inputDesc,

        output: e.output,
        outputDesC: e.outputDesc,
        style: e.extra && e.extra.style
      }
    }
    store.commit(flow.REGISTRY_UPDATE, Object.assign({}, defRegistry, res))
  })
  flowService.on('nodeActivity', (v) => {
    utils.activity()
    store.commit(flow.ACTIVITY_UPDATE, v.data || {nodes: {}})
  })
  flowService.on('sessionNotify', (v) => {
    utils.activity()
    store.dispatch(flow.NOTIFICATION_ADD, v.data)
  })
  flowService.on('sessionJoin', (v) => {
    utils.activity()
    // store.dispatch(flow.NOTIFICATION_ADD, 'Connected')
    const sessId = v.id
    store.dispatch(chat.CHAT_JOIN, {
      handle: store.state.chat.handle,
      sessId: sessId
    })
    store.commit(chat.EVENTS_UPDATE, [])
    store.commit(flow.SESSID_UPDATE, sessId)
  })

  /// // CHAT //////
  flowService.on('chatUserList', (v) => {
    utils.activity()
    store.commit(chat.USERLIST_UPDATE, v.data)
  })
  flowService.on('chatEvent', (v) => {
    utils.activity()
    store.commit(chat.EVENT_ADD, v.data)
  })
}
