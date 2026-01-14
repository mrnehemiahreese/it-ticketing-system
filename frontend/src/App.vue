<template>
  <v-app>
    <template v-if="currentLayout === 'blank'">
      <router-view />
    </template>
    <template v-else>
      <MainLayout>
        <router-view />
      </MainLayout>
    </template>
  </v-app>
</template>

<script setup>
import { computed, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import MainLayout from "@/components/layout/MainLayout.vue"
import { useThemeStore } from "@/stores/theme"
import { useAuthStore } from "@/stores/auth"

const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const currentLayout = computed(() => route.meta.layout || "default")

// Initialize theme on mount
onMounted(() => {
  themeStore.init()
})

// Watch for route changes to portal and update theme
watch(
  () => route.path,
  (newPath) => {
    themeStore.applyTheme()
  }
)

// Watch for auth changes
watch(
  () => authStore.isCustomer,
  () => {
    themeStore.applyTheme()
  }
)
</script>
