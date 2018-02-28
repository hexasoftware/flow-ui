<template>
  <div class="flow-funcs__container">
    <!--<div class="flow-funcs__control">
    <button
      class="item"
      @click="funcsViewBlocks=!funcsViewBlocks">
      {{ funcsViewBlocks ? 'List':'Blocks' }} view
    </button>
    <button
      class="item"
      @click="$emit('toggleResizeable')">
      Resize
    </button>
  </div>-->
    <div class="flow-funcs__search">
      <input
        type="text"
        placeholder="search ... "
        v-model="search">
    </div>

    <div class="flow-funcs__inner">
      <div
        class="flow-funcs__collapsible"
        v-for="g in funcsGroups"
        :key="g">
        <hx-collapsible ref="funcGroup">
          <div
            class="flow-funcs__header"
            slot="header">{{ g }}</div>
          <div
          class="flow-funcs__group">
            <div
              ref="src"
              v-for="k in funcsGroupItems(g)"
              :key="k.src"
              class="flow-funcs__src hover"
              draggable="true"
              @dragstart="fnDrag($event,k.src)"
              :style="{ 'background': registry[k.src].style && registry[k.src].style.color, }"
              :title="k.src"
              v-html="k.label"
            />
          </div>
        </hx-collapsible>
      </div>
    </div>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'
import HxCollapsible from '@/components/shared/hx-collapsible'
import utils from '@/utils/utils'

export default {
  name: 'FlowPanel',
  components: {HxCollapsible},
  data () {
    return {
      search: null
    }
  },
  computed: {
    ...mapGetters('flow', ['registry']),
    funcsGroups () {
      // Set
      let group = new Set()
      for (let r in this.registry) {
        for (let c of this.registry[r].categories) {
          if (this.funcsGroupItems(c).length === 0) {
            continue
          }
          group.add(c)
        }
      }
      return [...group]
    },
    funcsGroupItems () {
      return (g) => {
        const ret = Object.keys(this.registry).filter(v => this.registry[v].categories.includes(g))
          .map(v => {
            return { src: v, label: v.split('.').join('<br/>') }
          })
        if (!this.search) {
          return ret
        }

        const filtered = []
        ret.forEach(e => {
          let r = utils.fuzzysearch(this.search, e.label)
          if (r !== false) {
            filtered.push({src: e.src, label: r})
          }
        })
        return filtered
      }
    }
  },
  watch: {
    search () {
      for (let g of this.$refs.funcGroup) {
        // Hack?
        g.state.active = true
      }
    }
  },
  methods: {
    fnDrag (ev, src) {
      ev.dataTransfer.setData('text/plain', src)
    }
  }
}
</script>
<style>
.flow-funcs {
  font-size:12px;
  flex:1;
  overflow:hidden;
  height: available;
  display:flex;
  flex-flow:column;
  color: var(--normal);
  padding:10px;

}

.flow-funcs__container {
  display:flex;
  flex-flow:column;
  white-space: nowrap;
  width:100%;
  flex-basis:100%;
  transition: all var(--transition-speed);
  overflow:hidden;

}

.flow-funcs__search {
  flex:0;
}

.flow-funcs__search input {
  background: transparent;
  padding:13px;
  min-width:50px;
  height:50px;
  box-shadow:none;
}

.flow-funcs__inner {
  display:flex;
  flex-flow:column;
  justify-content: flex-start;
  overflow-x:hidden;
  overflow-y:auto;
}

.flow-funcs__header {
  transition: all var(--transition-speed);
}

.flow-funcs__inner .hx-collapsible__header {
  font-size:14px;
  padding:5px 10px;
  transition: all var(--transition-speed);
}

.flow-funcs__group{
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(100px,auto));
  padding:10px;
  transition: all var(--transition-speed);
}

.flow-funcs__src {
  display:block;
  font-size:10px;
  padding:18px 4px;
  margin:1px;
  text-overflow: ellipsis;
  text-align:center;
  transition: all var(--transition-speed);
  position:relative;
  cursor: move;
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
  overflow:hidden;
}

.flow-funcs__src b{
  color: var(--primary-lighter);
}

</style>
