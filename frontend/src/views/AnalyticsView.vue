<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4 font-weight-bold">Analytics</h1>

      <!-- Date Range Filter -->
      <div class="d-flex align-center ga-4">
        <v-btn-toggle v-model="selectedRange" mandatory color="primary" density="compact">
          <v-btn value="7">7 Days</v-btn>
          <v-btn value="14">14 Days</v-btn>
          <v-btn value="30">30 Days</v-btn>
          <v-btn value="90">90 Days</v-btn>
        </v-btn-toggle>
        <v-btn icon="mdi-refresh" variant="text" @click="refetchAll" :loading="loading || categoryLoading" />
      </div>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="primary" class="mb-6">
      <v-tab value="overview">
        <v-icon start>mdi-chart-line</v-icon>
        Overview
      </v-tab>
      <v-tab value="agents">
        <v-icon start>mdi-account-group</v-icon>
        Agent Performance
      </v-tab>
      <v-tab value="categories">
        <v-icon start>mdi-folder-multiple</v-icon>
        Categories
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- Overview Tab -->
      <v-window-item value="overview">
        <!-- KPI Cards -->
        <v-row class="mb-6">
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" class="pa-4">
              <div class="d-flex align-center">
                <v-avatar color="primary" size="48" class="mr-4">
                  <v-icon color="white">mdi-ticket</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h4 font-weight-bold">{{ statistics?.total || 0 }}</div>
                  <div class="text-subtitle-2 text-grey">Total Tickets</div>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" class="pa-4">
              <div class="d-flex align-center">
                <v-avatar color="warning" size="48" class="mr-4">
                  <v-icon color="white">mdi-clock-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h4 font-weight-bold">{{ openTickets }}</div>
                  <div class="text-subtitle-2 text-grey">Open Tickets</div>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" class="pa-4">
              <div class="d-flex align-center">
                <v-avatar color="success" size="48" class="mr-4">
                  <v-icon color="white">mdi-check-circle</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h4 font-weight-bold">{{ resolutionRate }}%</div>
                  <div class="text-subtitle-2 text-grey">Resolution Rate</div>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" class="pa-4">
              <div class="d-flex align-center">
                <v-avatar color="info" size="48" class="mr-4">
                  <v-icon color="white">mdi-timer-sand</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h4 font-weight-bold">{{ formattedResolutionTime }}</div>
                  <div class="text-subtitle-2 text-grey">Avg Resolution</div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Charts Row -->
        <v-row class="mb-6">
          <!-- Ticket Trends Chart -->
          <v-col cols="12" md="8">
            <v-card elevation="2">
              <v-card-title>Ticket Volume Trend</v-card-title>
              <v-divider />
              <v-card-text style="height: 300px">
                <Line v-if="trendChartData" :data="trendChartData" :options="trendChartOptions" />
                <div v-else class="d-flex align-center justify-center" style="height: 100%">
                  <v-progress-circular indeterminate color="primary" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Status Distribution -->
          <v-col cols="12" md="4">
            <v-card elevation="2">
              <v-card-title>Status Distribution</v-card-title>
              <v-divider />
              <v-card-text style="height: 300px">
                <Doughnut v-if="statusChartData" :data="statusChartData" :options="doughnutOptions" />
                <div v-else class="d-flex align-center justify-center" style="height: 100%">
                  <v-progress-circular indeterminate color="primary" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Priority & Status Breakdown -->
        <v-row>
          <v-col cols="12" md="6">
            <v-card elevation="2">
              <v-card-title>Status Breakdown</v-card-title>
              <v-divider />
              <v-list>
                <v-list-item v-for="(value, key) in statusBreakdown" :key="key">
                  <template v-slot:prepend>
                    <v-avatar :color="getStatusColor(key)" size="32">
                      <v-icon size="small" color="white">{{ getStatusIcon(key) }}</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ formatStatusLabel(key) }}</v-list-item-title>
                  <template v-slot:append>
                    <v-chip size="small" :color="getStatusColor(key)" variant="flat">
                      {{ value }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card elevation="2">
              <v-card-title>Priority Breakdown</v-card-title>
              <v-divider />
              <v-card-text style="height: 250px">
                <Bar v-if="priorityChartData" :data="priorityChartData" :options="barChartOptions" />
                <div v-else class="d-flex align-center justify-center" style="height: 100%">
                  <v-progress-circular indeterminate color="primary" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Source Breakdown -->
        <v-row class="mt-6">
          <v-col cols="12" md="4">
            <v-card elevation="2">
              <v-card-title>Tickets by Source</v-card-title>
              <v-divider />
              <v-card-text style="height: 250px">
                <Doughnut v-if="sourceChartData" :data="sourceChartData" :options="doughnutOptions" />
                <div v-else class="d-flex align-center justify-center" style="height: 100%">
                  <v-progress-circular indeterminate color="primary" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="8">
            <v-card elevation="2">
              <v-card-title>Source Breakdown</v-card-title>
              <v-divider />
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-avatar color="blue" size="32"><v-icon size="small" color="white">mdi-web</v-icon></v-avatar>
                  </template>
                  <v-list-item-title>Portal</v-list-item-title>
                  <template v-slot:append>
                    <v-chip size="small" color="blue" variant="flat">{{ sourceStats?.portal || 0 }}</v-chip>
                  </template>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-avatar color="orange" size="32"><v-icon size="small" color="white">mdi-email</v-icon></v-avatar>
                  </template>
                  <v-list-item-title>Email</v-list-item-title>
                  <template v-slot:append>
                    <v-chip size="small" color="orange" variant="flat">{{ sourceStats?.email || 0 }}</v-chip>
                  </template>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-avatar color="purple" size="32"><v-icon size="small" color="white">mdi-slack</v-icon></v-avatar>
                  </template>
                  <v-list-item-title>Slack</v-list-item-title>
                  <template v-slot:append>
                    <v-chip size="small" color="purple" variant="flat">{{ sourceStats?.slack || 0 }}</v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Agents Tab -->
      <v-window-item value="agents">
        <v-row>
          <v-col cols="12">
            <v-card elevation="2">
              <v-card-title>Agent Performance</v-card-title>
              <v-divider />
              <v-data-table
                :headers="agentHeaders"
                :items="agentPerformance || []"
                :loading="loading"
                class="elevation-0"
              >
                <template v-slot:item.agent="{ item }">
                  <div class="d-flex align-center py-2">
                    <v-avatar
                      :color="getAvatarColor(item.agent.fullname)"
                      size="40"
                      class="mr-3"
                    >
                      <span class="text-body-2">{{ getInitials(item.agent.fullname) }}</span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ item.agent.fullname }}</div>
                      <div class="text-caption text-grey">{{ item.agent.email }}</div>
                    </div>
                  </div>
                </template>

                <template v-slot:item.resolutionRate="{ item }">
                  <v-chip
                    :color="getResolutionRateColor(item)"
                    size="small"
                    variant="flat"
                  >
                    {{ calculateResolutionRate(item) }}%
                  </v-chip>
                </template>

                <template v-slot:item.performance="{ item }">
                  <v-progress-linear
                    :model-value="calculateResolutionRate(item)"
                    :color="getResolutionRateColor(item)"
                    height="10"
                    rounded
                    style="min-width: 120px"
                  />
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Categories Tab -->
      <v-window-item value="categories">
        <!-- Category Summary Stats -->
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
                <div class="text-h4 font-weight-bold">{{ totalCategorizedTickets }}</div>
                <div class="text-body-2">Categorized Tickets</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card color="success" variant="tonal">
              <v-card-text class="text-center">
                <v-icon size="32" class="mb-2">mdi-trending-up</v-icon>
                <div class="text-h4 font-weight-bold text-truncate">{{ topCategoryName }}</div>
                <div class="text-body-2">Most Active</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card color="warning" variant="tonal">
              <v-card-text class="text-center">
                <v-icon size="32" class="mb-2">mdi-chart-pie</v-icon>
                <div class="text-h4 font-weight-bold">{{ averagePerCategory }}</div>
                <div class="text-body-2">Avg/Category</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Category Charts -->
        <v-row>
          <v-col cols="12" md="8">
            <v-card elevation="2">
              <v-card-title>
                <v-icon start>mdi-chart-bar</v-icon>
                Top Categories by Volume
              </v-card-title>
              <v-divider />
              <v-card-text>
                <div v-if="!topCategories.length" class="text-center pa-8 text-medium-emphasis">
                  No category data available
                </div>
                <div v-else>
                  <div
                    v-for="(cat, index) in topCategories"
                    :key="cat.categoryId || index"
                    class="mb-3"
                  >
                    <div class="d-flex justify-space-between align-center mb-1">
                      <span class="font-weight-medium">{{ cat.categoryName || 'Uncategorized' }}</span>
                      <span class="text-body-2">
                        {{ cat.ticketCount }} tickets ({{ getCategoryPercentage(cat.ticketCount) }}%)
                      </span>
                    </div>
                    <v-progress-linear
                      :model-value="getCategoryProgressValue(cat.ticketCount)"
                      :color="getCategoryColor(index)"
                      height="24"
                      rounded
                    >
                      <template #default>
                        <span class="text-white font-weight-medium">{{ cat.ticketCount }}</span>
                      </template>
                    </v-progress-linear>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card elevation="2">
              <v-card-title>
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
                        {{ getCategoryPercentage(cat.ticketCount) }}%
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Category Table -->
        <v-row class="mt-4">
          <v-col cols="12">
            <v-card elevation="2">
              <v-card-title class="d-flex align-center">
                <v-icon start>mdi-table</v-icon>
                Detailed Category Stats
                <v-spacer />
                <v-text-field
                  v-model="categorySearch"
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
                :headers="categoryHeaders"
                :items="filteredCategoryStats"
                :loading="categoryLoading"
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
                  {{ getCategoryPercentage(item.ticketCount) }}%
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { Line, Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import gql from 'graphql-tag'
import { GET_ANALYTICS_OVERVIEW } from '@/graphql/queries'
import { getInitials, getAvatarColor } from '@/utils/helpers'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const activeTab = ref('overview')
const selectedRange = ref('30')
const categorySearch = ref('')

// Category Analytics Query
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

// Fetch analytics data
const { result, loading, refetch } = useQuery(GET_ANALYTICS_OVERVIEW, () => ({
  days: parseInt(selectedRange.value)
}))

// Fetch category data
const { result: categoryResult, loading: categoryLoading, refetch: refetchCategories } = useQuery(GET_CATEGORY_STATS)

// Watch for range changes and refetch
watch(selectedRange, () => {
  refetch()
})

function refetchAll() {
  refetch()
  refetchCategories()
}

// Computed data from query
const statistics = computed(() => result.value?.ticketStatistics)

// Filter out __typename from byStatus for display
const statusBreakdown = computed(() => {
  const byStatus = statistics.value?.byStatus
  if (!byStatus) return {}
  const { __typename, ...rest } = byStatus
  return rest
})
const priorityStats = computed(() => result.value?.ticketsByPriority)
const agentPerformance = computed(() => result.value?.agentPerformance)
const ticketTrends = computed(() => result.value?.ticketTrends || [])
const avgResolutionTime = computed(() => result.value?.averageResolutionTime || 0)

// Source computed
const sourceStats = computed(() => result.value?.ticketsBySource)

const sourceChartData = computed(() => {
  const src = sourceStats.value
  if (!src) return null
  return {
    labels: ['Portal', 'Email', 'Slack'],
    datasets: [{
      data: [src.portal, src.email, src.slack],
      backgroundColor: ['#2196F3', '#FF9800', '#9C27B0']
    }]
  }
})

// Category computed
const categoryStats = computed(() => categoryResult.value?.categoryStats || [])
const topCategories = computed(() => categoryResult.value?.topCategories || [])

const totalCategories = computed(() => {
  const uniqueCategories = new Set(categoryStats.value.map(c => c.categoryId).filter(Boolean))
  return uniqueCategories.size
})

const totalCategorizedTickets = computed(() => {
  return topCategories.value.reduce((sum, c) => sum + parseInt(c.ticketCount || 0), 0)
})

const topCategoryName = computed(() => {
  if (topCategories.value.length === 0) return 'N/A'
  return topCategories.value[0]?.categoryName || 'Uncategorized'
})

const averagePerCategory = computed(() => {
  if (totalCategories.value === 0) return '0'
  return Math.round(totalCategorizedTickets.value / totalCategories.value)
})

const maxCategoryTicketCount = computed(() => {
  if (topCategories.value.length === 0) return 1
  return Math.max(...topCategories.value.map(c => parseInt(c.ticketCount || 0)))
})

const filteredCategoryStats = computed(() => {
  if (!categorySearch.value) return categoryStats.value
  const search = categorySearch.value.toLowerCase()
  return categoryStats.value.filter(c =>
    (c.categoryName || '').toLowerCase().includes(search)
  )
})

// KPI Calculations
const openTickets = computed(() => {
  const byStatus = statistics.value?.byStatus
  if (!byStatus) return 0
  return byStatus.open + byStatus.inProgress + byStatus.pending + byStatus.reopened
})

const resolutionRate = computed(() => {
  const total = statistics.value?.total || 0
  const byStatus = statistics.value?.byStatus
  if (!byStatus || total === 0) return 0
  const resolved = byStatus.resolved + byStatus.closed
  return Math.round((resolved / total) * 100)
})

const formattedResolutionTime = computed(() => {
  const hours = avgResolutionTime.value
  if (hours === 0) return 'N/A'
  if (hours < 1) return `${Math.round(hours * 60)}m`
  if (hours < 24) return `${Math.round(hours)}h`
  return `${Math.round(hours / 24)}d`
})

// Chart Data
const trendChartData = computed(() => {
  if (!ticketTrends.value.length) return null

  return {
    labels: ticketTrends.value.map(t => {
      const date = new Date(t.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [{
      label: 'Tickets Created',
      data: ticketTrends.value.map(t => t.count),
      borderColor: '#1976D2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }
})

const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
}

const statusChartData = computed(() => {
  const byStatus = statistics.value?.byStatus
  if (!byStatus) return null

  return {
    labels: ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Reopened'],
    datasets: [{
      data: [byStatus.open, byStatus.inProgress, byStatus.pending, byStatus.resolved, byStatus.closed, byStatus.reopened],
      backgroundColor: ['#2196F3', '#FF9800', '#9C27B0', '#4CAF50', '#607D8B', '#F44336']
    }]
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8 } } }
}

const priorityChartData = computed(() => {
  const priority = priorityStats.value
  if (!priority) return null

  return {
    labels: ['Low', 'Medium', 'High', 'Urgent'],
    datasets: [{
      label: 'Tickets',
      data: [priority.low, priority.medium, priority.high, priority.urgent],
      backgroundColor: ['#9E9E9E', '#FF9800', '#F44336', '#B71C1C']
    }]
  }
})

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
}

// Agent Performance Table
const agentHeaders = [
  { title: 'Agent', key: 'agent', sortable: false },
  { title: 'Assigned', key: 'assigned', align: 'center' },
  { title: 'Resolved', key: 'resolved', align: 'center' },
  { title: 'Closed', key: 'closed', align: 'center' },
  { title: 'Rate', key: 'resolutionRate', align: 'center' },
  { title: 'Performance', key: 'performance', sortable: false, width: '150px' }
]

// Category Table
const categoryHeaders = [
  { title: 'Category', key: 'categoryName', sortable: true },
  { title: 'Tickets', key: 'ticketCount', sortable: true },
  { title: 'Percentage', key: 'percentage', sortable: false }
]

const categoryColors = ['primary', 'success', 'info', 'warning', 'error', 'teal', 'purple', 'deep-orange', 'cyan', 'pink']

function calculateResolutionRate(item) {
  if (item.assigned === 0) return 0
  return Math.round((item.total / item.assigned) * 100)
}

function getResolutionRateColor(item) {
  const rate = calculateResolutionRate(item)
  if (rate >= 80) return 'success'
  if (rate >= 50) return 'warning'
  return 'error'
}

// Status helpers
function getStatusColor(status) {
  const colors = { open: 'info', inProgress: 'warning', pending: 'purple', resolved: 'success', closed: 'grey', reopened: 'error' }
  return colors[status] || 'grey'
}

function getStatusIcon(status) {
  const icons = { open: 'mdi-ticket-outline', inProgress: 'mdi-clock-outline', pending: 'mdi-pause-circle', resolved: 'mdi-check-circle', closed: 'mdi-close-circle', reopened: 'mdi-refresh' }
  return icons[status] || 'mdi-ticket'
}

function formatStatusLabel(status) {
  const labels = { open: 'Open', inProgress: 'In Progress', pending: 'Pending', resolved: 'Resolved', closed: 'Closed', reopened: 'Reopened' }
  return labels[status] || status
}

// Category helpers
function getCategoryColor(index) {
  return categoryColors[index % categoryColors.length]
}

function getCategoryPercentage(count) {
  if (totalCategorizedTickets.value === 0) return 0
  return Math.round((parseInt(count) / totalCategorizedTickets.value) * 100)
}

function getCategoryProgressValue(count) {
  if (maxCategoryTicketCount.value === 0) return 0
  return (parseInt(count) / maxCategoryTicketCount.value) * 100
}

function getTicketCountColor(count) {
  const c = parseInt(count)
  if (c >= 10) return 'error'
  if (c >= 5) return 'warning'
  if (c >= 1) return 'info'
  return 'grey'
}
</script>
