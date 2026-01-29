<template>
    <div>
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold">All Tickets</h1>

        <v-btn
          color="primary"
          size="large"
          :to="{ name: 'CreateTicket' }"
        >
          <v-icon start>mdi-plus</v-icon>
          Create Ticket
        </v-btn>
      </div>

      <v-row>
        <!-- Filters Sidebar -->
        <v-col cols="12" md="3">
          <TicketFilters
            v-model="filters"
            :agents="agentsForFilter"
            @apply="applyFilters"
          />
        </v-col>

        <!-- Tickets List -->
        <v-col cols="12" md="9">
          <!-- Search and View Toggle -->
          <v-card elevation="2" class="mb-4">
            <v-card-text>
              <div class="d-flex align-center ga-4">
                <v-text-field
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  placeholder="Search tickets..."
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="flex-grow-1"
                  @input="debounceSearch"
                />

                <v-btn-toggle
                  v-model="viewMode"
                  mandatory
                  variant="outlined"
                  divided
                >
                  <v-btn value="table" icon="mdi-table" />
                  <v-btn value="grid" icon="mdi-view-grid" />
                </v-btn-toggle>
              </div>
            </v-card-text>
          </v-card>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            />
          </div>

          <!-- Table View -->
          <div v-else-if="viewMode === 'table'">
            <TicketTable
              :tickets="filteredTickets"
              :loading="loading"
              :search="search"
            />
          </div>

          <!-- Grid View -->
          <div v-else>
            <v-row v-if="filteredTickets.length > 0">
              <v-col
                v-for="ticket in filteredTickets"
                :key="ticket.id"
                cols="12"
                md="6"
                lg="4"
              >
                <TicketCard :ticket="ticket" />
              </v-col>
            </v-row>

            <!-- Empty State -->
            <v-card v-else elevation="2" class="text-center py-12">
              <v-icon size="96" color="grey">mdi-ticket-outline</v-icon>
              <h3 class="text-h5 text-grey mt-4">No tickets found</h3>
              <p class="text-grey mt-2">Try adjusting your filters or search query</p>
              <v-btn
                color="primary"
                class="mt-4"
                @click="clearAllFilters"
              >
                Clear Filters
              </v-btn>
            </v-card>
          </div>

          <!-- Pagination -->
          <v-card v-if="filteredTickets.length > 0" elevation="2" class="mt-4">
            <v-card-text>
              <div class="d-flex align-center justify-space-between">
                <div class="text-caption text-grey">
                  Showing {{ filteredTickets.length }} of {{ totalTickets }} tickets
                </div>

                <v-pagination
                  v-model="page"
                  :length="totalPages"
                  :total-visible="5"
                  @update:model-value="handlePageChange"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useSubscription } from '@vue/apollo-composable'
import { useTicketStore } from '@/stores/ticket'
import { NEW_TICKET_SUBSCRIPTION } from "@/graphql/subscriptions"
import { GET_TICKETS, GET_TECHNICIANS } from '@/graphql/queries'
import { debounce } from '@/utils/helpers'
import TicketTable from '@/components/tickets/TicketTable.vue'
import TicketCard from '@/components/tickets/TicketCard.vue'
import TicketFilters from '@/components/tickets/TicketFilters.vue'

const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()

// State
const viewMode = ref('table')
const search = ref(route.query.search || '')
const page = ref(1)
const itemsPerPage = ref(20)

const filters = ref({
  status: [],
  priority: [],
  category: [],
  assignedTo: null
})

// Fetch tickets
const { result: ticketsResult, loading, refetch } = useQuery(GET_TICKETS, () => {
  const cleanFilters = {}
  if (filters.value.status?.length) cleanFilters.status = filters.value.status
  if (filters.value.priority?.length) cleanFilters.priority = filters.value.priority
  if (filters.value.category?.length) cleanFilters.category = filters.value.category
  if (filters.value.assignedTo) cleanFilters.assignedTo = filters.value.assignedTo
  return Object.keys(cleanFilters).length > 0 ? { filters: cleanFilters } : {}
})

// Fetch agents for filter
const { result: agentsResult } = useQuery(GET_TECHNICIANS)

const tickets = computed(() => ticketsResult.value?.tickets || [])
const totalTickets = computed(() => tickets.value.length)
const totalPages = computed(() => Math.ceil(totalTickets.value / itemsPerPage.value))

const agentsForFilter = computed(() => {
  const techs = agentsResult.value?.users || []
  return techs.map(t => ({
    id: t.id,
    name: t.fullname
  }))
})

// Filtered tickets
const filteredTickets = computed(() => {
  let result = [...tickets.value]

  // Apply store filters
  ticketStore.setFilters({
    ...filters.value,
    search: search.value
  })

  return ticketStore.filteredTickets
})

// Watch for tickets changes and update store
// Subscribe to new tickets for real-time updates
const { onResult: onNewTicket } = useSubscription(NEW_TICKET_SUBSCRIPTION)
onNewTicket((data) => {
  if (data.data?.newTicket) {
    refetch()
  }
})

watch(tickets, (newTickets) => {
  ticketStore.setTickets(newTickets)
}, { immediate: true })

// Debounced search
const debounceSearch = debounce(() => {
  refetch()
}, 500)

function applyFilters(newFilters) {
  filters.value = { ...newFilters }
  page.value = 1
  refetch()
}

function clearAllFilters() {
  filters.value = {
    status: [],
    priority: [],
    category: [],
    assignedTo: null
  }
  search.value = ''
  ticketStore.clearFilters()
  refetch()
}

function handlePageChange(newPage) {
  page.value = newPage
  refetch()
}
</script>
