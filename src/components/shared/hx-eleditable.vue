Content editable wrapper
<template>
  <pre
    tabindex="1"
    class="content-input"
    contentEditable="true"
    v-html="local"
    @focus="focus"
    @input="update"
    @keydown.stop
  />
</template>
<script>
export default {
  props: {
    'value': {type: String, default: ''}
  },
  data () {
    return {
      local: ''
    }
  },
  watch: {
    value (val, oldVal) {
      if (val === this.$el.innerText) { return }
      this.local = val
    }
  },
  mounted () {
    this.local = this.value
  },
  methods: {
    focus (ev) {
      if (document.body.createTextRange) {
        const range = document.body.createTextRange()
        range.moveToElementText(this.$el)
        range.select()
      } else if (window.getSelection) {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(this.$el)
        selection.removeAllRanges()
        selection.addRange(range)
      }
      // console.log('Focusing')
      // document.execCommand('selectAll', false, null)
    },
    update (ev) {
      this.$emit('input', this.$el.innerText)
    }
  }

}
</script>
<style>
</style>
