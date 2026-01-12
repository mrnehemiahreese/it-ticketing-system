<template>
    <div>
      <h1 class="text-h4 font-weight-bold mb-6">Dashboard</h1>

      <!-- Stats Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Total Tickets"
            :value="stats.total"
            icon="mdi-ticket"
            icon-color="primary"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Open Tickets"
            :value="stats.open"
            icon="mdi-ticket-outline"
            icon-color="info"
            subtitle="+12% from last week"
            subtitle-color="text-success"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="In Progress"
            :value="stats.inProgress"
            icon="mdi-clock-outline"
            icon-color="warning"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Resolved"
            :value="stats.resolved"
            icon="mdi-check-circle"
            icon-color="success"
            :progress="resolvedPercentage"
            progress-color="success"
          />
        </v-col>
      </v-row>

      <!-- Priority Stats -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="High Priority"
            :value="stats.high"
            icon="mdi-alert"
            icon-color="error"
            color="red-lighten-5"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Medium Priority"
            :value="stats.medium"
            icon="mdi-minus"
            icon-color="warning"
            color="orange-lighten-5"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Low Priority"
            :value="stats.low"
            icon="mdi-chevron-down"
            icon-color="grey"
            color="grey-lighten-4"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Closed Tickets"
            :value="stats.closed"
            icon="mdi-close-circle"
            icon-color="grey"
            color="grey-lighten-4"
          />
        </v-col>
      </v-row>

      <!-- Charts and Recent Tickets -->
      <v-row>
        <!-- Recent Tickets -->
        <v-col cols="12" md="8">
          <v-card elevation="2">
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Recent Tickets</span>
              <v-btn
                variant="text"
                color="primary"
                :to="{ name: 'Tickets' }"
              >
                View All
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-title>

            <v-divider />

            <v-list v-if="recentTickets.length > 0">
              <template v-for="(ticket, index) in recentTickets" :key="ticket.id">
                <v-list-item
                  :to="{ name: 'TicketDetail', params: { id: ticket.id } }"
                  class="px-4"
                >
                  <template v-slot:prepend>
                    <v-avatar
                      :color="getAvatarColor(ticket.createdBy.fullname)"
                      size="40"
                    >
                      <span class="text-caption">
                        {{ getInitials(ticket.createdBy.fullname) }}
                      </span>
                    </v-avatar>
                  </template>

                  <v-list-item-title>
                    {{ ticket.title }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    {{ ticket.ticketNumber }} &middot; {{ formatRelativeTime(ticket.createdAt) }}
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <div class="d-flex ga-2">
                      <PriorityChip :priority="ticket.priority" />
                      <StatusChip :status="ticket.status" />
                    </div>
                  </template>
                </v-list-item>

                <v-divider v-if="index < recentTickets.length - 1" />
              </template>
            </v-list>

            <v-card-text v-else class="text-center py-8">
              <v-icon size="64" color="grey">mdi-ticket-outline</v-icon>
              <p class="text-grey mt-4">No recent tickets</p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Quick Actions -->
        <v-col cols="12" md="4">
          <v-card elevation="2" class="mb-4">
            <v-card-title>Quick Actions</v-card-title>
            <v-divider />
            <v-card-text>
              <v-btn
                color="primary"
                size="large"
                block
                class="mb-3"
                :to="{ name: 'CreateTicket' }"
              >
                <v-icon start>mdi-plus</v-icon>
                Create New Ticket
              </v-btn>

              <v-btn
                color="secondary"
                size="large"
                block
                variant="outlined"
                :to="{ name: 'MyTickets' }"
              >
                <v-icon start>mdi-ticket-account</v-icon>
                My Tickets
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Activity Feed -->
          <v-card elevation="2">
            <v-card-title>Recent Activity</v-card-title>
            <v-divider />
            <v-list density="compact">
              <v-list-item
                v-for="activity in recentActivity"
                :key="activity.id"
              >
                <template v-slot:prepend>
                  <v-icon :color="activity.color" size="small">
                    {{ activity.icon }}
                  </v-icon>
                </template>

                <v-list-item-title class="text-caption">
                  {{ activity.message }}
                </v-list-item-title>

                <v-list-item-subtitle class="text-caption">
                  {{ formatRelativeTime(activity.timestamp) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuery, useSubscription } from '@vue/apollo-composable'
import { useTicketStore } from '@/stores/ticket'
import { GET_TICKETS } from '@/graphql/queries'
import { NEW_TICKET_SUBSCRIPTION } from '@/graphql/subscriptions'
import { formatRelativeTime, getInitials, getAvatarColor } from '@/utils/helpers'
import StatsCard from '@/components/common/StatsCard.vue'
import StatusChip from '@/components/tickets/StatusChip.vue'
import PriorityChip from '@/components/tickets/PriorityChip.vue'

const ticketStore = useTicketStore()

// Fetch recent tickets
const { result, loading } = useQuery(GET_TICKETS)

const recentTickets = computed(() => result.value?.tickets || [])

// Subscribe to new tickets
const { onResult: onNewTicket } = useSubscription(NEW_TICKET_SUBSCRIPTION)

onNewTicket((data) => {
  if (data.data?.newTicket) {
    const newTicket = data.data.newTicket
    // Check if ticket is not already in list
    if (!recentTickets.value.find(t => t.id === newTicket.id)) {
      // Insert at the beginning to show latest tickets first
      recentTickets.value.unshift(newTicket)
      // Keep only the 10 most recent
      if (recentTickets.value.length > 10) {
        recentTickets.value.pop()
      }
      // Update store and activity log
      ticketStore.addTicket(newTicket)
      addActivityLog({
        message: `New ticket created: ${newTicket.ticketNumber}`,
        icon: 'mdi-ticket-plus',
        color: 'primary'
      })
    }
  }
})

// Populate store with tickets for stats computation
watch(() => result.value?.tickets, (tickets) => {
  if (tickets) {
    ticketStore.setTickets(tickets)
  }
}, { immediate: true })

// Stats from store
const stats = computed(() => ticketStore.ticketStats)

const resolvedPercentage = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.resolved / stats.value.total) * 100)
})

// Activity log with real-time updates
const recentActivity = ref([
  {
    id: 1,
    message: 'Recent activity will appear here',
    timestamp: new Date(),
    icon: 'mdi-information',
    color: 'info'
  }
])

function addActivityLog(activity) {
  const newActivity = {
    id: recentActivity.value.length + 1,
    ...activity,
    timestamp: new Date()
  }
  recentActivity.value.unshift(newActivity)
  // Keep only the 5 most recent activities
  if (recentActivity.value.length > 5) {
    recentActivity.value.pop()
  }
}

onMounted(() => {
  // Update ticket store when data is loaded
  if (recentTickets.value.length > 0) {
    ticketStore.setTickets(recentTickets.value)
  }
})
</script>
