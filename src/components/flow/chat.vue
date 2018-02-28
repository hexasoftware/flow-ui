<template>
  <div class="flow-chat" :class="{active:active}">
    <button class="flow-chat__toggle" @click="active=!active">=</button>
    <div class="flow-chat__area">
      <div class="flow-chat__container">

        <input
          class="handle"
          type="text"
          :value="handle"
          @blur="HANDLE_UPDATE($event.target.value)"
          @keyup.enter="HANDLE_UPDATE($event.target.value);$event.target.blur()">
        <div ref="messages" class="flow-chat__messages">
          <div v-for="m in events" class="message">
            <div class="handle">
              <div class="name">{{ m.handle }} <span v-if="m.type!='msg'">{{ m.type }}</span></div>
              <div class="time">{{ m.time | time }}</div>
            </div>
            <div class="text">{{ m.message }}</div>
          </div>
        </div>
        <input tabindex="-1" ref="input" class="message" @keyup.enter="send" type="text" v-model="input">
      </div> <!-- /container -->

      <div class="flow-chat__users">
        <div class="flow-chat__user" v-for="u in userList">
          <!--<img class="flow-chat__user-icon" src="../assets/icons/user.svg">-->
          <icon-user class="flow-chat__user-icon"/> <span>{{ u }}</span>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import IconUser from '@/assets/icons/user.svg'
import utils from '@/utils/utils'

// Load handle from storage
export default {
  components: {IconUser},
  filters: {
    time (value) {
      const d = new Date(value)
      const hours = utils.padStart(d.getHours(), '0', 2)
      const minutes = utils.padStart(d.getMinutes(), '0', 2)
      let msg = `${hours}:${minutes}`
      return msg
    }
  },
  data () {
    return {
      active: false,
      // handle: storedHandle,
      // events: [],
      // userList: [],
      input: ''
    }
  },
  computed: {
    ...mapGetters('chat', ['userList', 'events', 'handle'])
  },

  watch: {
    active (val, oldVal) {
      if (val === true && oldVal === false) {
        this.$refs.input.focus()
      }
    },
    events (val) {
      const height = this.$refs.messages.clientHeight
      if (this.$refs.messages.scrollTop + height >= this.$refs.messages.scrollHeight) {
        this.$nextTick(() => {
          this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
        })
      }
      /* if (this.active === false) {
        if (val.some(e => e.type === 'msg')) {
          this.active = true
        }
      } */
    }
  },
  created () {
    this.subscription = this.$store.subscribe(mut => {
      if (mut.type === 'chat/EVENT_ADD' && mut.payload.type === 'msg') {
        if (this.active) { return }
        this.NOTIFICATION_ADD(`<b>${mut.payload.handle}:</b> ${mut.payload.message}`)
      }
    })
  },
  beforeDestroy () {
    this.subscription()
  },

  methods: {
    ...mapActions('flow', ['NOTIFICATION_ADD']),
    ...mapActions('chat', ['EVENT_SEND', 'HANDLE_UPDATE', 'CHAT_JOIN']),
    send () {
      const msg = this.input
      if (msg.trim() === '') { return }
      this.input = ''
      const msgEvent = {type: 'msg', handle: this.handle, message: msg, time: new Date()}
      this.EVENT_SEND(msgEvent)
    }
  }
}

</script>
<style>
.flow-chat {
  height:100%;
  box-sizing:border-box;
  position:relative;
  width:0;
  transition: all var(--transition-speed);
}

.flow-chat.active {
  width:530px;
}

.flow-chat__toggle {
  user-select:none;
  cursor: pointer;
  position:absolute;
  display:flex;
  justify-content: center;
  align-items: center;
  width:30px;
  height:50px;
  left:-29px;
  top:calc(50% - 25px);

}

.flow-chat__area {
  height:100%;
  overflow:hidden;
  display:flex;
  flex-flow:row;
  padding:8px 0;
}

.flow-chat__container {
  height:100%;
  display:flex;
  flex-flow:column;
  flex:1;
  padding:0 8px;
}

.flow-chat__container >*:not(last-child) {
  margin-bottom:10px;
}

.flow-chat__users {
  flex-basis:100px;
  padding:20px 8px;

}

.flow-chat__user {
  display:flex;
  flex-flow:row;
  justify-content: space-between;
  align-items: center;

}

.flow-chat__user-icon{
  height:10px;
  width:auto;
}

.flow-chat__user span {
  text-align:center;
  flex:1;
  width: 100px;
  overflow:hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.flow-chat__messages {
  font-size:12px;
  overflow-y:scroll;
  min-width:300px;
  flex:1;
}

.flow-chat__messages .message{
  padding:2px 2px 12px 2px;

}

.flow-chat__messages .handle {
  display:flex;
  flex-flow:row;
  justify-content: space-between;
  align-items: center;
  padding-top:2px;

}

.flow-chat__messages .handle .name {
  padding-bottom:4px;
}

.flow-chat__messages .handle .time{
  font-weight:normal;
  font-size:8px;
}

.flow-chat__messages .text {
  padding-top:0;
  padding-left:9px;
}

</style>
