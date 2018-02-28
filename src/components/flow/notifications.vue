<template>
  <div
    :class="{active: msgs.length>0 && active}"
    class="flow-notification"
  >
    <icon-eye
      width="16"
      height="16"
      class="flow-notification__eye"/>
    <p
      :key = "i"
      v-for="(m,i) of msgs"
      v-html="m"/>

  </div>
</template>
<script>
import {mapActions} from 'vuex'
import IconEye from '@/assets/icons/eye.svg'
export default {
  name: 'FlowNotification',
  components: {IconEye},
  data () {
    return {
      msgs: [],
      active: false
    }
  },
  watch: {
    '$store.state.flow.notifications' (val) {
      if (val.length === 0) {
        this.active = false
        return
      }
      let msgs = val
      if (msgs.length > 5) {
        msgs = msgs.slice(msgs.length - 5)
      }
      this.msgs = msgs

      this.active = true
      /* clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.active = false
      }, 5000) */
    }
  },
  methods: {
    ...mapActions('flow', ['NOTIFICATION_CLEAR'])
    /* transitionend () {
      if (!this.active) { // send Clear notifications
        // this.msgs = []
        // this.NOTIFICATION_CLEAR()
      }
    } */

  }
}
</script>
<style>
/* notifications */
.flow-notification {
  position:relative;
  pointer-events:none;
  user-select:none;
  opacity:0;
  position: fixed;
  z-index: 1000;
  padding: 20px;
  width: 50%;
  left: 50%;
  transform: translateX(-50%);
  bottom: 10%;
  background: var(--normal);
  color: var(--background);
  border: solid 1px rgba(150, 150, 150, 0.3);
  transition: opacity var(--transition-speed);
}

.flow-notification b {
  color: var(--primary-lighter);
}

/* trick to maintain under mouse */
.flow-notification:hover {
  border: solid 1px var(--primary);
  pointer-events:initial !important;
  user-select:initial !important;
  opacity:0.8 !important;
}

.flow-notification.active {
  /*pointer-events:initial;
  user-select:initial;*/
  opacity:0.6;
}

.flow-notification__eye {
  pointer-events:initial;
  position:absolute;
  right:5px;
  top:5px;
}

.flow-notification__eye > *{
  stroke: var(--background);
}

</style>
