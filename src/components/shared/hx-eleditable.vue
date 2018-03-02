Content editable wrapper
<template>
  <pre
    tabindex="1"
    class="hx-eleditable content-input"
    contentEditable="true"
    :placeholder="placeholder"
    v-html="local"
    @focus="focus"
    @input="update"
    @keydown.stop
  />
</template>
<script>
export default {
  props: {
    'value': {type: String, default: ''},
    'placeholder': {type: String, default: ''}
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
.hx-eleditable{
  position:relative;
}

.hx-eleditable[contenteditable=true]:empty:before{
  cursor:text;
  position:absolute;
  top:0;right:0;left:0;bottom:0;
  padding:10px;
  opacity:0.35;
  content: attr(placeholder);
  display: block;
}
</style>
