<template>
  <v-app-bar
    elevation="1"
    color="primary"
    dark
    app
  >
    <v-app-bar-nav-icon @click="emit('toggle-drawer')" />

    <v-toolbar-title class="text-h6 font-weight-bold">
      IT Ticketing System
    </v-toolbar-title>

    <v-spacer />

    <!-- Search -->
    <v-text-field
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search tickets..."
      variant="solo-filled"
      density="compact"
      single-line
      hide-details
      class="mx-4 search-field"
      style="max-width: 400px;"
      @keyup.enter="handleSearch"
    />

    <v-spacer />

    <!-- Notifications -->
    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-badge
            v-if="unreadNotifications > 0"
            :content="unreadNotifications"
            color="error"
            overlap
          >
            <v-icon>mdi-bell</v-icon>
          </v-badge>
          <v-icon v-else>mdi-bell-outline</v-icon>
        </v-btn>
      </template>

      <v-list width="320" max-height="400">
        <v-list-subheader>Notifications</v-list-subheader>
        <v-divider />

        <template v-if="notifications.length > 0">
          <v-list-item
            v-for="notification in notifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
          >
            <v-list-item-title>{{ notification.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
            <v-list-item-subtitle class="text-caption">
              {{ formatRelativeTime(notification.createdAt) }}
            </v-list-item-subtitle>
          </v-list-item>
        </template>

        <v-list-item v-else>
          <v-list-item-title class="text-center text-grey">
            No new notifications
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- User Menu -->
    <v-menu offset-y min-width="200">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" class="ml-2">
          <v-avatar color="secondary" size="40">
            <span class="text-h6">{{ userInitials }}</span>
          </v-avatar>
        </v-btn>
      </template>

      <v-list>
        <v-list-item>
          <v-list-item-title class="font-weight-bold">
            {{ authStore.fullName }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ authStore.user?.email }}</v-list-item-subtitle>
        </v-list-item>

        <v-divider />

        <v-list-item :to="{ name: 'Profile' }">
          <template v-slot:prepend>
            <v-icon>mdi-account</v-icon>
          </template>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>

        <v-list-item @click="handleLogout">
          <template v-slot:prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getInitials, formatRelativeTime } from '@/utils/helpers'

const emit = defineEmits(['toggle-drawer'])
const router = useRouter()
const authStore = useAuthStore()

// State
const search = ref('')
const notifications = ref([
  // Mock notifications - replace with real data
])
const unreadNotifications = computed(() => notifications.value.length)

// Computed
const userInitials = computed(() => {
  return getInitials(authStore.user?.fullname || authStore.user?.username)
})

// Methods
function handleSearch() {
  if (search.value.trim()) {
    router.push({ name: 'Tickets', query: { search: search.value } })
  }
}

function handleNotificationClick(notification) {
  // Handle notification click
  console.log('Notification clicked:', notification)
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.search-field {
  border-radius: 8px;
}
</style>
