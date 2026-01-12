<template>
  <v-chip
    :color="statusColor"
    :variant="variant"
    size="small"
    label
  >
    <v-icon v-if="showIcon" start size="small">
      {{ statusIcon }}
    </v-icon>
    {{ statusLabel }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue'
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '@/utils/constants'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'flat'
  },
  showIcon: {
    type: Boolean,
    default: false
  }
})

const statusLabel = computed(() => TICKET_STATUS_LABELS[props.status] || props.status)
const statusColor = computed(() => TICKET_STATUS_COLORS[props.status] || 'grey')

const statusIcon = computed(() => {
  const icons = {
    OPEN: 'mdi-circle-outline',
    IN_PROGRESS: 'mdi-clock-outline',
    RESOLVED: 'mdi-check-circle',
    CLOSED: 'mdi-close-circle',
    ON_HOLD: 'mdi-pause-circle'
  }
  return icons[props.status] || 'mdi-circle'
})
</script>
