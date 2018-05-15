<template>
  <div id="q-app">
    <transition name="fade">
    <router-view/>
    </transition>
    <navbar></navbar>
  </div>
</template>

<script>
import Navbar from './pages/elements/Navbar'
export default {
  name: 'App',
  components: {
    'navbar': Navbar
  }
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: all .25s ease;
  transition: all .25s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.fade-enter, .fade-leave-active {
  opacity: 0;
  transform: translateY(20px);
}

</style>
