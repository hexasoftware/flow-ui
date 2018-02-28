import Vue from 'vue'
const methods = [
  'sessionNew', 'sessionLoad', // SESSION
  'documentUpdate', 'documentRun', 'documentSave', // DOCUMENT
  'chatEvent', 'chatJoin', 'chatRename', // CHAT
  'linkAdd', 'linkUpdate', 'linkRemove', // LINK
  'triggerAdd', 'triggerUpdate', 'triggerRemove',
  'nodeUpdate', 'nodeAdd', 'nodeRemove', 'nodeProcess', // NODE
  'nodeTrain' // XXX: experimental (should be removed)
]

const debug = 0

// FlowWSService
let log = () => {}
if (debug) {
  log = console.log.bind(console.log, '%cSVC:', 'color:#0a0', (Math.random() * 1000).toFixed())
}
function FlowService () {
// singleton per module
  var ws = null
  var connected = false
  var reconnect = false
  var eventBus = new Vue()
  var loc = '' // The location

  // WS Connector
  function connect () {
    reconnect = true
    ws = new window.WebSocket(loc)
    ws.onopen = () => {
      log('connected', ws)
      connected = true
      eventBus.$emit('open')
    }
    ws.onmessage = (e) => { // receiving message
      log('received:', e.data)
      const msg = JSON.parse(e.data)
      eventBus.$emit(msg.op, msg) // Pass message through
    }
    ws.onerror = (e) => { connected = false }
    ws.onclose = (e) => {
      log('Lost connection', e)
      if (connected === true) {
        eventBus.$emit('close')
      } // emit close
      connected = false
      if (reconnect !== true) {
        return
      }

      setTimeout(() => connect(loc), 3000) // Reconnect
    }
  }
  const service = {
    send (msg) {
      ws.send(JSON.stringify(msg))
    },
    connected (cb) {
      if (connected === false) {
        eventBus.$on('open', cb)
        return
      }
      cb()
    },
    on: eventBus.$on.bind(eventBus),
    once: eventBus.$once.bind(eventBus),
    off: eventBus.$off.bind(eventBus),
    connect (ploc) {
      loc = ploc
      if (ws) { ws.close() }
      if (!reconnect) connect()
      log('Connecting to', loc)
    },
    close () {
      if (!ws) { return }
      ws.close()
    }
  }

  methods.forEach(ftyp => {
    service[ftyp] = (param, id) => {
      log('sending:', ftyp, ' -- ', param)
      if (connected) {
        service.send({op: ftyp, id: id, data: param})
        return
      }
      if (ftyp !== 'documentUpdate') return // Do not persist other than documentUpdate on reconnection
      // Schedule when is connected
      const lparam = JSON.parse(JSON.stringify(param))
      service.once('open', () => {
        service.send({op: ftyp, id: id, data: lparam})
      })
    }
  })
  Object.assign(this, service)
}

export default new FlowService()
