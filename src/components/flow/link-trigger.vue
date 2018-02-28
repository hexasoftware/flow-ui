<template>
  <g
    class="flow-trigger-link"
    :class="{'flow-trigger-link--pointer':trigger.pointer}"
    @mousedown="$emit('mousedown',$event)">
    <path
      class="flow-trigger-link__area"
      :d="path"
    />
    <path
      class="flow-trigger-link__visible"
      :d="path"
    />
    <text
      class="flow-trigger-link__label"
      v-if="label"
      :x="5+fromPos.x+(toPos.x-fromPos.x)/2"
      :y="fromPos.y+(toPos.y-fromPos.y)/2"
    >
      on: {{ label }}
    </text>
  </g>
</template>
<script>
import {mapGetters} from 'vuex'
import nodeSize from './node-size'

export default {
  name: 'FlowTriggerLink',
  props: {
    trigger: {type: Object, required: true},
    label: {type: String, default: null}
  },
  computed: {
    ...mapGetters('flow', ['nodeById']),
    fromPos () {
      if (this.trigger.from === null) {
        return {
          x: this.trigger.pointer.x,
          y: this.trigger.pointer.y
        }
      }
      const node = this.nodeById(this.trigger.from)
      const nodeDim = nodeSize.nodeDim(node)

      return {
        x: node.x,
        y: node.y + (nodeDim.height / 2)
      }
    },
    toPos () {
      if (this.trigger.to === null) {
        return {
          x: this.trigger.pointer.x,
          y: this.trigger.pointer.y - 6
        }
      }

      const node = this.nodeById(this.trigger.to)
      const nodeDim = nodeSize.nodeDim(node)
      return {
        x: node.x,
        y: node.y + (-nodeDim.height / 2) - 12

      }
    },
    path () {
      let {x: x1, y: y1} = this.fromPos
      let {x: x2, y: y2} = this.toPos

      let ox1, oy1, ox2, oy2
      ox1 = 0
      oy1 = 50
      ox2 = 0
      oy2 = -50
      return `
      M${x1},${y1} 
      C${x1 + ox1},${y1 + oy1} 
      ${x2 + ox2},${y2 + oy2} 
      ${x2},${y2 - 1}
      L${x2} ${y2}
      `
    }
  }
}
</script>
<style>
.flow-trigger-link {
  user-select:none;
}

.flow-view:not(.activity) .flow-trigger-link {
  cursor:pointer;
}

.flow-trigger-link__head{
  fill:#333;
}

.flow-trigger-link {
  stroke:#333;
}

.flow-view:not(.activity)
.flow-trigger-link *{
  transition: all var(--transition-speed-fast);
}

.flow-trigger-link__area {
  stroke-width:20;
  stroke: transparent;
  fill: transparent;
}

.flow-trigger-link__visible{
  stroke-dasharray: 10,4;
  stroke-width:2;
  fill: transparent;
  marker-end:url(#head);
}

.flow-trigger-link--pointer {
  pointer-events:none;
}

.flow-trigger-link__label {
  font-size:10px;
  fill: #777;
  stroke:none;
}

</style>
