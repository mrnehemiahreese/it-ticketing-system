<template>
  <v-container>
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h4">Welcome, {{ authStore.fullName }}!</h1>
        <p class="text-subtitle-1 text-grey">Here's an overview of your support tickets</p>
      </v-col>
    </v-row>

    <!-- Verse of the Day -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <VerseOfTheDay />
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="mb-4">
      {{ error.message }}
    </v-alert>

    <!-- Dashboard Content -->
    <template v-else-if="dashboard">
      <!-- Stats Cards -->
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card color="success">
            <v-card-text>
              <div class="text-overline">Open</div>
              <div class="text-h3">{{ dashboard.stats.openTickets }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card color="info">
            <v-card-text>
              <div class="text-overline">In Progress</div>
              <div class="text-h3">{{ dashboard.stats.inProgressTickets }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card color="primary">
            <v-card-text>
              <div class="text-overline">Resolved</div>
              <div class="text-h3">{{ dashboard.stats.resolvedTickets }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card>
            <v-card-text>
              <div class="text-overline">Total</div>
              <div class="text-h3">{{ dashboard.stats.totalTickets }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quick Actions -->
      <v-row class="mt-4">
        <v-col cols="12" sm="6">
          <v-btn color="primary" to="/portal/submit" block size="x-large" prepend-icon="mdi-pencil">
            Submit New Ticket
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6">
          <v-btn color="secondary" to="/portal/knowledge-base" block size="x-large" prepend-icon="mdi-book-open">
            Browse Knowledge Base
          </v-btn>
        </v-col>
      </v-row>

      <!-- Recent Tickets -->
      <v-card class="mt-6">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Recent Tickets</span>
          <v-btn variant="text" to="/portal/tickets" size="small">View All</v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text v-if="dashboard.recentTickets.length === 0">
          <p class="text-center text-grey py-4">No tickets yet. Create your first ticket!</p>
        </v-card-text>
        <v-list v-else>
          <v-list-item
            v-for="ticket in dashboard.recentTickets"
            :key="ticket.id"
            :to="`/portal/tickets/${ticket.id}`"
            class="border-b"
          >
            <template #prepend>
              <v-avatar :color="getStatusColor(ticket.status)">
                <v-icon>{{ getStatusIcon(ticket.status) }}</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>{{ ticket.title }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ ticket.ticketNumber }} • Created {{ formatDate(ticket.createdAt) }}
            </v-list-item-subtitle>
            <template #append>
              <v-chip :color="getPriorityColor(ticket.priority)" size="small">
                {{ ticket.priority }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </v-card>

      <!-- Popular Knowledge Base Articles -->
      <v-card class="mt-6">
        <v-card-title>Popular Knowledge Base Articles</v-card-title>
        <v-divider></v-divider>
        <v-list>
          <v-list-item
            v-for="article in dashboard.popularArticles"
            :key="article.id"
            @click="viewArticle(article.id)"
          >
            <template #prepend>
              <v-icon>mdi-file-document-outline</v-icon>
            </template>
            <v-list-item-title>{{ article.title }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ article.category }} • {{ article.views }} views
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </template>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import { useAuthStore } from '@/stores/auth'
import gql from 'graphql-tag'
import { format, formatDistanceToNow } from 'date-fns'
import VerseOfTheDay from '@/components/common/VerseOfTheDay.vue'

const router = useRouter()
const authStore = useAuthStore()

const CUSTOMER_DASHBOARD = gql`
  query CustomerDashboard {
    customerDashboard {
      stats {
        totalTickets
        openTickets
        inProgressTickets
        resolvedTickets
        closedTickets
      }
      recentTickets {
        id
        ticketNumber
        title
        status
        priority
        createdAt
      }
      popularArticles {
        id
        title
        category
        views
      }
    }
  }
`

const { result, loading, error } = useQuery(CUSTOMER_DASHBOARD)
const dashboard = computed(() => result.value?.customerDashboard)

const formatDate = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch (e) {
    return date
  }
}

const getStatusColor = (status) => {
  const colors = {
    OPEN: 'success',
    IN_PROGRESS: 'info',
    PENDING: 'warning',
    RESOLVED: 'primary',
    CLOSED: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    OPEN: 'mdi-circle',
    IN_PROGRESS: 'mdi-progress-clock',
    PENDING: 'mdi-pause-circle',
    RESOLVED: 'mdi-check-circle',
    CLOSED: 'mdi-close-circle'
  }
  return icons[status] || 'mdi-circle'
}

const getPriorityColor = (priority) => {
  const colors = {
    LOW: 'grey',
    MEDIUM: 'info',
    HIGH: 'warning',
    URGENT: 'error'
  }
  return colors[priority] || 'grey'
}

const viewArticle = (id) => {
  router.push(`/portal/knowledge-base?article=${id}`)
}
</script>

<style scoped>
.border-b:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
