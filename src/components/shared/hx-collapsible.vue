<template>
  <div
    class="hx-collapsible"
    :class="{active:state.active}">
    <button
      class="hx-collapsible__header"
      @click.stop.prevent="toggle">
      <slot name="header"/>
      <div v-if="icon">
        <hx-toggle-arrow :active="state.active"/>
      </div>
    </button>

    <div class="hx-collapsible__content">
      <slot/>
    </div>
  </div>
</template>

<script>
import HxToggleArrow from './hx-toggle-arrow'
export default {
  components: {HxToggleArrow},
  props: {
    active: {type: Boolean, default: false},
    icon: {type: Boolean, default: true}
  },
  data () {
    return {
      state: {
        active: this.active
      }
    }
  },
  watch: {
    active (value) {
      this.state.active = this.active
    }
  },
  methods: {
    toggle (ev) {
      this.state.active = !this.state.active
    }
  }
}
</script>
<style>
.hx-collapsible {
  position:relative;
  display:flex;
  flex-direction: column;
}

/* header */
.hx-collapsible__header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  align-content:center;
  user-select:none;
  cursor: pointer;
}

/*content*/
.hx-collapsible__content{
  overflow:hidden;
  opacity:0;
  max-height:0;
  flex-basis: 0;
  flex-grow:0;
  transition: all var(--transition-speed);
}

.hx-collapsible.active .hx-collapsible__content{
  flex-basis:100%;
  flex-grow:1;
  opacity:1;
  max-height:900px;
  transition: all var(--transition-speed);
}

</style>
