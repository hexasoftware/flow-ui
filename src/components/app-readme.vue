<template>
  <div class="app-readme">
    <div class="app-readme__menu">
      <hx-tree :items="menu" container=".app-readme__container"/>
    </div>
    <div class="app-readme__container">
      <div
        class="app-readme__content markdown-body"
        v-html="content"/>
    </div>
  </div>
</template>
<script>
import readmemd from '@/../README.md'
import HxTree from '@/components/shared/hx-tree'
import 'github-markdown-css'
import 'highlight.js/styles/monokai.css'

export default {
  components: {HxTree},
  data () {
    return {
      menu: [],
      content: readmemd
    }
  },
  mounted () {
    const elist = this.$el.querySelectorAll('h1,h2,h3,h4')

    let curH1
    let curH2
    let curH3
    Array.from(elist).forEach(e => {
      const item = {name: e.innerText, link: '#' + e.getAttribute('id'), children: []}

      // Improve this as levels
      // As now the h4 can only fit in h3, h3 in h2 etc.
      // So we could check if the new H is higher than last item/lastParent
      // Something like recursion perhaps
      switch (e.tagName) {
        case 'H1':
          curH1 = item
          this.menu.push(curH1)
          break
        case 'H2':
          curH2 = item
          curH1.children.push(curH2)
          break
        case 'H3':
          curH3 = item
          curH2.children.push(curH3)
          break
        case 'H4':
          curH3.children.push(item)
      }
    })
  }
}
</script>
<style>
.app-readme {
  display:flex;
  flex-flow:row;
  align-items: stretch;
  width:100%;
}

.app-readme__menu {
  flex-grow:0;
  min-width:250px;
  height:100vh;
  padding:80px 30px;
  border-right: solid 1px rgba(150,150,150,0.5);
  overflow-y:auto;
}

.app-readme__menu ul{
  list-style: none;
  padding:0;
  margin:0;
  font-weight:normal;
  padding-left:12px;
  font-size:14px;
  border:none;
}

.app-readme__menu > ul {
  font-weight:bold;
  font-size:24px;
}

.app-readme__menu > ul > li > a{
  border-bottom: solid 1px ;
}

.app-readme__menu > ul >li>ul{
  padding:0;
}

.app-readme__menu > ul >li>ul ul{
  border-left: dashed 1px rgba(100,100,100,0.2);
}

.app-readme__menu ul li {
  line-height:34px;
}

.app-readme__menu ul li a {
  white-space: nowrap;
  text-decoration: none;
  width:100%;
  color: #333;
  transition: all 0.3s;
  border-bottom: solid 2px transparent;
}

.app-readme__menu ul li a:hover {
  border-bottom: solid 2px var(--primary);
}

.app-readme__container {
  overflow-y:auto;

}

.app-readme__content {
  flex:1;
  padding:40px;
  padding-left:10%;
  padding-right: calc(100% - 1200px);
  padding-right: 20%;
  padding-bottom:100vh;
}

</style>
