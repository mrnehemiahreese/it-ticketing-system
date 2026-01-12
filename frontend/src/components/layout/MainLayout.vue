<template>
  <div>
    <AppBar @toggle-drawer="drawer = !drawer" />

    <NavigationDrawer
      v-model="drawer"
      v-model:rail="rail"
    />

    <v-main>
      <v-container fluid class="pa-6">
        <slot />
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppBar from './AppBar.vue'
import NavigationDrawer from './NavigationDrawer.vue'

const drawer = ref(true)
const rail = ref(false)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
