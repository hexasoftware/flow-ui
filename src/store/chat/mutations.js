import m from './mutation-types'

export default {
  [m.USERLIST_UPDATE] (state, userList) {
    state.userList = userList
  },
  [m.EVENT_ADD] (state, event) {
    state.events.push(event)
  },
  [m.EVENTS_UPDATE] (state, events) {
    state.events = events
  },
  [m.HANDLE_UPDATE] (state, handle) {
    state.handle = handle
    localStorage.setItem('handle', handle)
  }
}
