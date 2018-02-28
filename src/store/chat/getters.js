export default {
  userList: state => state.userList,
  events: state => state.events,
  handle: state => state.handle
  // messages: state => state.events.filter(e => e.type === 'msg')
}
