<template>
    <div>
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold">My Tickets</h1>

        <v-btn color="primary" size="large" :to="{ name: 'CreateTicket' }">
          <v-icon start>mdi-plus</v-icon>
          Create Ticket
        </v-btn>
      </div>

      <!-- Stats -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Total Tickets"
            :value="myTickets.length"
            icon="mdi-ticket"
            icon-color="primary"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Open"
            :value="openCount"
            icon="mdi-ticket-outline"
            icon-color="info"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="In Progress"
            :value="inProgressCount"
            icon="mdi-clock-outline"
            icon-color="warning"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Resolved"
            :value="resolvedCount"
            icon="mdi-check-circle"
            icon-color="success"
          />
        </v-col>
      </v-row>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64" />
      </div>

      <!-- Tickets Grid -->
      <v-row v-else-if="myTickets.length > 0">
        <v-col v-for="ticket in myTickets" :key="ticket.id" cols="12" md="6" lg="4">
          <TicketCard :ticket="ticket" />
        </v-col>
      </v-row>

      <!-- Empty State -->
      <v-card v-else elevation="2" class="text-center py-12">
        <v-icon size="96" color="grey">mdi-ticket-outline</v-icon>
        <h3 class="text-h5 text-grey mt-4">No tickets yet</h3>
        <p class="text-grey mt-2">Create your first ticket to get started</p>
        <v-btn color="primary" class="mt-4" :to="{ name: 'CreateTicket' }">
          <v-icon start>mdi-plus</v-icon>
          Create Ticket
        </v-btn>
      </v-card>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuery, useSubscription } from '@vue/apollo-composable'
import { NEW_TICKET_SUBSCRIPTION } from "@/graphql/subscriptions"
import { GET_MY_TICKETS } from '@/graphql/queries'
import StatsCard from '@/components/common/StatsCard.vue'
import TicketCard from '@/components/tickets/TicketCard.vue'

const { result, loading } = useQuery(GET_MY_TICKETS)

const myTickets = computed(() => result.value?.myTickets || [])

const openCount = computed(() =>
  myTickets.value.filter(t => t.status === 'OPEN').length
)

const inProgressCount = computed(() =>
  myTickets.value.filter(t => t.status === 'IN_PROGRESS').length
)

const resolvedCount = computed(() =>
  myTickets.value.filter(t => t.status === 'RESOLVED').length
)
</script>
