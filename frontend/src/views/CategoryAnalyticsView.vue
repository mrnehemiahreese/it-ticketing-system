<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h1 class="text-h4 mb-1">Category Analytics</h1>
            <p class="text-body-2 text-medium-emphasis">
              Ticket volume and trends by category
            </p>
          </div>
          <div class="d-flex ga-2">
            <v-select
              v-model="timeRange"
              :items="timeRangeOptions"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 150px"
            />
            <v-btn
              icon="mdi-refresh"
              variant="text"
              :loading="loading"
              @click="refetch"
            />
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12">
        <v-skeleton-loader type="card@3" />
      </v-col>
    </v-row>

    <template v-else>
      <!-- Summary Stats -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-card color="primary" variant="tonal">
            <v-card-text class="text-center">
              <v-icon size="32" class="mb-2">mdi-folder-multiple</v-icon>
              <div class="text-h4 font-weight-bold">{{ totalCategories }}</div>
              <div class="text-body-2">Total Categories</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card color="info" variant="tonal">
            <v-card-text class="text-center">
              <v-icon size="32" class="mb-2">mdi-ticket</v-icon>
              <div class="text-h4 font-weight-bold">{{ totalTickets }}</div>
              <div class="text-body-2">Categorized Tickets</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card color="success" variant="tonal">
            <v-card-text class="text-center">
              <v-icon size="32" class="mb-2">mdi-trending-up</v-icon>
              <div class="text-h4 font-weight-bold">{{ topCategoryName }}</div>
              <div class="text-body-2">Most Active Category</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card color="warning" variant="tonal">
            <v-card-text class="text-center">
              <v-icon size="32" class="mb-2">mdi-chart-pie</v-icon>
              <div class="text-h4 font-weight-bold">{{ averagePerCategory }}</div>
              <div class="text-body-2">Avg. Tickets/Category</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts Row -->
      <v-row>
        <!-- Top Categories Bar Chart -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon start>mdi-chart-bar</v-icon>
              Top Categories by Ticket Volume
            </v-card-title>
            <v-divider />
            <v-card-text>
              <div v-if="topCategories.length === 0" class="text-center pa-8 text-medium-emphasis">
                No ticket data available for the selected period
              </div>
              <div v-else>
                <div
                  v-for="(cat, index) in topCategories"
                  :key="cat.categoryId || index"
                  class="mb-3"
                >
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="font-weight-medium">
                      {{ cat.categoryName || 'Uncategorized' }}
                    </span>
                    <span class="text-body-2">
                      {{ cat.ticketCount }} tickets ({{ getPercentage(cat.ticketCount) }}%)
                    </span>
                  </div>
                  <v-progress-linear
                    :model-value="getProgressValue(cat.ticketCount)"
                    :color="getCategoryColor(index)"
                    height="24"
                    rounded
                  >
                    <template #default>
                      <span class="text-white font-weight-medium">
                        {{ cat.ticketCount }}
                      </span>
                    </template>
                  </v-progress-linear>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Category Distribution -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon start>mdi-chart-donut</v-icon>
              Distribution
            </v-card-title>
            <v-divider />
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="(cat, index) in topCategories.slice(0, 7)"
                  :key="cat.categoryId || index"
                >
                  <template #prepend>
                    <v-avatar :color="getCategoryColor(index)" size="32">
                      <span class="text-white font-weight-bold">{{ index + 1 }}</span>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ cat.categoryName || 'Uncategorized' }}</v-list-item-title>
                  <template #append>
                    <v-chip size="small" :color="getCategoryColor(index)">
                      {{ getPercentage(cat.ticketCount) }}%
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Detailed Stats Table -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon start>mdi-table</v-icon>
              Detailed Category Stats
              <v-spacer />
              <v-text-field
                v-model="searchTerm"
                prepend-inner-icon="mdi-magnify"
                label="Search categories"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 250px"
              />
            </v-card-title>
            <v-divider />
            <v-data-table
              :headers="tableHeaders"
              :items="filteredStats"
              :search="searchTerm"
              class="elevation-0"
            >
              <template #item.categoryName="{ item }">
                <div class="d-flex align-center">
                  <span v-if="item.parentId" class="text-medium-emphasis mr-1">└─</span>
                  <strong>{{ item.categoryName || 'Uncategorized' }}</strong>
                </div>
              </template>
              <template #item.ticketCount="{ item }">
                <v-chip size="small" :color="getTicketCountColor(item.ticketCount)">
                  {{ item.ticketCount }}
                </v-chip>
              </template>
              <template #item.percentage="{ item }">
                {{ getPercentage(item.ticketCount) }}%
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

// GraphQL Queries
const GET_CATEGORY_STATS = gql`
  query GetCategoryStats {
    categoryStats {
      categoryId
      categoryName
      parentId
      ticketCount
    }
    topCategories(limit: 10) {
      categoryId
      categoryName
      ticketCount
    }
  }
`

// State
const timeRange = ref('all')
const searchTerm = ref('')

const timeRangeOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' }
]

const tableHeaders = [
  { title: 'Category', key: 'categoryName', sortable: true },
  { title: 'Tickets', key: 'ticketCount', sortable: true },
  { title: 'Percentage', key: 'percentage', sortable: false }
]

const colors = [
  'primary', 'success', 'info', 'warning', 'error',
  'teal', 'purple', 'deep-orange', 'cyan', 'pink'
]

// Query
const { result, loading, refetch } = useQuery(GET_CATEGORY_STATS)

// Computed
const categoryStats = computed(() => result.value?.categoryStats || [])
const topCategories = computed(() => result.value?.topCategories || [])

const totalCategories = computed(() => {
  const uniqueCategories = new Set(categoryStats.value.map(c => c.categoryId).filter(Boolean))
  return uniqueCategories.size
})

const totalTickets = computed(() => {
  return topCategories.value.reduce((sum, c) => sum + parseInt(c.ticketCount || 0), 0)
})

const topCategoryName = computed(() => {
  if (topCategories.value.length === 0) return 'N/A'
  return topCategories.value[0]?.categoryName || 'Uncategorized'
})

const averagePerCategory = computed(() => {
  if (totalCategories.value === 0) return '0'
  return Math.round(totalTickets.value / totalCategories.value)
})

const maxTicketCount = computed(() => {
  if (topCategories.value.length === 0) return 1
  return Math.max(...topCategories.value.map(c => parseInt(c.ticketCount || 0)))
})

const filteredStats = computed(() => {
  if (!searchTerm.value) return categoryStats.value
  const search = searchTerm.value.toLowerCase()
  return categoryStats.value.filter(c =>
    (c.categoryName || '').toLowerCase().includes(search)
  )
})

// Methods
const getCategoryColor = (index) => colors[index % colors.length]

const getPercentage = (count) => {
  if (totalTickets.value === 0) return 0
  return Math.round((parseInt(count) / totalTickets.value) * 100)
}

const getProgressValue = (count) => {
  if (maxTicketCount.value === 0) return 0
  return (parseInt(count) / maxTicketCount.value) * 100
}

const getTicketCountColor = (count) => {
  const c = parseInt(count)
  if (c >= 10) return 'error'
  if (c >= 5) return 'warning'
  if (c >= 1) return 'info'
  return 'grey'
}
</script>
