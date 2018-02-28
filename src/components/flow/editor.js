import {mapGetters, mapActions} from 'vuex'
import FlowNode from './node'
import FlowLink from './link'
import FlowTriggerLink from './link-trigger'
import FlowPanZoom from './panzoom'
import FlowModalData from './modal-data' // NEW 15/02/2018
import HxContextMenu from '@/components/shared/hx-contextmenu'
import SvgDefs from './svgdefswrapper'
import utils from '@/utils/utils'
import mat from '@/utils/mat'

const affIdentity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
export default {
  name: 'FlowManager',
  components: {FlowNode, FlowLink, FlowTriggerLink, FlowPanZoom, FlowModalData, HxContextMenu, SvgDefs},
  props: {
    'width': {type: String, default: '800px'},
    'height': {type: String, default: '600px'}
  },
  data () {
    return {
      // panzoom: { x: 0, y: 0, zoom: 1 },
      panzoomCTM: affIdentity,
      dragging: null,
      linking: false,
      triggerLinking: false,

      pointerLink: {active: false, from: null, to: null, pointer: null, src: {}},
      pointerTriggerLink: {active: false, from: null, to: null, pointer: null, src: {}},

      selector: null,
      stickySockets: false,
      stickyTriggers: false,
      nodeActivity: true
    }
  },
  computed: {
    ...mapGetters('flow', ['registry', 'activity', 'nodeData', 'nodeById', 'nodeSelection']),
    panzoomIdentity () {
      for (let i = 0; i < 16; i++) {
        if (this.panzoomCTM[i] !== affIdentity[i]) {
          return false
        }
      }
      return true
    },
    outputNode () {
      const n = this.nodeData.nodes.find(n => n.src === 'Output')
      return !!n
    },
    viewClasses () {
      return {
        'flow-linking': this.linking || this.stickySockets,
        'flow-triggers': this.triggerLinking || this.stickyTriggers,
        'activity': this.dragging || this.pointerLink.active,
        'flow-node--activity': this.nodeActivity,
        'selecting': !!this.selector
      }
    },
    matchHighlight () {
      let highlight = {}
      if (this.pointerLink) {
        if (this.pointerLink.active) {
          if (this.pointerLink.src.in !== undefined) {
            highlight = {type: 'socket-out', dtype: this.pointerLink.src.type}
          } else {
            highlight = {type: 'socket-in', dtype: this.pointerLink.src.type}
          }
        }
      }
      if (this.pointerTriggerLink) {
        if (this.pointerTriggerLink.active) {
          highlight = {type: (this.pointerTriggerLink.src.dir === 'in') ? 'trigger-in' : 'trigger-out'}
        }
      }
      return highlight
    },
    selectionCount () {
      return Object.keys(this.nodeSelection).length
    }
  },
  mounted () {
    document.addEventListener('keydown', this.keyDown)
    document.addEventListener('keyup', this.keyUp)
  },
  beoreDestroy () {
    document.removeEventListener('keydown', this.keyDown)
    document.removeEventListener('keyup', this.keyUp)
  },
  methods: {
    ...mapActions('flow', [
      'NOTIFICATION_ADD',
      'DOCUMENT_SYNC',
      'NODE_RAISE', 'NODE_UPDATE', 'NODE_ADD', 'NODE_REMOVE', 'NODE_INSPECT', 'NODE_PROCESS', 'NODE_TRAIN',
      'NODE_SELECTION_ADD', 'NODE_SELECTION_SET', 'NODE_SELECTION_REMOVE', 'NODE_SELECTION_CLEAR',
      'LINK_ADD', 'LINK_REMOVE',
      'TRIGGER_ADD', 'TRIGGER_REMOVE' ]),

    keyDown (ev) {
      if (document.activeElement && document.activeElement.matches('input,textarea')) { return }
      if (ev.shiftKey) {
        this.linking = true
        this.triggerLinking = true
      }

      let singleId = null
      if (Object.keys(this.nodeSelection).length === 1) { singleId = Object.keys(this.nodeSelection)[0] }
      switch (ev.key) {
        case 'Enter':
          if (!singleId) { return }
          this.nodeInspect(singleId, true)
          break
        case 'Delete':
          if (Object.keys(this.nodeSelection).length === 0) { return }
          this.NODE_REMOVE(this.nodeSelection)
          this.NODE_SELECTION_CLEAR()
          break
        case 'a':
          if (ev.ctrlKey) {
            ev.preventDefault()
            ev.stopPropagation()
            this.NODE_SELECTION_SET(this.nodeData.nodes)
          }
          break
      }
    },
    keyUp (ev) {
      if (!ev.shiftKey) {
        this.linking = false
        this.triggerLinking = false
      }
    },
    panzoomReset () {
      this.panzoomCTM = affIdentity
    },
    // XXX: Shrink this function
    // and create some LinkAdd method
    socketPointerDown (nodeId, ev, socket) {
      if (ev.button !== 0) return
      const node = this.nodeById(nodeId)
      const isInput = socket.in !== undefined

      const p = this.transformedPoint(ev.clientX, ev.clientY)
      this.pointerLink.pointer = p
      if (isInput) {
        this.pointerLink.from = null
        this.pointerLink.to = nodeId
        this.pointerLink.in = socket.in
      } else {
        this.pointerLink.from = nodeId
        this.pointerLink.to = null
      }
      if (isInput) {
        this.pointerLink.src = {nodeId: nodeId, type: this.registry[node.src].inputs[socket.in].type, in: socket.in}
      } else {
        this.pointerLink.src = {nodeId: nodeId, type: this.registry[node.src].output.type, out: 0}
      }

      utils.createDrag({
        dragStart: (ev) => {
          this.pointerLink.active = true
        },
        drag: (ev) => {
          const p = this.transformedPoint(ev.clientX, ev.clientY)
          this.pointerLink.pointer = p
        },
        drop: (ev) => {
          this.pointerLink.active = false
          if (ev.target.matches('.flow-pan-zoom__transformer')) {
            if (isInput) {
              console.error('LINK: Invalid target')
              return
            }

            const pt = this.transformedPoint(ev.x, ev.y)
            this.createPortal(nodeId, pt.x, pt.y)
            return
            // Create a thing here
            // if origin socket is an output only
            // Empty drop, try to create a portal here
          }

          // find Parent
          var curTarget = ev.target
          for (; curTarget.hasAttribute !== undefined && curTarget !== document.body; curTarget = curTarget.parentNode) {
            if (curTarget.hasAttribute('data-nodeid')) {
              break
            }
          }
          if (!curTarget.hasAttribute || curTarget === document.body) {
            console.error('LINK: target is not a socket')
            return
          }

          const targetNodeId = curTarget.getAttribute('data-nodeid')
          const targetIn = curTarget.getAttribute('data-in')
          const targetOut = curTarget.getAttribute('data-out')

          let link
          // target is input
          if (targetIn && !isInput) {
            link = {
              from: nodeId,
              to: targetNodeId,
              in: parseInt(targetIn)
            }
          } else if (targetOut && isInput) {
            link = {
              from: targetNodeId,
              to: nodeId,
              in: socket.in
            }
          }
          // No link
          if (!link) {
            console.error('LINK: input same direction (in->in/out->out)')
            return
          }
          const nodeFrom = this.nodeById(link.from)
          const nodeTo = this.nodeById(link.to)

          const output = this.registry[nodeFrom.src].output.type
          const input = this.registry[nodeTo.src].inputs[link.in].type
          // Type checking
          if (!(output === 'interface {}' || output === input || input === 'interface {}')) {
            console.error('LINK: Invalid type')
            return
          }

          // Input already exists, replace
          const existingInput = this.nodeData.links.find(l => l.to === link.to && l.in === link.in)
          if (existingInput) {
            // REMOVE LINK
            this.LINK_REMOVE(existingInput)
          }
          this.LINK_ADD(link)
        }})
    },
    triggerPointerDown (nodeId, ev, dir) {
      if (ev.button !== 0) return
      const isInput = (dir === 'in')

      if (isInput) {
        this.pointerTriggerLink.from = null
        this.pointerTriggerLink.to = nodeId
      } else {
        this.pointerTriggerLink.from = nodeId
        this.pointerTriggerLink.to = null
      }
      this.pointerTriggerLink.src = {nodeId: nodeId, dir: dir}
      this.pointerTriggerLink.pointer = this.transformedPoint(ev.clientX, ev.clientY)
      this.pointerTriggerLink.active = true

      utils.createDrag({
        drag: (ev) => {
          this.pointerTriggerLink.pointer = this.transformedPoint(ev.clientX, ev.clientY)
        },
        drop: (ev) => {
          this.pointerTriggerLink.active = false

          // find Parent
          var curTarget = ev.target
          for (; curTarget.hasAttribute !== undefined && curTarget !== document.body; curTarget = curTarget.parentNode) {
            if (curTarget.hasAttribute('data-nodeid')) {
              break
            }
          }
          if (!curTarget.hasAttribute || curTarget === document.body) {
            console.error('TRIGGER: target is not a socket')
            return
          }
          const targetNodeId = curTarget.getAttribute('data-nodeid')
          const targetDir = curTarget.getAttribute('data-dir')
          if (targetNodeId === nodeId) {
            console.error('TRIGGER: cannot link to self')
            return
          }
          let trigger
          // target is input
          if (targetDir === 'in') {
            trigger = {
              from: nodeId,
              to: targetNodeId
            }
          } else {
            trigger = {
              from: targetNodeId,
              to: nodeId
            }
          }
          this.TRIGGER_ADD(trigger)
        }
      })
    },
    nodeRemove (nodeId) {
      const node = this.nodeById(nodeId)
      this.NODE_REMOVE([node])
    },
    // Is this used?
    nodeInspect (nodeId, force) {
      this.$emit('nodeInspect', nodeId, force)
    },
    nodePointerDown (ev, nodeId) {
      document.activeElement && document.activeElement.blur()
      const tnode = this.nodeById(nodeId)
      // Confirm
      if (ev.button === 1) {
        this.NODE_REMOVE([tnode])
        return
      }
      if (ev.button !== 0) return // first button
      if (ev.shiftKey) {
        if (this.registry[tnode.src].output) {
          this.socketPointerDown(tnode.id, ev, {out: 0})
        }
        return
      }
      this.nodeInspect(tnode.id)
      let selectionToggle = false
      let prevSelection = Object.assign({}, this.nodeSelection)
      let wasSelected = !!this.nodeSelection[tnode.id]
      // Basically clear selection and selection the new one
      // if the clicked node isn't selected
      if (!wasSelected) {
        this.NODE_SELECTION_SET([tnode])
      }
      if (ev.ctrlKey) {
        selectionToggle = true
      }
      this.NODE_RAISE(this.nodeSelection)

      let curP = this.transformedPoint(ev.x, ev.y)
      let clone = false
      if (ev.ctrlKey && Object.keys(this.nodeSelection).length > 0) clone = true
      utils.createDrag({
        noDrag: (ev) => {
          if (selectionToggle) {
            if (wasSelected) {
              this.NODE_SELECTION_REMOVE([tnode])
            } else {
              prevSelection[tnode.id] = tnode
              this.NODE_SELECTION_SET(prevSelection)
            }
            return
          }
          this.NODE_SELECTION_SET([tnode])
        },

        drag: (ev) => {
          if (!ev.ctrlKey) clone = false
          /// /////////// IMPORTANT NEW ////////////////
          // logic: we analyse selection, create new nodes based on same src
          // with same things, and checkout the inner links, nodes between our nodes
          // if all ok we link the new nodes aswell
          // XXX: add a sub function for this, cloneSelection

          if (clone && this.nodeSelection) {
            clone = false
            const nodeMap = {}
            const newNodes = []
            for (let k in this.nodeSelection) {
              const n = this.nodeById(k)
              if (n.src === 'Output') { // Do not clone output
                this.NOTIFICATION_ADD('cannot clone \'Output\' node')
                return
              }
              const newNode = JSON.parse(JSON.stringify(n))
              newNode.id = utils.guid()
              nodeMap[n.id] = newNode.id
              newNodes.push(newNode)
            }
            this.NODE_ADD(newNodes)
            // Clone links if inside the selection
            for (let k in this.nodeSelection) {
              const links = this.nodeData.links.filter(l => l.from === k)
              for (let l of links) {
                if (this.nodeSelection[l.to]) { // Link is inside
                  const link = {
                    from: nodeMap[k],
                    to: nodeMap[l.to],
                    in: l.in
                  }
                  this.LINK_ADD(link)
                }
              }
              // Trigger too
              const triggers = this.nodeData.triggers.filter(t => t.from === k)
              for (let t of triggers) {
                if (this.nodeSelection[t.to]) {
                  const trigger = {
                    from: nodeMap[k],
                    to: nodeMap[t.to]
                  }
                  this.TRIGGER_ADD(trigger)
                }
              }
            }
            // Check inner links
            this.NODE_SELECTION_SET(newNodes)
          }
          // DRAG operation
          this.dragging = this.nodeSelection
          const dragP = this.transformedPoint(ev.x, ev.y)
          const nodeUpdate = []
          for (let k in this.nodeSelection) {
            const n = this.nodeById(k)
            const cloneNode = {
              ...n,
              x: n.x + dragP.x - curP.x,
              y: n.y + dragP.y - curP.y
            }

            nodeUpdate.push(cloneNode)
          }
          this.NODE_UPDATE(nodeUpdate)
          curP = dragP
        },
        drop: (ev) => {
          this.dragging = null
          // snap?
          // Snapping
          const dragP = this.transformedPoint(ev.x, ev.y)
          const nodeUpdate = []
          for (let k in this.nodeSelection) {
            const n = this.nodeById(k)
            // create new nodes
            const cloneNode = {
              ...n,
              x: n.x + dragP.x - curP.x,
              y: n.y + dragP.y - curP.y
              // snapping
              // x: Math.round((n.x + dragP.x - curP.x) / 10) * 10,
              // y: Math.round((n.y + dragP.y - curP.y) / 10) * 10
            }

            nodeUpdate.push(cloneNode)
          }
          // Updating nodes
          this.NODE_UPDATE(nodeUpdate)
          this.DOCUMENT_SYNC()
        }
      })
    },

    /// ////////////
    // NODE CREATOR FUNC
    //
    // STORE
    nodeAdd (src, x = 100, y = 100) {
      if (src === 'Output') {
        const n = this.nodeData.nodes.find(n => n.src === src)
        if (n) {
          this.NOTIFICATION_ADD('Output node already exists')
          return
        }
      }
      const newNode = {
        id: utils.guid(),
        x: x,
        y: y,
        defaultInputs: {},
        label: src,
        color: this.registry[src].style && this.registry[src].style.color, /* NEW 12/02/2018 */
        src: src
      }
      // Setup Props
      if (this.registry[src].props) {
        for (let k in this.registry[src].props) {
          newNode.prop || (newNode.prop = {})
          newNode.prop[k] = ''
        }
      }
      this.NODE_ADD([newNode])
    },
    nodeProcess (nodeId) {
      // const n = this.nodeById(nodeId)
      this.nodeInspect(nodeId, true)
      this.NODE_PROCESS([nodeId])
      // this.NODE_SELECTION_SET([n])
      // this.nodeSelectionProcess()
    },
    nodeSelectionProcess () {
      this.NODE_PROCESS(Object.keys(this.nodeSelection))
    },
    managerDrop (ev) {
      ev.preventDefault()
      const reg = ev.dataTransfer.getData('text')
      if (this.registry[reg] === undefined) {
        console.error('Registry: Drop src not found in registry')
        return
      }
      const pt = this.transformedPoint(ev.x, ev.y)
      this.nodeAdd(reg, pt.x, pt.y)
    },
    viewPointerDown (ev) {
      if (ev.button !== 0) return
      var svgElRect = this.$refs.svg.getBoundingClientRect()
      ev.preventDefault()
      const p = {x: ev.x - svgElRect.left, y: ev.y - svgElRect.top}// this.transformedPoint(ev.x, ev.y)
      this.selector = {x: p.x, y: p.y, width: 0, height: 0}
      utils.createDrag({
        drag: (evd) => {
          // transform again in case we changed zoom/pan
          // const p = {x: ev.x, y: ev.y} // this.transformedPoint(ev.x, ev.y)
          const p2 = {x: evd.x - svgElRect.left, y: evd.y - svgElRect.top} // this.transformedPoint(evd.x, evd.y)
          const nwidth = p2.x - p.x
          const nheight = p2.y - p.y
          this.selector = {
            x: nwidth < 0 ? p2.x : p.x,
            y: nheight < 0 ? p2.y : p.y,
            width: nwidth < 0 ? -nwidth : nwidth,
            height: nheight < 0 ? -nheight : nheight
          }
        },
        drop: (ev) => {
          let selectionAdd = false
          if (ev.shiftKey) selectionAdd = true
          const nodesToSelect = []
          for (let n in this.nodeData.nodes) {
            const node = this.nodeData.nodes[n]
            // Transform backNodes
            var nodeP = [node.x, node.y, 0]
            nodeP = mat.multiplyPoint(this.panzoomCTM, nodeP)

            if (nodeP[0] > this.selector.x && nodeP[0] < (this.selector.x + this.selector.width) &&
              nodeP[1] > this.selector.y && nodeP[1] < (this.selector.y + this.selector.height)
            ) {
              nodesToSelect.push(node)
              // Add to selection
            }
          }
          if (selectionAdd) {
            this.NODE_SELECTION_ADD(nodesToSelect)
          } else {
            this.NODE_SELECTION_SET(nodesToSelect)
          }
          this.selector = null
        },
        noDrag: (ev) => {
          if (!ev.shiftKey) this.NODE_SELECTION_CLEAR()
        }
      })
    },
    documentProcess () {
      const n = this.nodeData.nodes.find(n => n.src === 'Output')
      this.nodeProcess(n.id)
    },
    createPortal (nodeID, x, y) {
      // Find nodeID
      let node = this.nodeData.nodes.find(n => n.id === nodeID)
      if (!node) {
        this.NOTIFICATION_ADD('invalid node ID' + nodeID)
        return
      }
      // If nodeID is a portal we recurse back
      if (node.src === 'Portal From') {
        const nodefromId = node.prop['portal from']
        this.createPortal(nodefromId, x, y)
        return
      }
      x = x || node.x + 10
      y = y || node.y + 10
      // Special node
      const portalNode = {
        id: utils.guid(),
        x: x,
        y: y, // Downthere/improve this
        defaultInputs: {},
        label: node.label,
        color: node.color,
        prop: {'portal from': nodeID},
        src: 'Portal From'
      }

      this.NODE_ADD([portalNode])
    },

    /* select (nodes, add) {
      if (!nodes) {
        this.NODE_SELECTION_CLEAR()
        return
      }
      if (!add) {
        this.NODE_SELECTION_CLEAR()
      }
      if (nodes) {
        this.NODE_SELECTION_ADD(nodes)
      }
    }, */
    // HELPERS depending on svg ref
    createSVGPoint (x, y) {
      const p = this.$refs.svg.createSVGPoint()
      p.x = x; p.y = y
      return p
    },
    transformedPoint (x, y, abs) {
      const svgRect = this.$refs.svg.getBoundingClientRect()
      if (!abs) {
        x -= svgRect.left
        y -= svgRect.top
      }
      return this.$refs.panzoom.transformedPoint(this.createSVGPoint(x, y))
    }
  }
}
