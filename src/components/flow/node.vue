<template>
  <g
    class="flow-node"
    :class="{
      'flow-node--dragging':dragging && dragging[node.id],
      'flow-node--selected': !!nodeSelection[node.id]
    }"
    :status="status"
    :transform="nodePos"
    @mousedown.stop.prevent="nodePointerDown"
    @contextmenu.capture.prevent="nodeRightClick"
    @dblclick="nodeDoubleClick"
  >

    <!-- shape -->
    <template>
      <g v-if="style.shape == 'portal'" >
        <svg
          ref="body"
          viewBox="0 0 100 100"
          class="flow-node__body"
          v-bind="bodyProps"
          preserveAspectRatio="none"
        >
          <path d=" M 50 0 L 100 50 L 50 100 L 0 50 Z"/>
        </svg>
      </g>
      <g v-else-if="style.shape == 'circle'">
        <circle
          ref="body"
          class="flow-node__body"
          v-bind="bodyProps"
        />
      </g>
      <g v-else>
        <rect
          ref="body"
          class="flow-node__body"
          v-bind="bodyProps"
        />
      </g>
    </template>
    <!-- selection square -->
    <rect
      class="flow-node__selection"
      :x="bodyProps.x-6"
      :y="bodyProps.y-6"
      :width="bodyProps.width+12"
      :height="bodyProps.height+12"
    />

    <!-- label -->
    <text
      ref="label"
      class="flow-node__label"
      v-bind="labelProps"
      text-anchor="middle"
      dominant-baseline="middle">
      <tspan
        :key="'label-wrap' + i"
        x="0"
        dy="1em"
        v-for="(s,i) in labelWrap" >
        {{ s }}
      </tspan>
    </text>

    <!-- Sockets -->
    <!-- input -->
    <g
      v-for="(inp,i) in inputs"
      :key="'in'+i"
      :data-nodeid="node.id"
      :data-in="i"
      v-bind="inputProps[i]"
      @mousedown.stop.prevent="socketPointerDown($event, {in:i})"
      class="flow-node__socket flow-node__socket--inputs"
    >
      <circle r="5" />
      <rect
        v-bind="inputLabelBGProps(i)"
        class="flow-node__socket-detail--background"
      />
      <text
        ref="inputLabel"
        text-anchor="end"
        :x="-14"
        :y="4"
        class="flow-node__socket-detail"
      >{{ inputLabel[i] }}</text>

    </g>
    <!-- output -->
    <g
      v-if="output"
      v-bind="outputProps(0)"
      :data-nodeid="node.id"
      :data-out="0"
      :key="'out'+0"
      @mousedown.stop.prevent="socketPointerDown($event, {out:0})"
      class="flow-node__socket flow-node__socket--outputs"
    >
      <circle r="5" />
      <rect
        v-bind="outputLabelBGProps(0)"
        class="flow-node__socket-detail--background"
      />
      <text
        ref="outputLabel"
        class="flow-node__socket-detail"
        :x="14"
        :y="4">
        {{ outputLabel(0) }}
      </text>
    </g>

    <!-- TRIGGER SOCKETS -->
    <rect
      class="flow-node__trigger flow-node__socket--trigger"
      :class="{'flow-node__trigger--match': match.type == 'trigger-out'}"
      :data-nodeid="node.id"
      data-dir="in"
      :x="-5"
      :y="-bodyProps.height/2-2"
      width="10"
      height="10"
      @mousedown.stop.prevent="triggerPointerDown($event, 'in')"
    />
    <rect
      class="flow-node__trigger flow-node__socket--trigger"
      :class="{'flow-node__trigger--match': match.type == 'trigger-in'}"
      :data-nodeid="node.id"
      data-dir="out"
      :x="-5"
      :y="bodyProps.height/2 -7"
      width="10"
      height="10"
      @mousedown.stop.prevent="triggerPointerDown($event, 'out')"
    />
    <text
      class="flow-node__src-detail"
      x="0"
      :y="-bodyProps.height/2 - 6"
      text-anchor="middle">
      {{ node.src }}
    </text>

    <flow-node-activity
      @activityPointerDown="activityPointerDown"
      v-if="nodeActivity"
      :node-id="node.id"
      :transform="'translate('+bodyProps.width/2 +','+ -bodyProps.height/2 +')'"/>
  </g>
</template>

<script>
import {mapGetters} from 'vuex'
import FlowNodeActivity from './node-activity'
import utils from '@/utils/utils'
import nodeSize from './node-size'

export default {
  name: 'FlowNode',
  components: {FlowNodeActivity},
  props: {
    'node': {type: Object, required: true},
    'match': {type: Object, default: () => {}},
    'pointerLink': {type: Object, default: null},
    'pointerTriggerLink': {type: Object, default: null},
    'dragging': {type: Object, default: null}
  },
  computed: {
    ...mapGetters('flow', ['nodeCache', 'nodeData', 'registry', 'activity', 'nodeById', 'nodeSelection', 'nodeInputPos', 'nodeOutputPos']),

    nodePos () {
      return `translate(${this.node.x}, ${this.node.y})`
    },
    nodeDim () {
      return this.nodeCache[this.node.id].dim
    },
    inputs () {
      return this.registry[this.node.src].inputs || []
    },
    output () {
      return this.registry[this.node.src].output
    },
    nodeActivity () {
      return this.activity && this.activity.nodes && this.activity.nodes[this.node.id]
    },
    color () {
      const ret = this.node.color ||
        (this.registry[this.node.src].style && this.registry[this.node.src].style.color)
      return ret
    },
    style () {
      return this.registry[this.node.src].style || {}
    },

    status () {
      return this.nodeActivity && (this.nodeActivity.status || '')
    },
    labelWrap () {
      let wrapThreshold = 8 // initial wrap threshold
      const opt = nodeSize.shapeOpts[this.style.shape] || nodeSize.shapeOpts.default
      return utils.textWrap(this.node.label, wrapThreshold, opt.textWrap)
    },
    labelProps () {
      const ldim = nodeSize.labelDim(this.node)
      return {
        x: 0,
        y: 0,
        fill: this.textColor,
        transform: `translate(0,${-ldim.height / 2 - 5})`
      }
    },
    bodyProps () {
      const nodeDim = this.nodeDim
      const rect = {
        x: -nodeDim.width / 2,
        y: -nodeDim.height / 2,
        width: nodeDim.width,
        height: nodeDim.height,
        stroke: this.color || '#777',
        fill: this.color || '#777'
      }
      if (this.style.shape === 'circle') {
        rect.r = Math.max(nodeDim.width / 2, nodeDim.height / 2)
      }
      return rect
    },
    inputProps () {
      const ret = []
      for (var i in this.inputs) {
        // console.log('Recalc input props')
        // console.log('Rebuild input WHY')

        let defaultInput = this.node.defaultInputs[i]

        const inp = this.inputs[i]
        const match = this.match.type === 'socket-in' && (inp.type === this.match.dtype || this.match.dtype === 'interface {}' || inp.type === 'interface {}')

        const {x, y} = this.nodeInputPos(this.node, i)
        ret.push({
          class: {
            'flow-node__socket--match': match,
            'flow-node__socket--withvalue': !!defaultInput
          },
          transform: `translate(${x} ${y})`
        })
      }
      return ret

      /* return (i) => {
        let defaultInput = this.node.defaultInputs[i]

        const inp = this.inputs[i]
        const match = this.match.type === 'socket-in' && (inp.type === this.match.dtype || this.match.dtype === 'interface {}' || inp.type === 'interface {}')

        const {x, y} = this.inputPos(i)
        return {
          class: {
            'flow-node__socket--match': match,
            'flow-node__socket--withvalue': !!defaultInput
          },
          transform: `translate(${x} ${y})`
        }
      } */
    },
    outputProps () {
      return (i) => {
        const {x, y} = this.nodeOutputPos(this.node, i)
        const outp = this.output
        const match = this.match.type === 'socket-out' && (outp.type === this.match.dtype || this.match.dtype === 'interface {}' || outp.type === 'interface {}')
        return {
          transform: `translate(${x} ${y})`,
          class: {
            'flow-node__socket--match': match
          }
        }
      }
    },
    inputLabel () {
      const ret = []
      for (var i in this.inputs) {
        let input = ''
        if (this.inputs[i].name) {
          input += this.inputs[i].name + ':'
        }
        input += this.inputs[i].type
        ret.push(input)
      }
      return ret
    },
    defInput () {
      return (i) => {
      }
    },
    outputLabel () {
      return (i) => {
        var output = ''
        if (this.output.name) {
          output += this.output.name + ':'
        }
        output += this.output.type

        return output
      }
    },
    // Backgrounds
    inputLabelBGProps () {
      return (i) => {
        if (!this.$refs.inputLabel) {
          this.$nextTick(this.$forceUpdate)
          return
        // {x: 0, y: 0, width: 0, height: 0}
        }
        let bbox = this.$refs.inputLabel[i].getBBox()
        return {x: bbox.x - 5, y: bbox.y - 2, width: bbox.width + 10, height: bbox.height + 4}
      }
    },
    outputLabelBGProps () {
      return (i) => {
        if (!this.$refs.outputLabel) {
          this.$nextTick(this.$forceUpdate)
          return
        }

        let bbox = this.$refs.outputLabel.getBBox()
        return {x: bbox.x - 5, y: bbox.y - 2, width: bbox.width + 10, height: bbox.height + 4}
      }
    }
  },
  methods: {
    nodePointerDown (ev) {
      this.$emit('nodePointerDown', ev)
    },
    nodeRightClick (ev) {
      this.$emit('nodeRightClick', ev)
    },
    nodeDoubleClick (ev) {
      this.$emit('nodeDoubleClick', ev)
    },
    socketPointerDown (ev, socket) {
      this.$emit('socketPointerDown', ev, socket)
    },
    triggerPointerDown (ev, dir) {
      this.$emit('triggerPointerDown', ev, dir)
    },
    activityPointerDown (ev) {
      this.$emit('activityPointerDown', ev)
    }

  }
}
</script>
<style>

.flow-view:not(.activity) .flow-node:hover,
.flow-node--dragging {
  cursor:move;
}

.flow-view:not(.activity) .flow-node {
  transition: all var(--transition-speed);
}

.flow-node__body {
  opacity:0.9;
  transition: all var(--transition-speed);
}

.flow-node[status=running] .flow-node__body{
  stroke: yellow !important;
}

.flow-node[status=error] .flow-node__body{
  stroke: red !important;
}

.flow-node[status=finished] .flow-node__body{
  stroke: green !important;
}

/* opacity with the sockets */
.flow-node__src-detail {
  pointer-events:none;
  user-select:none;
  font-size:15px;
  opacity:0;
  fill: var(--normal);
  transition: all var(--transition-speed);
}

.flow-linking .flow-node__src-detail {
  opacity:1;
}

/* sockets */
.flow-node__socket {
  pointer-events: none;
  stroke-width:1;
  opacity:0;
  transition: all var(--transition-speed);
}

.flow-view:not(.activity) .flow-node__socket:hover {
  stroke-width:10;
  cursor:pointer;
}

.flow-node__socket-detail {
  opacity:1;
  stroke-width:0 !important;
  fill: #fff !default;
  transition: all var(--transition-speed);
}

.flow-node__socket-detail--background {
  stroke-width:0;

  /*transition: all var(--transition-speed);*/
}

.flow-node__socket--match {
  cursor:pointer;
  stroke-width:10;
}

.flow-node__socket--withvalue {
  fill: var(--node-socket--withvalue) !important;
  stroke: var(--node-socket-withvalue) !important;
}

.flow-linking .flow-node__socket {
  opacity:1;
  pointer-events: inherit;
}

.flow-node__socket--match {
  opacity:1;
  pointer-events: inherit;
}

/* triggers */
.flow-node__trigger {
  pointer-events:none;
  opacity:0;
  transition: all var(--transition-speed);
}

.flow-triggers .flow-node__trigger {
  pointer-events:inherit;
  opacity:1;
}

.flow-view:not(.activity) .flow-node__trigger:hover {
  stroke-width:10;
  cursor:pointer;
}

.flow-node__trigger--match {
  stroke-width:10;
  opacity:1;
  pointer-events: inherit;
}

/*
Override flow-node
for hidden
 */

.flow-node__label {
  stroke:none;
  pointer-events:none;
  user-select:none;
  fill:#333 !default;
}

.flow-node__selection {
  opacity:0;
  stroke-width:3;
  stroke: var(--node-selection);
  stroke-dasharray:2,2;
  pointer-events:none;
  fill: var(--node-selection);
  transition: all var(--transition-speed);
}

.flow-node--selected .flow-node__selection {
  opacity:0.6;
  animation: flow-node--selected__dash 3s linear infinite;
}

@keyframes flow-node--selected__dash {
  from { stroke-dashoffset:100;}
  to { stroke-dashoffset: 0; }
}

</style>
