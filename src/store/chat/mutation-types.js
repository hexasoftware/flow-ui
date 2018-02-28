var types = [
  'USERLIST_UPDATE',
  'EVENT_ADD',
  'EVENT_SEND',
  'EVENTS_UPDATE',
  'HANDLE_UPDATE',
  'CHAT_JOIN'
]

const obj = {}
for (let k of types) {
  obj[k] = k
}

module.exports = obj
