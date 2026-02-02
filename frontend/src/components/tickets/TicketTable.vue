<template>
  <v-data-table
    :headers="headers"
    :items="tickets"
    :loading="loading"
    :items-per-page="20"
    :search="search"
    class="elevation-2"
    hover
    @click:row="handleRowClick"
  >
    <!-- Ticket Number -->
    <template v-slot:item.ticketNumber="{ item }">
      <span class="text-primary font-weight-medium">
        {{ item.ticketNumber }}
      </span>
    </template>

    <!-- Status -->
    <template v-slot:item.status="{ item }">
      <StatusChip :status="item.status" />
    </template>

    <!-- Priority -->
    <template v-slot:item.priority="{ item }">
      <PriorityChip :priority="item.priority" show-icon />
    </template>

    <!-- Category -->
    <template v-slot:item.category="{ item }">
      <v-chip size="small" variant="outlined">
        <v-icon start size="small">
          {{ getCategoryIcon(item.category) }}
        </v-icon>
        {{ getCategoryLabel(item.category) }}
      </v-chip>
    </template>

    <!-- Created By -->
    <template v-slot:item.createdBy="{ item }">
      <div v-if="item.createdBy" class="d-flex align-center">
        <v-avatar
          :color="getAvatarColor(item.createdBy.fullname || item.createdBy.username)"
          size="32"
          class="mr-2"
        >
          <span class="text-caption">
            {{ getInitials(item.createdBy.fullname || item.createdBy.username) }}
          </span>
        </v-avatar>
        <span>{{ item.createdBy.fullname || item.createdBy.username }}</span>
      </div>
      <span v-else class="text-grey">Unknown</span>
    </template>

    <!-- Assigned To -->
    <template v-slot:item.assignedTo="{ item }">
      <div v-if="item.assignedTo" class="d-flex align-center">
        <v-avatar
          :color="getAvatarColor(item.assignedTo.fullname || item.assignedTo.username)"
          size="32"
          class="mr-2"
        >
          <span class="text-caption">
            {{ getInitials(item.assignedTo.fullname || item.assignedTo.username) }}
          </span>
        </v-avatar>
        <span>{{ item.assignedTo.fullname || item.assignedTo.username }}</span>
      </div>
      <span v-else class="text-grey">Unassigned</span>
    </template>

    <!-- Created At -->
    <template v-slot:item.createdAt="{ item }">
      {{ formatDate(item.createdAt, true) }}
    </template>

    <!-- Actions -->
    <template v-slot:item.actions="{ item }">
      <v-btn
        icon="mdi-eye"
        variant="text"
        size="small"
        @click.stop="viewTicket(item)"
      />
    </template>

    <!-- Loading -->
    <template v-slot:loading>
      <v-skeleton-loader type="table-row@5" />
    </template>

    <!-- No data -->
    <template v-slot:no-data>
      <div class="text-center pa-8">
        <v-icon size="64" color="grey">mdi-ticket-outline</v-icon>
        <p class="text-h6 text-grey mt-4">No tickets found</p>
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { formatDate, getInitials, getAvatarColor } from '@/utils/helpers'
import { TICKET_CATEGORY_LABELS, TICKET_CATEGORY_ICONS } from '@/utils/constants'
import StatusChip from './StatusChip.vue'
import PriorityChip from './PriorityChip.vue'

defineProps({
  tickets: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  search: {
    type: String,
    default: ''
  }
})

const router = useRouter()

const headers = [
  { title: 'Ticket #', key: 'ticketNumber', sortable: true },
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Priority', key: 'priority', sortable: true },
  { title: 'Category', key: 'category', sortable: true },
  { title: 'Created By', key: 'createdBy', sortable: false },
  { title: 'Assigned To', key: 'assignedTo', sortable: false },
  { title: 'Created', key: 'createdAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

function handleRowClick(event, { item }) {
  router.push({ name: 'TicketDetail', params: { id: item.id } })
}

function viewTicket(ticket) {
  router.push({ name: 'TicketDetail', params: { id: ticket.id } })
}

function getCategoryLabel(category) {
  return TICKET_CATEGORY_LABELS[category] || category
}

function getCategoryIcon(category) {
  return TICKET_CATEGORY_ICONS[category] || 'mdi-dots-horizontal'
}
</script>

<style scoped>
:deep(.v-data-table__tr) {
  cursor: pointer;
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
