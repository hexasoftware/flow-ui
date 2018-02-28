<script>
export default {
  name: 'HxSplit',
  props: {
    resizeable: {type: Boolean, default: false},
    dir: {type: String, default: 'horizontal'},
    split: {type: String, default: '50%'}
  },
  data () {
    return {
      state: {
        resizing: false,
        split: this.split || '50%'
      }
    }
  },
  computed: {
    splitClass () {
      return [
        'split',
        this.dir,
        this.state.resizing ? 'resizing' : '',
        this.resizeable ? 'resizeable' : ''
      ]
    }
  },
  watch: {
    split () {
      this.state.split = this.split
    }
  },

  methods: {
    startResize (ev) {
      if (!this.resizeable || ev.button !== 0) return
      ev.stopPropagation()
      ev.preventDefault()
      this.state.resizing = true
      // Grab delta
      const parentRect = this.$el.getBoundingClientRect()
      const splitRect = this.$refs.splitter.getBoundingClientRect()
      const delta = { x: ev.x - splitRect.left, y: ev.y - splitRect.top }

      const drag = (ev) => {
        if (ev.button !== 0) return
        const h = this.dir === 'horizontal'
        var splitter = (h ? this.$el.children[1].clientWidth : this.$el.children[1].clientHeight) / 2
        var splitSize = h
          ? ((ev.x - delta.x) - parentRect.left - splitter) / this.$el.clientWidth * 100
          : ((ev.y - delta.y) - parentRect.top - splitter) / this.$el.clientHeight * 100

        splitSize = Math.max(splitSize, 0)
        this.state.split = splitSize + '%'
        this.$emit('onSplitResize', ev, this.state.split)
      }
      const drop = (ev) => {
        if (ev.button !== 0) return
        this.state.resizing = false
        document.removeEventListener('mousemove', drag)
        document.removeEventListener('mouseup', drop)
      }
      document.addEventListener('mousemove', drag)
      document.addEventListener('mouseup', drop)
    }

  },
  render (h) {
    const children = this.$slots.default.filter(n => n.tag !== undefined)
    const items = []
    items.push(h('div', {class: 'content', attrs: {style: 'flex-basis:' + this.state.split}}, [children[0]]))
    items.push(h('div', {ref: 'splitter', class: 'splitter', on: {mousedown: this.startResize}}))
    items.push(h('div', {class: 'content'}, [children[1]]))
    return h('div', {class: this.splitClass}, items)
  }

}
</script>
<style>
.split {
  display: flex;
  flex: 1;
  max-width:100%;
  height: 100%;
}

.split > .content {
  position: relative;
  display: flex;
  box-sizing: border-box;
  overflow: hidden;
}

.split > .content > * {
  flex: 1;
  height: 100%;
}

.split > .content:last-child {
  flex: 1;
}

.split.vertical {
  flex-direction: column;
}

.split.horizontal {
  flex-direction: row;
}

.split.resizeable.vertical > .splitter {
  cursor: row-resize;
}

.split.resizeable.horizontal > .splitter {
  cursor: col-resize;
}
</style>
