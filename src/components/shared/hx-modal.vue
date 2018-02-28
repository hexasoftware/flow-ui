<template>
  <transition name="hx-modal">
    <div class="hx-modal__mask" @mousedown="$emit('close')" tabindex="1" @keydown.esc="$emit('close')">
      <div class="hx-modal__wrapper" >
        <div class="hx-modal__container" @mousedown.stop>
          <div class="hx-modal__header">
            <slot name="header"/>
            <button
              class="hx-modal__close-button"
              @click="$emit('close')">X
            </button>
          </div>

          <div class="hx-modal__body">
            <slot name="body"/>
          </div>

          <div class="hx-modal__footer">
            <slot name="footer"/>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  mounted () {
    this.$el.focus()
  }
}
</script>
<style lang="css" >

.hx-modal__mask {
  outline:none;
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity var(--transition-speed) ease;
}

.hx-modal__wrapper {
  display: table-cell;
  vertical-align: middle;
}

.hx-modal__container {
  width: 50%;
  margin: 0 auto;
  padding: 10px 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all var(--transition-speed) ease;
  font-family: Helvetica, Arial, sans-serif;
}

.hx-modal__header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-top: 0;
}

.hx-modal__header h3,
.hx-modal__header h4
{
  margin:0;
}

.hx-modal__body {
  margin: 0 0;
  padding: 20px 0;
}

.hx-modal__footer {
  display:flex;
  width:100%;
  justify-content: space-between;
  align-items: center;
  text-align:right;
  flex-basis:40px;
}

.hx-modal__close-button {
  border:none;
  font-weight:bold;
  font-size:1em;
  outline:none;
  padding:6px 8px;
  margin-bottom:10px;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.hx-modal-enter {
  opacity: 0;
}

.hx-modal-leave-active {
  opacity: 0;
}

.hx-modal-enter .hx-modal__container,
.hx-modal-leave-active .hx-modal__container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
