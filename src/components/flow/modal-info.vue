<template>
  <div
    class="app-info markdown-body"
    v-html="content"/>
</template>
<script>
import md from '@/assets/doc/appinfo.md'
import 'github-markdown-css'
import 'highlight.js/styles/monokai.css'

export default {

  data () {
    return {
      content: md
    }
  }
}
</script>
<style>
.app-info {
  flex:1;
  padding-top:20px;
}

.hx-modal__container {
  width:70%;
}

.markdown-body a {
  color: var(--primary);
  text-decoration: none;
}
