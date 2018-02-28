import m from './mutation-types'
import flowService from '@/services/flowservice'

export default {
  [m.EVENT_SEND] (ctx, msg) {
    flowService.chatEvent(msg)
  },
  [m.EVENT_ADD] ({commit}, event) {
    commit(m.EVENT_ADD, event)
  },
  [m.USERLIST_UPDATE] ({commit}, userlist) {
    commit(m.USERLIST_UPDATE, userlist)
  },
  [m.HANDLE_UPDATE] (ctx, name) {
    ctx.commit(m.HANDLE_UPDATE, name)
    flowService.chatRename(name)
  },
  [m.CHAT_JOIN] (ctx, v) {
    flowService.chatJoin(v.handle, v.sessId)
  }
}
