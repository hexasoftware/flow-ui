var actions = [
  'REGISTRY_UPDATE',
  'SESSID_UPDATE',
  'DOCUMENT_UPDATE', 'DOCUMENT_SYNC',
  'ACTIVITY_UPDATE',
  'NODE_RAISE', 'NODE_UPDATE', 'NODE_ADD', 'NODE_REMOVE', 'NODE_INSPECT', 'NODE_PROCESS', 'NODE_TRAIN',
  'NODE_SELECTION_CLEAR', 'NODE_SELECTION_REMOVE', 'NODE_SELECTION_SET', 'NODE_SELECTION_ADD',
  'LINK_ADD', 'LINK_REMOVE',
  'TRIGGER_ADD', 'TRIGGER_REMOVE',
  'NOTIFICATION_ADD', 'NOTIFICATION_CLEAR'
]

const obj = {}

for (let k of actions) {
  obj[k] = k
}

module.exports = obj
