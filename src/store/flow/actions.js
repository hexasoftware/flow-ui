import m from './mutation-types'
import flowService from '@/services/flowservice'

export default {
  [m.DOCUMENT_SYNC] (ctx) {
    flowService.documentUpdate(ctx.getters.nodeData, ctx.state.sessId)
  },
  // Node update full document state somehow
  [m.DOCUMENT_UPDATE] ({commit}, nodeData) {
    // WEBSOCKET
    commit(m.DOCUMENT_UPDATE, nodeData)
  },
  [m.NODE_RAISE] ({commit}, nodes) {
    commit(m.NODE_RAISE, nodes)
  },
  [m.NODE_UPDATE] (ctx, nodes) {
    // WEBSOCKET
    ctx.commit(m.NODE_UPDATE, nodes)
    flowService.nodeUpdate(nodes)
  },

  [m.NODE_ADD] (ctx, nodes) {
    // WEBSOCKET
    ctx.commit(m.NODE_ADD, nodes)
    ctx.dispatch(m.DOCUMENT_SYNC)
  },
  [m.NODE_REMOVE] (ctx, nodes) {
    ctx.commit(m.NODE_REMOVE, nodes)
    // ctx.commit(m.NODE_SELECTION_REMOVE, nodes)
    flowService.nodeRemove(nodes)
    ctx.dispatch(m.DOCUMENT_SYNC)
  },
  [m.NODE_PROCESS] (ctx, nodeIds) {
    // Should be an array now
    flowService.nodeProcess(nodeIds)
  },
  [m.NODE_SELECTION_CLEAR] (ctx) {
    ctx.commit(m.NODE_SELECTION_CLEAR)
  },
  [m.NODE_SELECTION_SET] (ctx, nodes) {
    ctx.commit(m.NODE_SELECTION_SET, nodes)
  },
  [m.NODE_SELECTION_REMOVE] (ctx, nodes) {
    ctx.commit(m.NODE_SELECTION_REMOVE, nodes)
  },
  [m.NODE_SELECTION_ADD] (ctx, nodes) {
    ctx.commit(m.NODE_SELECTION_ADD, nodes)
  },
  // XXX: Experimental, temporary
  [m.NODE_TRAIN] (ctx, nodeId) {
    flowService.nodeTrain(nodeId)
  },

  [m.LINK_ADD] (ctx, link) {
    ctx.commit(m.LINK_ADD, link)
    ctx.dispatch(m.DOCUMENT_SYNC)
  },
  [m.LINK_REMOVE] (ctx, link) {
    ctx.commit(m.LINK_REMOVE, link)
    // flowService.linkRemove(link)
    ctx.dispatch(m.DOCUMENT_SYNC)
  },
  [m.TRIGGER_ADD] (ctx, trigger) {
    ctx.commit(m.TRIGGER_ADD, trigger)
    ctx.dispatch(m.DOCUMENT_SYNC)
  },
  [m.TRIGGER_REMOVE] (ctx, trigger) {
    ctx.commit(m.TRIGGER_REMOVE, trigger)
    ctx.dispatch(m.DOCUMENT_SYNC)
  },
  [m.NOTIFICATION_ADD] (ctx, notification) {
    ctx.commit(m.NOTIFICATION_ADD, notification)
    clearTimeout(this.notificationTimeout)
    this.notificationTimeout = setTimeout(() => {
      ctx.commit(m.NOTIFICATION_CLEAR)
    }, 5000)
  },
  [m.NOTIFICATION_CLEAR] ({commit}) {
    commit(m.NOTIFICATION_CLEAR)
  }

}
