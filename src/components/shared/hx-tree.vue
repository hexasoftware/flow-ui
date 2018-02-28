<template>
  <ul class="hx-tree">
    <template v-for="e of items">
      <li
        class="hx-tree__item"
        :key="e.name">
        <a
          v-if="e.link[0] == '#'"
          :href="e.link"
          v-smooth-scroll="{container:container}">{{ e.name }}</a>
        <a
          v-else
          :href="e.link"
        >{{ e.name }}</a>
      </li>
      <li :key="e.name + 'list'">
        <hx-tree
          :items="e.children"
          :container="container"/>
      </li>
    </template>
  </ul>
</template>

<script>
import Vue from 'vue'
import vueSmoothScroll from 'vue2-smooth-scroll'
Vue.use(vueSmoothScroll)

export default {
  name: 'HxTree',
  props: {
    items: { type: Array, default: () => [] },
    container: { type: String, default: undefined }
  },
  mounted () {
    console.log('Type of:', typeof (this.container))
  }

}
</script>
<style>
.hx-tree a {
  cursor:pointer;
}
</style>
