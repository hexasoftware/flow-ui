<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
* {
  box-sizing:border-box;
}

#app {
  position:relative;
  padding:0;
  display:flex;
  height:100%;
  flex-flow:column;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
