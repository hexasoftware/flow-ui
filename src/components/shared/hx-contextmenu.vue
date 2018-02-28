<template>
  <div
    :class="{visible:isVisible}"
    class="hx-context-menu"
    :style="style" tabindex="-1" @click="close" @blur="close" @contextmenu.capture.prevent>
    <slot :user-data="userData"/>
  </div>
</template>

<script>

module.exports = {
  name: 'hx-context-menu',
  data () {
    return {
      isVisible: false,
      x: null,
      y: null,
      userData: null
    }
  },
  computed: {
    style () {
      let x = this.x
      let y = this.y

      if (!this.$el || !this.$parent || !this.$parent.$el) { return }
      const parentRect = this.$parent.$el.getBoundingClientRect()

      var right = parentRect.left + parentRect.width
      const diffX = x + this.$el.offsetWidth - right
      if (diffX > 0) {
        x -= diffX + 2
      }
      const bottom = parentRect.top + parentRect.height
      const diffY = y + this.$el.offsetHeight - bottom
      if (diffY > 0) {
        y -= diffY + 2
      }

      return {
        top: y - document.body.scrollTop + 'px',
        left: x + 'px'
      }
    }
  },
  methods: {
    open (evt, userData) {
      this.isVisible = true
      this.x = evt.pageX || evt.clientX
      this.y = evt.pageY || evt.clientY
      this.userData = userData
      this.$nextTick(() => this.$el.focus())
    },
    close (evt) {
      this.isVisible = false
      this.userData = null
    }
  }
}
</script>

<style scoped>

.hx-context-menu {
  position: fixed;
  z-index: -2000;
  opacity:0;
  background: var(--background-secondary);
  color: var(--normal);
  transition: opacity var(--transition-speed);
  border: solid 1px rgba(150,150,150,0.1);
  box-shadow: 0 1px 4px rgba(0,0,0,0.5);
}

.hx-context-menu.visible{
  opacity:1;
  z-index: 2000;
}

.hx-context-menu:focus {
  opacity:1;
  outline: none;
}
</style>
