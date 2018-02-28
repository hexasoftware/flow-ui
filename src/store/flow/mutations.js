import Vue from 'vue'
import nodeSize from '@/components/flow/node-size'
// import m from './mutation-types'
import m from './mutation-types'

function updateNodeCache (state, nodes) {
  if (nodes !== undefined) {
    for (let node of nodes) {
      // The only thing affecting dimension now is Label
      if (state.nodeCache[node.id].label === node.label) {
        continue
      }
      state.nodeCache[node.id].dim = nodeSize.nodeDim(node)
    }
    return
  }
  // Rebuild Full cache
  state.nodeCache = {}
  for (let k in state.nodeData.nodes) {
    const node = state.nodeData.nodes[k]
    Vue.set(state.nodeCache, node.id, {
      idx: k,
      node: node,
      label: node.label, // cache label for dim
      dim: nodeSize.nodeDim(node)
    })
  }
}

export default {
  [m.SESSID_UPDATE] (state, sessId) {
    state.sessId = sessId
  },
  [m.REGISTRY_UPDATE] (state, registry) {
    state.registry = registry
  },
  [m.DOCUMENT_UPDATE] (state, nodeData) {
    // Wrong update any node independently and its cache
    // new ones will be added
    // sanitize data somehow
    nodeData.nodes = nodeData.nodes.filter(n => n !== null)

    state.nodeData = nodeData
    updateNodeCache(state) // Rebuild full
    for (let k in state.nodeSelection) {
      if (!state.nodeCache[k]) {
        Vue.delete(state.nodeSelection, k)
      }
    }
  },
  [m.ACTIVITY_UPDATE] (state, activity) {
    state.activity = activity
  },
  [m.NODE_RAISE] (state, nodes) {
    for (let k in nodes) {
      const sn = nodes[k]
      // Need to search by ID since its manipulating the list?
      let ni = state.nodeData.nodes.findIndex(n => n.id === sn.id)
      const node = state.nodeData.nodes[ni]
      state.nodeData.nodes.splice(ni, 1)
      state.nodeData.nodes.push(node) // put in last
    }
    updateNodeCache(state)
  },
  [m.NODE_UPDATE] (state, nodes) {
    // If array
    for (let k in nodes) {
      const node = nodes[k]
      const cached = state.nodeCache[node.id]
      if (cached === null) continue
      // Object.assign(state.nodeData.nodes[ni], node)
      Object.assign(cached.node, node)
      // Vue.set(state.nodeData.nodes, ni, node)
      if (node.id === state.nodeInspect.id) {
        // Update node inspect
        state.nodeInspect = node
      }
    }
    updateNodeCache(state, nodes)
  },
  [m.NODE_ADD] (state, nodes) {
    state.nodeData.nodes.push(...nodes)
    updateNodeCache(state)
  },
  [m.NODE_REMOVE] (state, nodes) {
    for (let k in nodes) {
      const node = nodes[k]
      // Need to search by ID since its manipulating the list
      const ni = state.nodeData.nodes.findIndex(n => n.id === node.id)
      state.nodeData.links = state.nodeData.links
        .filter(l => l.from !== node.id && l.to !== node.id)
      state.nodeData.triggers = state.nodeData.triggers
        .filter(t => t.from !== node.id && t.to !== node.id)
      state.nodeData.nodes.splice(ni, 1)
    }
    updateNodeCache(state)
  },
  [m.NODE_INSPECT] (state, nodeId) {
    const node = state.nodeData.nodes.find(n => n.id === nodeId)
    state.nodeInspect = node
  },
  [m.NODE_SELECTION_CLEAR] (state) {
    state.nodeSelection = {}
  },
  [m.NODE_SELECTION_REMOVE] (state, nodes) {
    for (let k in nodes) {
      const n = nodes[k]
      Vue.delete(state.nodeSelection, n.id)
    }
  },
  [m.NODE_SELECTION_SET] (state, nodes) {
    state.nodeSelection = {}
    for (let k in nodes) {
      const n = nodes[k]
      Vue.set(state.nodeSelection, n.id, n)
    }
  },
  [m.NODE_SELECTION_ADD] (state, nodes) {
    for (let k in nodes) {
      const n = nodes[k]
      Vue.set(state.nodeSelection, n.id, n)
    }
  },
  [m.LINK_ADD] (state, link) {
    state.nodeData.links.push(link)
  },
  [m.LINK_REMOVE] (state, link) {
    const i = state.nodeData.links.findIndex(l => l === link)
    if (i === -1) return
    state.nodeData.links.splice(i, 1)
  },

  [m.TRIGGER_ADD] (state, trigger) {
    state.nodeData.triggers.push(trigger)
  },
  [m.TRIGGER_REMOVE] (state, trigger) {
    const i = state.nodeData.triggers.findIndex(l => l === trigger)
    if (i === -1) return
    state.nodeData.triggers.splice(i, 1)
  },
  [m.NOTIFICATION_ADD] (state, msg) {
    state.notifications.push(msg)
  },
  [m.NOTIFICATION_CLEAR] (state, msg) {
    state.notifications = []
  }
}
