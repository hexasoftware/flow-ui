<template>
  <div class="flow-inspector">
    <template v-if="nodeInspect">
      <!-- VIEWER -->
      <div class="flow-inspector__container">
        <!--<svg
          class="flow-view preview activity flow-node--detail flow-node--activity flow-linking flow-inspector__area flow-inspector--view "
          width="100%"
          height="100%"
          viewBox="0 0 300 200">
          <flow-panzoom>
            <flow-node
              style="pointer-events:none"
              ref="modalPreviewNode"
              :id="nodeInspect.id"
              transform="translate(150,100)"
              :match="{}"
              :label="nodeInspect.label"
              :inputs= "registry[nodeInspect.src].inputs"
              :output= "registry[nodeInspect.src].output"
              :activity= "activity[nodeInspect.id]"
              :nodeStyle= "registry[nodeInspect.src].style"
            />
          </flow-panzoom>
        </svg>-->

        <!-- DESCRIPTIONS -->
        <div class="flow-inspector__area flow-inspector--properties ">
          <h2 class="property">{{ nodeInspect.src }}</h2>
          <label>ID</label>
          <div class="property">[{{ nodeInspect.id }}]</div>
          <!--
          <label>Description</label>
          <div class="property">Bogus description</div>
          <label>Help</label>
          <div class="property">Connect to input a thing and goes to output another thing</div>
          -->
        </div>
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

        <!-- STATIC PARAM -->
        <div class="flow-inspector__area  flow-inspector--static">
          <label>label</label>
          <input ref="label" type="text" v-model="nodeInspect.label" @input="localChange">
          <label>color  <small>*experimental*</small> </label>
          <input type="text" v-model="nodeInspect.color" @input="localChange">
          <div class="flow-inspector__param" v-for="(v,k) in nodeInspect.prop">
            <label>{{ k }}</label>
            <input
              ref="props"
              type="text"
              v-model="nodeInspect.prop[k]" @input="localChange">
          </div>
        </div>
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
            <!--<textarea
              ref="inputs"
              type="text"
              v-model="nodeInspect.defaultInputs[i]"
              @input="localChange"
              />-->
          </div>
        </div>

      </div><!-- /container -->

      <div class="flow-inspector__area flow-inspector--control">
        <button
          class="primary-inverse"
          @click="NODE_PROCESS([nodeInspect.id])">Run</button>
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
      nodeInspect: null
    }
  },
  computed: {
    ...mapGetters('flow', ['registry', 'activity', 'nodeData']),
    nodeActivity () {
      return this.activity && this.activity.nodes && this.activity.nodes[this.nodeInspect.id]
    },
    result () {
      return this.nodeActivity && this.nodeActivity.data.toString()
    }
  },
  watch: {
    '$store.state.flow.nodeInspect' (node) {
      this.nodeInspect = JSON.parse(JSON.stringify(node))
    }
  },
  methods: {
    ...mapActions('flow', ['NODE_UPDATE', 'DOCUMENT_SYNC', 'NODE_PROCESS', 'NODE_SELECTION_SET']),
    localChange () {
      let nodeUpdates = [JSON.parse(JSON.stringify(this.nodeInspect))]

      // PORTAL related code
      // Experimental find portals with same name
      let n = this.nodeInspect

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
        portal.label = n.label
        portal.color = n.color
        nodeUpdates.push(portal)
      }
      // Find the relative portal node

      this.NODE_UPDATE(nodeUpdates)
      this.DOCUMENT_SYNC()
      // Seems that there might be browsers triggering the input before the v-model
      // so we defer the execution until we have nodeInspect updated
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
