<template>
  <v-chip
    :color="priorityColor"
    :variant="variant"
    size="small"
    label
  >
    <v-icon v-if="showIcon" start size="small">
      {{ priorityIcon }}
    </v-icon>
    {{ priorityLabel }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue'
import { TICKET_PRIORITY_LABELS, TICKET_PRIORITY_COLORS } from '@/utils/constants'

const props = defineProps({
  priority: {
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

const priorityLabel = computed(() => TICKET_PRIORITY_LABELS[props.priority] || props.priority)
const priorityColor = computed(() => TICKET_PRIORITY_COLORS[props.priority] || 'grey')

const priorityIcon = computed(() => {
  const icons = {
    LOW: 'mdi-chevron-down',
    MEDIUM: 'mdi-minus',
    HIGH: 'mdi-chevron-up',
    URGENT: 'mdi-fire'
  }
  return icons[props.priority] || 'mdi-minus'
})
</script>
