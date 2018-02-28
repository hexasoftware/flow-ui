// HTML5 DOM
let visible = document.hasFocus()
let changed = false
let title = document.title

window.addEventListener('focus', () => {
  changed = false
  document.title = title
  visible = true
})
window.addEventListener('blur', () => {
  visible = false
})

module.exports = {
  // window notification title
  activity () {
    if (!visible) {
      if (!changed) {
        document.title = '* ' + title
        changed = true
      }
    } else {
      if (changed) {
        document.title = title
        changed = false
      }
    }
  },
  createDrag (obj) {
    var x, y
    // Drag with threshold
    // we swap the drag function to the obj.drag if threshold achieved
    // if no drag function we set a dummy function
    let inDrop = (obj && obj.noDrag) || function () {}
    let inDrag = (ev) => {
      if (!x || !y) {
        x = ev.x
        y = ev.y
      }
      if (Math.abs(x - ev.x) > 10 ||
        Math.abs(y - ev.y) > 10) {
        inDrag = (obj && obj.drag) || function () {}
        inDrop = (obj && obj.drop) || function () {}

        obj && obj.dragStart && obj.dragStart(ev)
      }
    }

    const drag = (ev) => {
      inDrag(ev)
    }
    const drop = (ev) => {
      document.removeEventListener('mousemove', drag)
      document.removeEventListener('mouseup', drop)
      inDrop(ev)
    }
    document.addEventListener('mousemove', drag)
    document.addEventListener('mouseup', drop)
  },
  guid (n) {
    var text = ''
    if (!n) n = 5
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const d = new Date()

    text += possible[d.getMilliseconds() % possible.length]
    text += possible[d.getSeconds()]
    text += possible[d.getMinutes()]
    text += possible[d.getDate()]
    for (var i = 0; i < n; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

    return text
  },
  dateIsValid (d) {
    // Golang 0 date
    const invalidDate = -62135596800000
    if (Object.prototype.toString.call(d) === '[object Date]') {
      if (!isNaN(d.getTime())) { // d.valueOf() could also work
        if (d.getTime() === invalidDate) {
          return false
        }
        return true
      }
    }
    return false
  },

  textWrap (text, maxLen, opt) {
    const ret = []
    let parts = text.split(' ', -1)
    switch (opt) {
      case 'white-space':
        parts.forEach(n => { maxLen = Math.max(n.length + 1, maxLen) })
        break
      case 'any':
        // Break any word bigger than wrapThreshold
        let newParts = []
        parts.forEach(n => {
          while (n.length > maxLen) {
            const pre = n.substring(0, maxLen)
            newParts.push(pre)
            n = n.substr(maxLen)
          }
          newParts.push(n)
        })
        parts = newParts
        break
    }
    ret.push(parts[0])
    for (let i = 1; i < parts.length; i++) {
      let ri = ret.length - 1 // last
      if (ret[ret.length - 1].length + parts[i].length > maxLen) {
        ret.push(parts[i])
      } else {
        // we can add to same
        ret[ri] += ' ' + parts[i]
      }
    }
    return ret
  },
  fuzzysearch (needle, haystack) {
    var hlen = haystack.length
    var nlen = needle.length
    if (nlen > hlen) {
      return false
    }
    if (nlen === hlen) {
      if (needle === haystack) {
        return `<b>${needle}</b>`
      }
    }
    let ret = ''
    let j = 0
    let match = ''
    outer: for (let i = 0; i < nlen; i++) {
      if (match.length > 0) {
        ret += `<b>${match}</b>`
        match = ''
      }
      // let nch = needle.charCodeAt(i)
      let nch = needle[i]
      while (j < hlen) {
        let ch = haystack[j++]
        if (ch.toUpperCase() === nch.toUpperCase()) {
          match += `${ch}`
          continue outer
        }
        ret += ch
      }
      return false
    }
    if (match.length > 0) { ret += `<b>${match}</b>` }
    for (;j < hlen; j++) {
      ret += haystack[j]
    }
    return ret
  },
  padStart (str, targetLength, padString) {
    targetLength = targetLength >> 0 // truncate if number or convert non-number to 0;
    padString = String((typeof padString !== 'undefined' ? padString : ' '))
    if (this.length > targetLength) {
      return String(str)
    } else {
      targetLength = targetLength - str.length
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length) // append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(str)
    }
  }
}
