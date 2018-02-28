export default{
  'Input': {
    categories: ['core'],
    output: {type: 'interface {}'},
    style: { color: '#686', shape: 'circle' },
    props: {'input': ''} // should be sent in the node
  },
  'Var': {
    categories: ['core'],
    inputs: [{type: 'interface {}', name: 'initial'}],
    output: {type: 'interface {}'},
    style: { color: '#88a', shape: 'circle' },
    props: {'variable name': ''}
  },
  'SetVar': {
    categories: ['core'],
    inputs: [{type: 'interface {}', name: 'value'}],
    output: {type: 'interface {}'},
    style: { color: '#88a', shape: 'circle' },
    props: {'variable name': ''}
  },
  'Portal From': {
    categories: ['core'],
    output: {type: 'interface {}'},
    style: { color: '#888', shape: 'portal' },
    props: {'portal from': ''}
  },

  /* 'Portal In': {
    categories: ['core'],
    inputs: [{type: 'interface {}'}],
    style: {color: '#ba5a00', shape: 'circle'},
    props: {'portal name': ''}
  },
  'Portal Out': {
    categories: ['core'],
    output: {type: 'interface {}'},
    style: {color: '#085798', shape: 'circle'},
    props: {'portal name': ''}
  }, */
  'Comment': {
    categories: ['core'],
    style: {color: '#444'}
  },
  'Notify': {
    categories: ['flow-web'],
    inputs: [{type: 'interface {}'}, {type: 'string', name: 'msg'}],
    output: {type: 'interface {}'},
    style: {color: '#665'}
  },
  'Log': {
    categories: ['flow-web'],
    output: {type: 'io.Writer'},
    style: {color: '#665'}
  }
}
