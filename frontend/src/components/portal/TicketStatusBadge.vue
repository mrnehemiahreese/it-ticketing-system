<template>
  <v-chip :color="statusColor" size="small" :prepend-icon="statusIcon">
    {{ statusText }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusConfig = {
  OPEN: { color: 'success', icon: 'mdi-circle', text: 'Open' },
  IN_PROGRESS: { color: 'info', icon: 'mdi-progress-clock', text: 'In Progress' },
  PENDING: { color: 'warning', icon: 'mdi-pause-circle', text: 'Pending' },
  RESOLVED: { color: 'primary', icon: 'mdi-check-circle', text: 'Resolved' },
  CLOSED: { color: 'grey', icon: 'mdi-close-circle', text: 'Closed' },
  REOPENED: { color: 'warning', icon: 'mdi-replay', text: 'Reopened' }
}

const statusColor = computed(() => statusConfig[props.status]?.color || 'grey')
const statusIcon = computed(() => statusConfig[props.status]?.icon || 'mdi-circle')
const statusText = computed(() => statusConfig[props.status]?.text || props.status)
</script>
