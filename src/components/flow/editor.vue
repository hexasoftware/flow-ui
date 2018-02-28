<template>
  <div class="flow-container">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xhtml="http://www.w3.org/1999/xhtml"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      ref="svg"
      class="flow-view view"
      :class="viewClasses"
      @dragover.prevent
      @drop="managerDrop"
      @mousedown="viewPointerDown"
      @contextmenu.capture.prevent="$refs.menu.open($event,{ctx:'editor'})"
      :width="width"
      :height="height">
      <svg-defs/>

      <flow-pan-zoom
        ref="panzoom"
        v-model="panzoomCTM"
      >

        <flow-link
          v-for="l of nodeData.links"
          :key="'link' + l.to + l.in"
          :link="l"
          @mousedown.middle="LINK_REMOVE(l)"
        />
        <flow-trigger-link
          v-for="(t,i) in nodeData.triggers"
          :key="'trigger'+t.to+i"
          label="error/finish"
          :trigger="t"
          @mousedown.middle="TRIGGER_REMOVE(t)"
        />
        <flow-node
          ref="nodes"
          v-for="n of nodeData.nodes"
          :node="n"
          :match="matchHighlight"
          :dragging="dragging"
          :key="n.id"
          @nodePointerDown.prevent="nodePointerDown($event,n.id)"
          @socketPointerDown="socketPointerDown(n.id,...arguments)"
          @triggerPointerDown="triggerPointerDown(n.id,...arguments)"
          @nodeDoubleClick="$emit('nodeDoubleClick',n.id)"
          @nodeRightClick="$refs.menu.open($event,{ctx:'node',node:n})"
          @activityPointerDown="$emit('activityPointerDown',n.id)"
        />

        <!-- mouse links-->
        <flow-link
          v-if="pointerLink.active"
          :link="pointerLink"
        />
        <flow-trigger-link
          :pointer="true"
          v-if="pointerTriggerLink.active"
          :trigger="pointerTriggerLink"
        />
      </flow-pan-zoom>
      <rect
        class="flow-selector"
        :class="{'flow-selector--selecting':(selector)?true:false}"
        v-bind="selector"/>

    </svg>
    <div class="flow-container__control">
      <button disabled>Deploy</button>
      <button @click="stickySockets=!stickySockets"> {{ stickySockets? 'Hide':'Show' }} details </button>
      <!--
      <button @click="stickyTriggers=!stickyTriggers"> {{ stickyTriggers? 'Hide':'Show' }} triggers </button>
      <button @click="nodeActivity=!nodeActivity"> {{ nodeActivity? 'Hide':'Show' }} activity </button>-->
      <button @click="$emit('documentSave', nodeData)"> Save </button> <!-- should disable until confirmation -->
      <button v-if="!panzoomIdentity" @click="panzoomReset"> Reset view </button>
      <button v-if="selectionCount>0" @click="nodeSelectionProcess" class="primary-inverse">Process</button>
    </div>
    <div class="flow-container__info">
      {{ nodeData.nodes.length }} nodes
      {{ nodeData.links.length }} links
      {{ nodeData.triggers.length }} triggers
      {{ selectionCount }} selected
    </div>
    <hx-context-menu ref="menu">
      <template slot-scope="d" >
        <div v-if="d.userData && d.userData.ctx === 'node'" class="flow-node__context-menu">
          <!-- for the selection -->
          <div v-if="nodeSelection[d.userData.node.id]">
            <div class="hover item" @click="nodeSelectionProcess">Run ({{ selectionCount }})</div>
            <div class="hover item" @click="$emit('nodeViewData')">View ({{ selectionCount }})</div>
            <hr>
            <div class="hover item" @click="NODE_REMOVE(nodeSelection)">Delete ({{ selectionCount }})</div>
          </div>
          <!-- for the context -->
          <div v-else>
            <div class="hover item" @click="nodeProcess(d.userData.node.id)">Run</div>
            <hr>
            <div class="hover item" @click="nodeRemove(d.userData.node.id)">Delete</div>
          </div>

          <hr>
          <div class="hover item" @click="NODE_TRAIN(d.userData.node.id)">Train(temporary)</div>
          <hr>
          <div class="hover item" @click="nodeInspect(d.userData.node.id,true)">Inspect</div>
        </div>

        <div v-if="d.userData && d.userData.ctx === 'editor'" class="flow-node__context-menu">
          <div v-if="selectionCount>0">
            <div class="hover item" @click="nodeSelectionProcess">Run ({{ selectionCount }})</div>
            <div class="hover item" @click="$emit('nodeViewData')">View ({{ selectionCount }})</div>
            <hr>
            <div class="hover item" @click="NODE_REMOVE(nodeSelection)">Delete ({{ selectionCount }})</div>
            <hr>
          </div>
          <!-- editor settings -->
          <div>
            <div class="hover item" @click="stickySockets=!stickySockets"> {{ stickySockets? 'Hide':'Show' }} details </div>
            <div class="hover item" @click="stickyTriggers=!stickyTriggers"> {{ stickyTriggers? 'Hide':'Show' }} triggers </div>
            <div class="hover item" @click="nodeActivity=!nodeActivity"> {{ nodeActivity? 'Hide':'Show' }} activity </div>
          </div>

        </div>
      </template>
    </hx-context-menu>
  </div>
</template>
<script src="./editor.js">
</script>
<style>
.flow-container {
  display:flex;
  flex-flow:row;
  position:relative;
}

.flow-container__control {
  position:absolute;
  padding:10px;
  top: 0;
  left: 20px;
  display:flex;
  flex-flow:row;
  justify-content: center;
  align-items: center;
  color: #fff;
  background: var(--background-transparent);
  transition: all var(--transition-speed);
}

.flow-container__control button {
  display:flex;
  justify-content: center;
  margin:0;
  padding:14px;

  /*color:#333;*/
}

.flow-container__info {
  position:absolute;
  bottom:10px;
  left:10px;
  padding:2px;
  font-size:9px;
}

.flow-view {
  border:none;
  position:relative;
  fill:transparent;
}

.flow-view.activity {
  cursor:crosshair;
}

.flow-selector {
  pointer-events:none;
  opacity:0;
}

.flow-selector.flow-selector--selecting {
  opacity:1;
}

.flow-node__context-menu {
  box-shadow: 0 1px 4px  rgba(0,0,0,0.2);
  display:flex;
  flex-flow: column;
  justify-content: start;
  align-items: stretch;
  width:180px;
}

.flow-node__context-menu .item {
  padding:10px 20px;
  cursor: pointer;
  width:100%;
}

.flow-node__context-menu hr {
  width:90%;
  border:none;
  border-bottom: solid 1px rgba(150,150,150,0.2);
}

.flow-node__context-menu button {
  text-align:left;
}

</style>
