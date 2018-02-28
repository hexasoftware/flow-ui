<template>
  <g
    class="flow-node__activity"
    :status="nodeActivity.status"
    :class="{
      'flow-node__activity--running': nodeActivity.status == 'running',
      'flow-node__activity--waiting': nodeActivity.status == 'waiting',
      'flow-node__activity--finish-data': nodeActivity.status == 'finish' && nodeActivity.data,
      'flow-node__activity--finish': nodeActivity.status == 'finish' && !nodeActivity.data,
      'flow-node__activity--error': nodeActivity.status == 'error'
    }"
    @mousedown.stop.prevent="activityPointerDown"
  >
    <rect
      class="flow-node__activity-background"
      x="-12"
      y="-12"
      :width="ellapsed?65:24"
      height="24"
      rx="12"
    />

    <icon-refresh
      v-if="nodeActivity.status=='running'"
      v-bind="iconProps"
      class="flow-node__activity-icon" />
    <icon-wait
      v-else-if="nodeActivity.status=='waiting'"
      v-bind="iconProps"
      class="flow-node__activity-icon"/>
    <icon-data
      v-else-if="nodeActivity.status=='finish' && nodeActivity.data"
      v-bind="iconProps"
      class="flow-node__activity-icon"/>
    <icon-ok
      v-else-if="nodeActivity.status=='finish'"
      v-bind="iconProps"
      class="flow-node__activity-icon"/>
    <icon-fail
      v-else-if="nodeActivity.status=='error'"
      v-bind="iconProps"
      class="flow-node__activity-icon"/>
    <icon-question
      v-else
      v-bind="iconProps"
      class="flow-node__activity-icon flow-node__activity-unknown" />

    <text :class="{active:ellapsed}" class="flow-node__activity-time" x="13" y="4" fill="black">
      {{ ellapsed }}
    </text>
  </g>
</template>
<script>
import {mapGetters} from 'vuex'
import IconWait from '@/assets/icons/wait.svg'
import IconFail from '@/assets/icons/fail.svg'
import IconData from '@/assets/icons/data.svg'
import IconOk from '@/assets/icons/ok.svg'
import IconQuestion from '@/assets/icons/question.svg'
import IconRefresh from '@/assets/icons/refresh.svg'
import utils from '@/utils/utils'

export default {
  name: 'FlowNodeStatus',
  components: {IconWait, IconFail, IconData, IconOk, IconQuestion, IconRefresh},
  props: {
    nodeId: {type: String, default: ''}
  },
  data () {
    return {
      startTime: null,
      finishTime: null
    }
  },
  computed: {
    ...mapGetters('flow', ['activity']),
    nodeActivity () { // nodeActivity
      let ret = this.activity.nodes[this.nodeId]
      return ret
    },
    iconProps () {
      return {
        x: -9,
        y: -9,
        viewBox: '-4 -4 72 72',
        width: 18,
        height: 18
      }
    },
    ellapsed () {
      if (!this.startTime || !this.finishTime) return null
      let intervalms = this.finishTime - this.startTime
      if (intervalms < 0) {
        intervalms = 0
      }
      const min = Math.floor(intervalms / 60000)
      const sec = ((intervalms / 1000) % 60)

      return utils.padStart(min.toFixed(0), 2, '0') + ':' + utils.padStart(sec.toFixed(0), 2, '0')
    }
  },
  watch: {
    nodeActivity (val, oldVal) {
      this.recalcStartTime()
    }
  },
  mounted () {
    this.recalcStartTime()
    this.updateTime()
    // this._timeOut = setTimeout(this.updateTime, 999)
  },
  beforeDestroy () {
    clearTimeout(this._timeOut)
  },
  methods: {
    activityPointerDown () {
      this.$emit('activityPointerDown')
    },
    recalcStartTime () {
      this.startTime = null
      this.finishTime = null
      const serverStartTime = new Date(Date.parse(this.nodeActivity.startTime))
      if (!utils.dateIsValid(serverStartTime)) { return null }

      let serverTime = new Date(Date.parse(this.activity.serverTime))
      let serverEllapsed = serverTime.getTime() - serverStartTime.getTime()

      let localTime = new Date() // Local
      // Calculate difference with server time
      this.startTime = new Date(localTime - serverEllapsed)
      this.finishTime = null

      this.updateTime()
    },
    updateTime () {
      if (!utils.dateIsValid(new Date(Date.parse(this.nodeActivity.startTime)))) {
        return
      }
      const finish = new Date(Date.parse(this.nodeActivity.endTime))
      if (utils.dateIsValid(finish)) {
        // Set time from server
        this.startTime = new Date(Date.parse(this.nodeActivity.startTime))
        this.finishTime = finish
        return
      }
      this.finishTime = new Date()
      // this.finishTime = new Date(new Date().getTime() + 2000) // time correction why?
      this._timeOut = setTimeout(this.updateTime, 500)
    }

  }
}
</script>

<style>
.flow-node__activity {
  font-size:12px;
  opacity:0;
  user-select: none;
  pointer-events:none;
  transition: all var(--transition-speed);
}

.flow-view.flow-node--activity .flow-node__activity {
  opacity:0.8;
}

.flow-node__activity-background {
  stroke: rgba(0,0,0,0.2);
  transition: all var(--transition-speed);
}

.flow-node__activity-icon{
  width:20px;
  height:20px;
}

.flow-node__activity-time{
  opacity:0;
  width:0;
  transition: all var(--transition-speed);
}

.flow-node__activity-time.active{
  opacity:1;
}

.flow-node__activity-icon > * {
  transform-origin: 32px 32px;
  stroke-width: 6px;
  stroke: inherits;
}

.flow-node__activity--running
.flow-node__activity-icon > * {
  -webkit-animation: spin 1s infinite linear;
  -moz-animation: spin 1s infinite linear;
  animation: spin 1s infinite linear;
  stroke: #aa0;
}

.flow-node__activity--error
.flow-node__activity-icon  >* {
  stroke: #f22;
}

.flow-node__activity--waiting
.flow-node__activity-icon > * {
  -webkit-animation: shake 1s infinite linear;
  -moz-animation: shake 1s infinite linear;
  animation: shake 1s infinite linear;
}

/*
.flow-node__activity--finish-data {
  pointer-events: unset;
  cursor:pointer;
  }
  */

.flow-node__activity--finish-data
.flow-node__activity-icon > * {
  transform: scale(0.9) translateY(-3px);
  stroke: #4c4;
}

.flow-node__activity--finish
.flow-node__activity-icon > * {
  stroke: #2c2;
}

/*** ANIMATIONS ***/
@-moz-keyframes spin {
  from { -moz-transform: rotate(0deg); }
  to { -moz-transform: rotate(-360deg); }
}

@-webkit-keyframes spin {
  from { -webkit-transform: rotate(0deg); }
  to { -webkit-transform: rotate(-360deg); }
}

@keyframes spin {
  from {transform:rotate(0deg);}
  to {transform:rotate(-360deg);}
}

@keyframes shake {
  10%, 90% {
    transform: rotate(-2deg);
  }

  20%, 80% {
    transform: rotate(4deg);
  }

  30%, 50%, 70% {
    transform: rotate(-7deg);
  }

  40%, 60% {
    transform: rotate(7deg);
  }
}

</style>
