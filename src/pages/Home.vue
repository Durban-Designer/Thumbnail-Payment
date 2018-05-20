<template>
  <div class="main">
  </div>
</template>

<script>
export default {
  name: 'home',
  props: ['logged'],
  created () {
    let vue = this
    if (vue.logged === false) {
      vue.$router.push('/login')
    } else {
      vue.$router.push('/invoice')
    }
  }
}
</script>

<style scoped lang="less">
  .main {
  }
</style>
