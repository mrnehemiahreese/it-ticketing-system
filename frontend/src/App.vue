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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'

const route = useRoute()

const currentLayout = computed(() => route.meta.layout || 'default')
</script>
