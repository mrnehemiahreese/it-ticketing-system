<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between">
      <span>Filters</span>
      <v-btn
        variant="text"
        size="small"
        @click="clearFilters"
      >
        Clear All
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text>
      <!-- Status Filter -->
      <div class="mb-4">
        <div class="text-subtitle-2 mb-2">Status</div>
        <v-chip-group
          v-model="localFilters.status"
          multiple
          column
          @update:modelValue="applyFilters"
        >
          <v-chip
            v-for="status in statusOptions"
            :key="status.value"
            :value="status.value"
            :color="status.color"
            filter
            variant="outlined"
          >
            {{ status.label }}
          </v-chip>
        </v-chip-group>
      </div>

      <v-divider class="my-4" />

      <!-- Priority Filter -->
      <div class="mb-4">
        <div class="text-subtitle-2 mb-2">Priority</div>
        <v-chip-group
          v-model="localFilters.priority"
          multiple
          column
          @update:modelValue="applyFilters"
        >
          <v-chip
            v-for="priority in priorityOptions"
            :key="priority.value"
            :value="priority.value"
            :color="priority.color"
            filter
            variant="outlined"
          >
            {{ priority.label }}
          </v-chip>
        </v-chip-group>
      </div>

      <v-divider class="my-4" />

      <!-- Category Filter -->
      <div class="mb-4">
        <div class="text-subtitle-2 mb-2">Category</div>
        <v-chip-group
          v-model="localFilters.category"
          multiple
          column
          @update:modelValue="applyFilters"
        >
          <v-chip
            v-for="category in categoryOptions"
            :key="category.value"
            :value="category.value"
            filter
            variant="outlined"
          >
            <v-icon start size="small">{{ category.icon }}</v-icon>
            {{ category.label }}
          </v-chip>
        </v-chip-group>
      </div>

      <v-divider class="my-4" />

      <!-- Assignee Filter -->
      <div class="mb-4">
        <div class="text-subtitle-2 mb-2">Assigned To</div>
        <v-select
          v-model="localFilters.assignedTo"
          :items="agents"
          item-title="name"
          item-value="id"
          placeholder="All agents"
          variant="outlined"
          density="comfortable"
          clearable
          @update:modelValue="applyFilters"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from "vue"
import {
  TICKET_STATUS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_PRIORITY,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_COLORS,
  TICKET_CATEGORY,
  TICKET_CATEGORY_LABELS,
  TICKET_CATEGORY_ICONS
} from "@/utils/constants"

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      status: [],
      priority: [],
      category: [],
      assignedTo: null
    })
  },
  agents: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(["update:modelValue", "apply"])

const localFilters = ref({ ...props.modelValue })

// Status options
const statusOptions = Object.keys(TICKET_STATUS).map(key => ({
  value: TICKET_STATUS[key],
  label: TICKET_STATUS_LABELS[key],
  color: TICKET_STATUS_COLORS[key]
}))

// Priority options
const priorityOptions = Object.keys(TICKET_PRIORITY).map(key => ({
  value: TICKET_PRIORITY[key],
  label: TICKET_PRIORITY_LABELS[key],
  color: TICKET_PRIORITY_COLORS[key]
}))

// Category options
const categoryOptions = Object.keys(TICKET_CATEGORY).map(key => ({
  value: TICKET_CATEGORY[key],
  label: TICKET_CATEGORY_LABELS[key],
  icon: TICKET_CATEGORY_ICONS[key]
}))

watch(() => props.modelValue, (newValue) => {
  localFilters.value = { ...newValue }
}, { deep: true })

function applyFilters() {
  emit("update:modelValue", { ...localFilters.value })
  emit("apply", { ...localFilters.value })
}

function clearFilters() {
  localFilters.value = {
    status: [],
    priority: [],
    category: [],
    assignedTo: null
  }
  applyFilters()
}
</script>
