
import store from '@/store'
import utils from '@/utils/utils'

// This should be moved to state
export default {
  charSizeW: 8,
  charSizeH: 14,
  shapeOpts: {
    'circle': {
      textWrap: 'any'
    },
    'portal': {
      textWrap: 'white-space',
      eDim: {x: -20, y: -20, width: 40, height: 40}
    },
    default: {
      textWrap: 'white-space'
    }
  },
  shape (node) {
    const nodeStyle = store.getters['flow/registry'][node.src].style || {}
    return nodeStyle && nodeStyle.shape
  },

  labelDim (node) {
    const shape = this.shape(node)
    let wrapThreshold = 8 // initial wrap threshold
    const opt = this.shapeOpts[shape] || this.shapeOpts.default

    const label = utils.textWrap(node.label, wrapThreshold, opt.textWrap)

    let charWidth = 0
    let charHeight = label.length
    for (let l of label) {
      if (charWidth < l.length) {
        charWidth = l.length
      }
    }

    const ret = {
      width: charWidth * this.charSizeW,
      height: charHeight * this.charSizeH
    }
    return ret
  },
  /*
   * @return a rect
   */
  nodeDim (node) {
    const ldim = this.labelDim(node)
    const inputs = store.getters['flow/registry'][node.src].inputs || []
    const shape = this.shape(node)
    let width = ldim.width + 46
    let height = Math.max(ldim.height + 20, 60, inputs.length * 25)
    if (shape === 'circle') {
      width = height = Math.max(width, height)
    }
    const ret = {
      x: -width / 2,
      y: -height / 2,
      width: width,
      height: height
    }
    let extraDim = this.shapeOpts[shape] && this.shapeOpts[shape].eDim
    if (extraDim) {
      ret.x += extraDim.x
      ret.y += extraDim.y
      ret.width += extraDim.width
      ret.height += extraDim.height
    }
    return ret
  }

}
