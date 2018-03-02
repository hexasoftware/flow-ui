<template>
  <div class="flow-inspector">
    <template v-if="selectionCount > 0">
      <!-- VIEWER -->
      <div class="flow-inspector__container">
        <!-- DESCRIPTIONS -->
        <div class="flow-inspector__area flow-inspector--properties ">
          <!--<h2 class="property">{{ nodeInspect.src }}</h2>-->
          <label>Nodes</label>
          <div class="property">
            <div>{{ selectionList.map( n => "[" + n.src +":"+ n.id +"]").join(", ") }}</div>
          </div>
        </div>
        <!-- ACTIVITY important but figure a way to handle multiple
        <div
          v-if="nodeActivity && (nodeActivity.error || nodeActivity.data)"
          class="flow-inspector__area flow-inspector--activity">
          <div
            v-if="nodeActivity.data"
            class="flow-inspector--properties-result">
            <label>Result</label>

            <div
              v-if="result.startsWith('data:image')"
              class="property">
              <img style="width:100%;height:auto" :src="result">
            </div>
            <div
              v-else
              class="property">
              {{ result.substr(0,100) }}
              {{ result.length > 100 ? '...':'' }}
            </div>
            <button @click="NODE_SELECTION_SET([nodeInspect]);$emit('dataClick')">Visualize</button>
          </div>
          <div
            v-if="nodeActivity.error"
            class="flow-inspector--properties-error">
            <label>Error</label>
            <div class="property">{{ nodeActivity && nodeActivity.error }}</div>
          </div>
        </div>
        -->

        <!-- DIRECT STATIC PARAM -->
        <div class="flow-inspector__area  flow-inspector--static">
          <div
            class="flow-inspector__param"
            v-for="(v,k) in dprops"
            :key="'dprop'+k">
            <label>{{ k }} <template v-if="selectionCount > 1">({{ selectionCount }})</template></label>
            <input
              ref="props"
              type="text"
              v-model="dprops[k]"
              :placeholder="dprops[k] === null?'multiple values':''"
              @input="propChange(k,true)">
          </div>
          <!--<label>label</label>
          <input ref="label" type="text" v-model="nodeInspect.label" @input="localChange">
          <label>color  <small>*experimental*</small> </label>
          <input type="text" v-model="nodeInspect.color" @input="localChange">-->
          <!-- NODE PROPS -->
          <div
            class="flow-inspector__param"
            v-for="(v,k) in props"
            :key="'prop'+k"
          >
            <label>{{ k }}</label>
            <input
              ref="props"
              type="text"
              v-model="props[k]"
              @input="propChange(k)">
          </div>
        </div>
        <div
          class="flow-inspector__area flow-inspector--inputs"
          v-for="(v,k) in inputs"
        >
          <h3>Constants <template v-if="selectionCount > 1" >for {{ k }} ({{ v.nodes.length }})</template></h3>
          <div
            class="flow-inspector__param"
            v-for="(inp,i) in v.types"
          >
            <label>{{ inp.name }}:{{ inp.type }}</label>
            <hx-el-editable
              ref="inputs"
              v-model="v.values[i]"
              :placeholder="v.values[i]===null?'multiple values':''"
              @input="inputsChange(k,i) "/>

          </div>

        </div>
        <!-- INPUTS -->
        <!--
        <div v-if="registry[nodeInspect.src].inputs" class="flow-inspector__area flow-inspector--inputs">
          <h3>Constants</h3>
          <div
            class="flow-inspector__param"
            v-for="(n,i) in registry[nodeInspect.src].inputs"
            :key="nodeInspect.id +'-prop-'+i">
            <label>{{ n.name }}:{{ n.type }}</label>
            <hx-el-editable
              ref="inputs"
              v-model="nodeInspect.defaultInputs[i]"
              @input="localChange"
            />
                      </div>
                    </div>
                    -->

      </div><!-- /container -->

      <div class="flow-inspector__area flow-inspector--control">
        <button
          class="primary-inverse"
          @click="NODE_PROCESS(Object.keys(nodeSelection))">Run ({{ selectionCount }}) </button>
      </div>
    </template>
    <template v-else>
      <div class="flow-inspector__container">
        Select a node
      </div>
    </template>
  </div>
</template>
<script>
import {mapGetters, mapActions} from 'vuex'
import FlowPanzoom from '@/components/flow/panzoom'
import FlowNode from '@/components/flow/node'
import HxElEditable from '@/components/shared/hx-eleditable'

export default {
  name: 'FlowInspector',
  components: {FlowPanzoom, FlowNode, HxElEditable},
  data () {
    return {
      // Individual props instead
      dprops: {},
      props: {},
      inputs: {}
    }
  },
  computed: {
    ...mapGetters('flow', ['registry', 'activity', 'nodeData', 'nodeSelection']),
    /* nodeActivity () {
      return this.activity && this.activity.nodes && this.activity.nodes[this.nodeInspect.id]
    }, */
    result () {
      return this.nodeActivity && this.nodeActivity.data.toString()
    },
    // Selection sorted by X
    selectionList () {
      return Object.keys(this.nodeSelection).map(k => this.nodeSelection[k]).sort((a, b) => a.x > b.x)
    },
    selectionCount () {
      return Object.keys(this.nodeSelection).length
    }
  },
  watch: {
    'nodeSelection': {
      handler (selection) {
        this.buildInspection()
      },
      deep: true
    }
  },
  methods: {
    ...mapActions('flow', ['NODE_UPDATE', 'DOCUMENT_SYNC', 'NODE_PROCESS', 'NODE_SELECTION_SET']),
    buildInspection () {
      // Go through selection and find common props
      // List ID as selections
      // var inputs = {} // Only with same signature type

      this.inputs = {}
      this.dprops = {}
      this.props = {} // Props per key
      for (let k in this.nodeSelection) {
        const node = this.nodeSelection[k];
        // Static props
        ['label', 'color'].forEach((sp) => {
          // static props
          if (this.dprops[sp] === undefined) {
            this.dprops[sp] = node[sp]
            return
          }
          if (this.dprops[sp] !== node[sp]) {
            this.dprops[sp] = null
          }
        })

        // For each prop
        for (let p in node.props) {
          if (this.props[p] === undefined) {
            this.props[p] = node.props[p]
            continue
          }
          if (this.props[p] !== node.props[p]) { // if different
            this.props[p] = null // or empty
          }
        }
        // inputs per node Type
        for (let p in this.registry[node.src].inputs) {
          // const inp = this.registry[node.src].inputs[p]
          if (this.inputs[node.src] === undefined) this.inputs[node.src] = {nodes: [], types: this.registry[node.src].inputs, values: []}

          this.inputs[node.src].nodes.push(node)
          // Separated by src
          if (this.inputs[node.src].values[p] === undefined) {
            this.inputs[node.src].values[p] = node.defaultInputs[p]
          } else if (this.inputs[node.src].values[p] !== node.defaultInputs[p]) {
            this.inputs[node.src].values[p] = null
          }
        }

        // Common props separated by node src
      }
      // Check also label and color into props
    },
    propChange (p, dprop) {
      let nodeUpdates = []
      for (let k in this.selectionList) {
        const n = JSON.parse(JSON.stringify(this.selectionList[k])) // clone node
        if (dprop) {
          n[p] = this.dprops[p]
        } else {
          n.props[p] = this.prop[p]
        }
        nodeUpdates.push(n)
        /// //////////
        // Update Related portals
        /// /////
        let theID = n.id
        let relatedPortals = []
        if (n.src === 'Portal From') {
          let nodeFrom = this.nodeData.nodes.find(nn => nn.id === n.prop['portal from'])
          relatedPortals.push(nodeFrom)
          theID = nodeFrom.id
        }
        this.nodeData.nodes.forEach(nn => {
          if (nn === n) { return }
          if (nn.src !== 'Portal From') { return }
          if (nn.prop['portal from'] !== theID) { return }
          relatedPortals.push(nn)
        })
        // Update label and color perhaps
        for (let nn of relatedPortals) {
          let portal = JSON.parse(JSON.stringify(nn))
          if (dprop) {
            portal[p] = this.dprops[p]
          } else {
            portal.props[p] = this.props[p]
          }
          nodeUpdates.push(portal)
        }
      }
      this.NODE_UPDATE(nodeUpdates)
      this.DOCUMENT_SYNC()
      // Basically we load the props into the selected nodes?
    },
    inputsChange (src, i) {
      let nodeUpdates = []
      for (let k in this.selectionList) {
        if (this.selectionList[k].src !== src) {
          continue
        }
        const n = JSON.parse(JSON.stringify(this.selectionList[k])) // clone node
        n.defaultInputs[i] = this.inputs[src].values[i]
        nodeUpdates.push(n)
      }
      this.NODE_UPDATE(nodeUpdates)
      this.DOCUMENT_SYNC()
      // Basically we load the props into the selected nodes?
    }
  }
}
</script>
<style>
.flow-inspector {
  font-size:12px;
  flex:1;
  width:100%;
  overflow:hidden;
  height: available;
  display:flex;
  flex-flow:column;
  color: var(--normal);
}

.flow-inspector__container {
  padding:10px;
  display:flex;
  flex-flow:column;
  width:100%;
  flex-basis:100%;
  transition: all var(--transition-speed);
  overflow-x:hidden;
  overflow-y:auto;
}

.flow-inspector input {
  background: var(--background);
  color: var(--normal);
}

.flow-inspector__area{
  flex:0;
  padding: 10px 0;
  border-bottom: solid 1px var(--border-color-lighter);
}

.flow-inspector__area h2{
  font-size:16px;
  padding-bottom:15px;
}

.flow-inspector__area h3{
  font-size:14px;
  padding-bottom:4px;
}

.flow-inspector__area label{
  display:block;
  font-weight:bold;
  padding:12px 0 5px 0;
  margin:0;
}

.flow-inspector__area small {
  font-size:9px;
  color: var(--normal);
}

.flow-inspector--view {
  flex-basis:150px;
  flex-shrink: 0;
}

.flow-inspector__area .property {
  white-space: normal;
  word-wrap: break-word;
}

.flow-inspector--properties-error {
  color: red;
}

.flow-inspector--properties-result {
  display:flex;
  flex-flow:column;
}

.flow-inspector--properties-result button {
  margin-top:10px;
  background: rgba(140,140,140,0.2);
  background: var(--secondary);
  color: var(--secondary-inverse);
}

.flow-inspector--parameters {
  padding:20px;
}

.flow-inspector--control {
  flex:0;
  padding-top:10px;
}

.flow-inspector--control button {
  width: 100%;
  height:50px;
}
</style>
