<template>
  <div
    class="hx-toggle-arrow"
    :class="{active:active}"
    @click="$emit('click',$event)"
  >=</div>
</template>
<script>

export default {
  name: 'HxToggleArrow',
  props: {
    active: {type: Boolean, default: false}
  }
}
</script>

<style>
.hx-toggle-arrow {
  transform: rotate(90deg);
  transition: all var(--transition-speed);
  padding:8px;
  text-shadow: inset 1px 1px 2px #fff;
}

.hx-toggle-arrow.active {
  content:"=";
  transform: rotate(0deg);
}

</style>
