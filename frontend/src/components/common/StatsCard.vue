<template>
  <v-card
    :color="color"
    class="stats-card"
    elevation="2"
  >
    <v-card-text>
      <div class="d-flex align-center justify-space-between">
        <div>
          <div class="text-h4 font-weight-bold mb-2">
            {{ value }}
          </div>
          <div class="text-subtitle-2">
            {{ title }}
          </div>
          <div v-if="subtitle" class="text-caption mt-1" :class="subtitleColor">
            {{ subtitle }}
          </div>
        </div>

        <v-avatar
          :color="iconColor"
          size="64"
          class="elevation-3"
        >
          <v-icon size="32" :color="iconTextColor">
            {{ icon }}
          </v-icon>
        </v-avatar>
      </div>
    </v-card-text>

    <v-progress-linear
      v-if="progress !== undefined"
      :model-value="progress"
      :color="progressColor"
      height="4"
    />
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'white'
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  iconTextColor: {
    type: String,
    default: 'white'
  },
  subtitle: {
    type: String,
    default: ''
  },
  subtitleColor: {
    type: String,
    default: 'text-grey'
  },
  progress: {
    type: Number,
    default: undefined
  },
  progressColor: {
    type: String,
    default: 'primary'
  }
})
</script>

<style scoped>
.stats-card {
  transition: transform 0.2s ease-in-out;
}

.stats-card:hover {
  transform: translateY(-4px);
}
</style>
