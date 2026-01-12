<template>
  <v-chip :color="priorityColor" size="small" variant="outlined">
    {{ priorityText }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  priority: {
    type: String,
    required: true
  }
})

const priorityConfig = {
  LOW: { color: 'grey', text: 'Low' },
  MEDIUM: { color: 'info', text: 'Medium' },
  HIGH: { color: 'warning', text: 'High' },
  URGENT: { color: 'error', text: 'Urgent' }
}

const priorityColor = computed(() => priorityConfig[props.priority]?.color || 'grey')
const priorityText = computed(() => priorityConfig[props.priority]?.text || props.priority)
</script>
