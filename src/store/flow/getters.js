export default {
  nodeCache: state => state.nodeCache,
  nodeData: state => state.nodeData,
  nodeById: state => id => state.nodeCache[id] && state.nodeCache[id].node,
  nodeCacheById: state => id => state.nodeCache[id],

  nodeDim: state => (node) => state.nodeCache[node.id].dim,
  nodeInputPos: state => (node, i) => {
    const inputs = state.registry[node.src].inputs || []
    const ndim = state.nodeCache[node.id].dim
    const d = ndim.height / (inputs.length * 2)
    return {
      x: ndim.x + 7,
      y: ndim.y + d + (i * 2 * d)
    }
  },
  nodeOutputPos: state => (node, i) => {
    const ndim = state.nodeCache[node.id].dim
    return {
      x: ndim.x + ndim.width - 7,
      y: 0
    }
  },

  registry: state => state.registry,
  activity: state => state.activity,

  /* nodeSelection: state => {
    return Object.keys(state.nodeSelection).map(k => state.nodeSelection[k])
  }, */
  nodeSelection: state => state.nodeSelection

}
