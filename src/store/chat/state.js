// init
let storedHandle = localStorage.getItem('handle')
if (!storedHandle || storedHandle === '') {
  storedHandle = 'someone'
}

export default {
  userList: [],
  events: [],
  handle: storedHandle
}
