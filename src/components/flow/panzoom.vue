<template>
  <g>
    <!--<rect
      class="flow-pan-zoom__grid"
      width="100%"
      height="100%"
      fill="url(#grid)"
      />-->
    <rect
      ref="transformer"
      class="flow-pan-zoom__transformer"
      width="100%"
      height="100%"
      @mousedown="dragStart"/>
    <g
      class="flow-pan-zoom__transformed"
      ref="transform"
      v-bind="transformProps">
      <slot/>
    </g>
  </g>

</template>
<script>
import utils from '@/utils/utils'
import matrix from '@/utils/mat'

export default {
  name: 'FlowPanZoom',
  props: {
    value: {type: Array, default: matrix.identity}
  },
  data () {
    return {
      transform: matrix.identity(),
      zoom: this.value.zoom,
      x: this.value.x,
      y: this.value.y,
      moving: false
    }
  },
  computed: {
    transformProps () {
      const transString = 'matrix3d(' + this.transform.join(',') + ')'
      /* const transString = 'matrix(' + [
        this.zoom, 0,
        0, this.zoom,
        this.x, this.y
      ].join(',') + ')' */

      return {
        style: 'transform: ' + transString + ';'
        // transform: transString
      }
    }
  },

  watch: {
    value: {
      handler (val) {
        this.transform = val
        /* this.zoom = this.value.zoom
        this.x = this.value.x
        this.y = this.value.y */
      }
    }
  },
  mounted () {
    this.$el.addEventListener('wheel', this.wheel)
  },
  beforeDestroy () {
    this.$el.removeEventListener('wheel', this.wheel)
  },
  methods: {
    // panStart
    dragStart (ev) {
      document.activeElement && document.activeElement.blur()
      if (!(ev.button === 1 || (ev.button === 0 && ev.ctrlKey))) return // first button
      if (ev.target !== this.$refs.transformer) return
      ev.stopPropagation()

      let mouseP = [ev.x, ev.y, 0]
      let offsetP = matrix.multiplyPoint(matrix.inverse(this.transform), mouseP)

      utils.createDrag({
        drag: (ev) => {
          this.moving = true
          let mouseP = [ev.x, ev.y, 0]
          const curP = matrix.multiplyPoint(matrix.inverse(this.transform), mouseP)
          const delta = [curP[0] - offsetP[0], curP[1] - offsetP[1]]
          const trans = matrix.translate(delta[0], delta[1])
          this.update(matrix.multiply(this.transform, trans))
        },
        drop: (ev) => {
          this.moving = false
        }
      })
    },
    wheel (ev) {
      ev.preventDefault()
      const elRect = this.$refs.transformer.getBoundingClientRect()

      let mElPos = [ev.x - elRect.left, ev.y - elRect.top, 0]
      let mPos = matrix.multiplyPoint(matrix.inverse(this.transform), mElPos)
      let mat = matrix.multiply(
        this.transform,
        matrix.translate(mPos[0], mPos[1])
      )
      // Try rotation
      if (ev.ctrlKey) {
        const rotStep = ev.shiftKey ? 8 : 4
        const rot = ev.deltaY > 0 ? rotStep : -rotStep
        mat = matrix.multiply(mat, matrix.rotate(rot))
      } else {
        const scaleStep = ev.shiftKey ? 0.8 : 0.9
        let scale = ev.deltaY > 0 ? scaleStep : 1 / scaleStep
        mat = matrix.multiply(mat, matrix.scale(scale))
      }

      mat = matrix.multiply(mat, matrix.translate(-mPos[0], -mPos[1]))

      this.update(mat)
      // this.$emit('input', {x: this.transform[12], y: this.transform[13], zoom: this.zoom})

      /*
      ev.preventDefault()
      let deltaY = (ev.deltaY > 0) ? 1 : -1
      deltaY *= (ev.shiftKey) ? 0.3 : 0.07
      const elRect = this.$refs.transformer.getBoundingClientRect()
      const oX = ev.clientX - elRect.left
      const oY = ev.clientY - elRect.top
      const z = Math.max(this.zoom - (deltaY * this.zoom), 0.1)

      var curX = this.x
      var curY = this.y
      var scaleD = z / this.zoom // delta

      var nx = scaleD * (curX - oX) + oX
      var ny = scaleD * (curY - oY) + oY

      this.update(nx, ny, z)
      */
    },
    update (transform) {
      this.transform = transform

      this.$emit('input', transform)
    },
    transformedPoint (point) {
      const p = [point.x, point.y, 0]
      const newP = matrix.multiplyPoint(matrix.inverse(this.transform), p)
      return {
        x: newP[0],
        y: newP[1]
      }
      // const ctm = this.$refs.transform.getCTM()
      // return point.matrixTransform(ctm.inverse())
    }
  }
}

</script>

<style>
.flow-pan-zoom__transformer {
  fill:transparent;
}

.flow-pan-zoom__transformed {
  /*transition: transform 0.45s ease;*/
}

.flow-pan-zoom__grid {
  fill:transparent;
  pointer-events:none;
}

</style>
