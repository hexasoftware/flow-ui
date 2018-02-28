<template>
  <g
    class="flow-link"
    :class="{'flow-link--pointer':link.pointer}"
    :status="status"
    @mousedown="$emit('mousedown',$event)">
    <path
      class="flow-link__area"
      :d="path" />
    <path
      class="flow-link__visible"
      :d="path" />
    <path
      v-if="status"
      class="flow-link__status"
      :d="path" />
  </g>
</template>
<script>
import {mapGetters, mapActions} from 'vuex'

const zeroPos = {x: 0, y: 0}
const curve = 100
export default {
  name: 'FlowLink',
  props: {
    link: {type: Object, default: null}
  },
  // we decide our status
  computed: {
    ...mapGetters('flow', ['nodeById', 'activity', 'nodeData', 'nodeInputPos', 'nodeOutputPos']),
    status () {
      if (!this.activity) { return }

      const act = this.activity.nodes[this.link.from]
      if (!act) { return }
      return act.status
    },
    fromPos () {
      if (this.link.from === null) {
        return {
          x: this.link.pointer.x,
          y: this.link.pointer.y
        }
      }
      const nodeFrom = this.nodeById(this.link.from)
      if (!this.link.from || !nodeFrom) {
        console.log('Unexpected BROKEN LINK', this.link)
        this.LINK_REMOVE(this.link)
        return zeroPos
      }
      const fromOutput = this.nodeOutputPos(nodeFrom, 0)
      return {
        x: nodeFrom.x + fromOutput.x + 7,
        y: nodeFrom.y + fromOutput.y
      }
    },
    toPos () {
      if (this.link.to === null) {
        return {
          x: this.link.pointer.x - 7.5,
          y: this.link.pointer.y
        }
      }
      const nodeTo = this.nodeById(this.link.to)
      if (!this.link.to === undefined || !nodeTo) {
        console.log('Unexpected BROKEN LINK', this.link)
        this.LINK_REMOVE(this.link)
        return zeroPos
      }
      const toInput = this.nodeInputPos(nodeTo, this.link.in)
      return {
        x: nodeTo.x + toInput.x - 19.5,
        y: nodeTo.y + toInput.y
      }
    },
    path () {
      let {x: x1, y: y1} = this.fromPos
      let {x: x2, y: y2} = this.toPos

      // const x1 = this.x1 + 7
      // const y1 = this.y1

      // const x2 = this.x2 - (this.pointer ? 7.5 : 19.5)
      // const y2 = this.y2

      const dx = x2 - x1
      const dy = y2 - y1

      let s = curve
      let lineDist = 200
      let dist = Math.sqrt(dx * dx + dy * dy)

      // Reduce curve with distance
      if (dist < lineDist) {
        s = Math.max(curve - (lineDist - dist), 0)
      }
      s = Math.min(s, Math.min(dx, 100))

      let ox1 = s
      let oy1 = 0

      let ox2 = -s
      let oy2 = 0

      if (dx < 0) {
        const mx = Math.min(-dx, 100)
        const mx2 = Math.min(-dx, 150)
        ox1 = mx
        ox2 = -mx
        oy1 = mx2
        oy2 = -mx2
        if (dy < 0) {
          oy1 = -oy1
          oy2 = -oy2
        }
      }
      ox1 += 20
      ox2 -= 20
      return `
      M${x1},${y1} 
      C${x1 + ox1},${y1 + oy1} 
      ${x2 + ox2},${y2 + oy2} 
      ${x2 - 1},${y2}
      L${x2} ${y2}
      `
    }
  },
  methods: {
    ...mapActions('flow', ['LINK_REMOVE'])
  }
}
</script>
<style>
.flow-view:not(.activity) .flow-link {
  cursor:pointer;
}

.flow-link__head{
  fill:#333;
}

.flow-link {
  stroke:#333;
}

.flow-view:not(.activity)
.flow-link *{
  transition: all var(--transition-speed);
}

.flow-link__area {
  stroke-width:20;
  stroke: transparent;
  fill: transparent;
}

.flow-link__visible{
  stroke-width:2;
  fill: transparent;
  marker-end:url(#head);
}

.flow-link--pointer {
  pointer-events:none;
}

.flow-link__status {
  opacity:1;
  stroke-width:4;
}

.flow-link[status=waiting] .flow-link__status {
  stroke-dasharray:8;
  stroke: grey;
  animation: dash 10s linear infinite;
}

.flow-link[status=running] .flow-link__status {
  stroke-dasharray:4,10;
  stroke: #aa2;
  animation: dash 1s linear infinite;
}

.flow-link[status=finish] .flow-link__status {
  stroke: green;
}

.flow-link[status=error] .flow-link__status {
  stroke: red;
}

@keyframes dash {
  from { stroke-dashoffset:100;}
  to { stroke-dashoffset: 0; }
}
</style>
