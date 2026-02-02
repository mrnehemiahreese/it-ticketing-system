<template>
  <v-card
    class="ticket-card"
    elevation="2"
    :to="{ name: 'TicketDetail', params: { id: ticket.id } }"
    hover
  >
    <v-card-title class="d-flex align-center">
      <div class="flex-grow-1">
        <div class="text-subtitle-2 text-grey mb-1">
          {{ ticket.ticketNumber }}
        </div>
        <div class="text-body-1 font-weight-medium">
          {{ ticket.title }}
        </div>
      </div>

      <div class="ml-4">
        <StatusChip :status="ticket.status" />
      </div>
    </v-card-title>

    <v-card-text>
      <p class="text-body-2 text-grey-darken-1 mb-3">
        {{ truncate(ticket.description, 150) }}
      </p>

      <v-divider class="my-3" />

      <div class="d-flex align-center flex-wrap ga-3">
        <PriorityChip :priority="ticket.priority" />

        <v-chip size="small" variant="outlined">
          <v-icon start size="small">
            {{ getCategoryIcon(ticket.category) }}
          </v-icon>
          {{ getCategoryLabel(ticket.category) }}
        </v-chip>

        <v-spacer />

        <div class="d-flex align-center text-caption text-grey">
          <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
          {{ formatRelativeTime(ticket.createdAt) }}
        </div>
      </div>

      <v-divider class="my-3" />

      <div class="d-flex align-center justify-space-between">
        <div v-if="ticket.createdBy" class="d-flex align-center">
          <v-avatar
            :color="getAvatarColor(ticket.createdBy.fullname || ticket.createdBy.username)"
            size="32"
            class="mr-2"
          >
            <span class="text-caption">
              {{ getInitials(ticket.createdBy.fullname || ticket.createdBy.username) }}
            </span>
          </v-avatar>
          <div>
            <div class="text-caption font-weight-medium">
              {{ ticket.createdBy.fullname || ticket.createdBy.username }}
            </div>
            <div class="text-caption text-grey">
              Created by
            </div>
          </div>
        </div>
        <div v-else class="d-flex align-center">
          <v-avatar color="grey" size="32" class="mr-2">
            <span class="text-caption">?</span>
          </v-avatar>
          <div>
            <div class="text-caption font-weight-medium text-grey">Unknown</div>
            <div class="text-caption text-grey">Created by</div>
          </div>
        </div>

        <div v-if="ticket.assignedTo" class="d-flex align-center">
          <v-avatar
            :color="getAvatarColor(ticket.assignedTo.fullname || ticket.assignedTo.username)"
            size="32"
            class="mr-2"
          >
            <span class="text-caption">
              {{ getInitials(ticket.assignedTo.fullname || ticket.assignedTo.username) }}
            </span>
          </v-avatar>
          <div>
            <div class="text-caption font-weight-medium">
              {{ ticket.assignedTo.fullname || ticket.assignedTo.username }}
            </div>
            <div class="text-caption text-grey">
              Assigned to
            </div>
          </div>
        </div>
      </div>

      <div v-if="ticket.comments?.length || ticket.attachments?.length" class="mt-3 d-flex ga-4">
        <div v-if="ticket.comments?.length" class="text-caption text-grey">
          <v-icon size="small" class="mr-1">mdi-comment</v-icon>
          {{ ticket.comments.length }}
        </div>
        <div v-if="ticket.attachments?.length" class="text-caption text-grey">
          <v-icon size="small" class="mr-1">mdi-paperclip</v-icon>
          {{ ticket.attachments.length }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { truncate, formatRelativeTime, getInitials, getAvatarColor } from '@/utils/helpers'
import { TICKET_CATEGORY_LABELS, TICKET_CATEGORY_ICONS } from '@/utils/constants'
import StatusChip from './StatusChip.vue'
import PriorityChip from './PriorityChip.vue'

defineProps({
  ticket: {
    type: Object,
    required: true
  }
})

function getCategoryLabel(category) {
  return TICKET_CATEGORY_LABELS[category] || category
}

function getCategoryIcon(category) {
  return TICKET_CATEGORY_ICONS[category] || 'mdi-dots-horizontal'
}
</script>

<style scoped>
.ticket-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.ticket-card:hover {
  transform: translateY(-4px);
}
</style>
