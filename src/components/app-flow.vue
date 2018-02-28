<template>
  <div class="flow-main" :class="themes[theme%themes.length]">
    <div class="app-content" :class="{'app-content--blur':modalInfo || modalData}">
      <div class="app-header">
        Flow
        <div>
          <button @click="modalInfo=true">?</button>
          <button @click="theme++">{{ themes[(theme+1)%themes.length] }}</button>
        </div>
      </div>
      <div class="app-horizontal">
        <div class="app-flow-container">
          <div class="app-watermark">PROTOTYPE</div>

          <!--:value="nodeData"
        @input="documentUpdate"-->
          <hx-split
            dir="horizontal"
            :resizeable="true"
            :split="funcsSize"
            @onSplitResize="funcsSizeUpdate"

          >
            <div class="flow-panel__container">
              <div class="flow-panel__selector">
                <button :class="{active:panel=='palette'}" @click="panel='palette'">Funcs</button>
                <button :class="{active:panel=='inspector'}" @click="panel='inspector';">Inspector</button>
              </div>
              <transition name="fade">
                <flow-funcs
                  v-show="panel=='palette'"
                  @toggleResizeable="funcsResizeable=!funcsResizeable"
                  @toggleStickySockets="managerStickySockets=!managerStickySockets"
                />
              </transition>
              <transition name="fade">
                <flow-inspector
                  ref="inspector"
                  @dataClick="modalData=true"
                  v-show="panel=='inspector'"
                />
              </transition>
            </div>
            <flow-editor
              ref="flowManager"
              @nodeInspect="nodeInspectStart(...arguments)"
              @nodeProcess="nodeProcess(...arguments)"
              @nodeDoubleClick="nodeInspectStart(...arguments,true)"
              @nodeViewData="modalData=true"
              @activityPointerDown="nodeInspectStart($event,true,true)"
              @documentSave="documentSave"

              width="100%"
              height="100%"/>
          </hx-split>
        </div>
        <div class="app-chat">
          <app-chat/>
        </div>
        <flow-notifications/>
      </div>
    </div>
    <!-- create a modal selector here -->
    <hx-modal class="flow-modal__info" v-if="modalInfo" @close="modalInfo=false">
      <h4 slot="header">INFO</h4>
      <flow-modal-info slot="body"/>
      <template slot="footer">
        <a href="readme" target="_blank">More information</a>
        <button class="primary-inverse" @click="modalInfo=false">OK</button>
      </template>
    </hx-modal>
    <hx-modal class="flow-modal__data" v-if="modalData" @close="modalData=false">
      <h4 slot="header">Data visualiser</h4>
      <flow-modal-data slot="body"/>
    </hx-modal>

  </div>
</template>
<script>
import {mapGetters, mapActions} from 'vuex'
import FlowEditor from '@/components/flow/editor'
import FlowPanzoom from '@/components/flow/panzoom'
import FlowNotifications from '@/components/flow/notifications'
import FlowInspector from '@/components/flow/panel-inspector'
import FlowFuncs from '@/components/flow/panel-funcs'
import FlowModalData from '@/components/flow/modal-data'
import FlowModalInfo from '@/components/flow/modal-info'
import HxSplit from '@/components/shared/hx-split'
import HxModal from '@/components/shared/hx-modal'
import AppChat from '@/components/flow/chat'
import 'reset-css/reset.css'

import '@/assets/lines-theme.css'
import '@/assets/dark-theme.css'
import '@/assets/style.css'
// import nodeData from './nodedata'

export default {
  components: {
    FlowEditor,
    FlowPanzoom,
    FlowNotifications,
    FlowInspector,
    FlowFuncs,
    FlowModalData,
    FlowModalInfo,
    HxSplit,
    HxModal,
    AppChat
  },
  data () {
    return {
      modalInfo: false,
      modalData: false,

      panel: 'palette',

      funcsSize: '250px',
      funcsResizeable: false,

      themes: ['color', 'dark', 'lines'],
      theme: 2
    }
  },
  computed: {
    ...mapGetters(['registry', 'activity'])
  },

  mounted () {
    // Handle incoming things
    this.$flowService.on('sessionJoin', (v) => {
      this.$router.push(`s:${v.id}`)
    })
    this.$flowService.on('sessionLog', (v) => {
      console.log(v.data) // Temporary
    })
  },
  methods: {
    ...mapActions('flow', ['NODE_INSPECT', 'NOTIFICATION_ADD']),
    nodeInspectStart (nodeId, changePane, showData) { // node
      this.NODE_INSPECT(nodeId)

      if (showData) {
        this.modalData = true
      }
      if (changePane) {
        this.panel = 'inspector'
      }
      if (this.panel !== 'inspector') {

      }

      // this.nodeInspect = node

      // if (!changePane) { return }
      /* this.$nextTick(() => {
        // panel input
        if (!this.$refs.inspector) { }
        const insp = this.$refs.inspector
        let targetInput = insp.$refs.label
        if (insp.$refs.inputs && insp.$refs.inputs.length > 0) {
          targetInput = insp.$refs.inputs[0]
        } else if (insp.$refs.propss && insp.$refs.props.length > 0) {
          targetInput = insp.$refs.props[0]
        }
        if (!targetInput) {
          return
        }
        targetInput.setSelectionRange(0, targetInput.value.length)
        targetInput.focus()
      }) */
    },
    funcsSizeUpdate (ev, size) {
      this.funcsSize = size
    },
    documentSave (nodeData) {
      this.$flowService.documentSave(nodeData)
    }

    // Update individual nodes/links
  }
}

</script>
<style>
.flow-main {
  height:100%;
  display:flex;
  flex-flow: column;
}

.app-content {
  display:flex;
  flex-flow:column;
  flex-basis:100%;
  flex:1;
  transition: all var(--transition-speed);
}

.app-content--blur {
  filter: blur(7px);
}

.app-flow-container {
  width:100%;
  position:relative;
  flex:1;
}

.flow-main .flow-container {
  position:absolute;
  top:0;
  right:0;
  bottom:0;
  left:0;
}

.flow-main .app-header {
  padding:0 14px;
  height: 50px;
  display:flex;
  justify-content: space-between;
  align-items: center;
}

.flow-main .app-watermark {
  position:absolute;
  top:40%;
  text-align:center;
  width:100%;
  font-size:100px;
  text-shadow: 1px 1px 1px rgba(255,255,255,0.5), -1px -1px 1px rgba(0,0,0,0.05);
}

.split .splitter{
  flex-basis:0;
  position:relative;
  background: rgba(208,208,208,0.9);
}

.split:not(.resizeable) .content:first-child {
  transition: all var(--transition-speed);
}

.split.resizeable.horizontal .splitter::after {
  opacity:0.4;
  display:flex;
  justify-content: center;
  align-items: center;
  z-index:100;
  content:" ";
  position:absolute;
  top:0%;
  bottom:0%;
  left:0;
  width:10px;
  background: rgba(0,0,0,0.5);
  transition: var(--transition-speed);
}

.app-horizontal {
  height:100%;
  max-height:100%;
  display:flex;
  position:relative;
  flex-flow:row;
  overflow:hidden;
}

.app-chat {
  position:absolute;
  top:0;
  right:0;
  height:100%;
}

.flow-panel__container {
  display:flex;
  flex-flow:column;
  flex:1;
  overflow:hidden;
  transition: all var(--transition-speed);
}

.flow-panel__selector {
  color: var(--normal);
  display:flex;
  align-content: stretch;
  flex-shrink: 0;
  height:50px;
  border-bottom:solid 1px var(--primary);
}

.flow-panel__selector button{
  flex:1;
}

.hx-modal__header h4{
  color: var(--normal) !important;
}

</style>
