<template>
  <v-navigation-drawer
    v-model="localDrawer"
    app
    :rail="rail"
    @update:rail="emit('update:rail', $event)"
  >
    <v-list density="compact" nav>
      <!-- Customer Menu (when isCustomer is true) -->
      <template v-if="authStore.isCustomer">
        <v-list-item
          :to="{ name: 'CustomerDashboard' }"
          prepend-icon="mdi-home"
          title="Home"
          value="portal-dashboard"
        />
        <v-list-item
          :to="{ name: 'CustomerSubmitTicket' }"
          prepend-icon="mdi-pencil"
          title="Submit Ticket"
          value="portal-submit"
          class="text-primary"
        />
        <v-list-item
          :to="{ name: 'CustomerTickets' }"
          prepend-icon="mdi-ticket"
          title="My Tickets"
          value="portal-tickets"
        />
        <v-list-item
          :to="{ name: 'CustomerKnowledgeBase' }"
          prepend-icon="mdi-book-open"
          title="Knowledge Base"
          value="portal-knowledge-base"
        />
        <v-list-item
          :to="{ name: 'CustomerProfile' }"
          prepend-icon="mdi-account"
          title="My Profile"
          value="portal-profile"
        />
      </template>

      <!-- Admin/Agent Menu (when isCustomer is false) -->
      <template v-else>
        <v-list-item
          :to="{ name: 'Dashboard' }"
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard"
        />
        <v-list-item
          :to="{ name: 'Tickets' }"
          prepend-icon="mdi-ticket"
          title="All Tickets"
          value="tickets"
        />
        <v-list-item
          :to="{ name: 'MyTickets' }"
          prepend-icon="mdi-ticket-account"
          title="My Tickets"
          value="my-tickets"
        />
        <v-list-item
          :to="{ name: 'CreateTicket' }"
          prepend-icon="mdi-ticket-plus"
          title="Create Ticket"
          value="create-ticket"
          class="text-primary"
        />
        <v-divider class="my-2" />
        <v-list-item
          :to="{ name: 'KnowledgeBase' }"
          prepend-icon="mdi-book-open-variant"
          title="Knowledge Base"
          value="knowledge-base"
        />

        <!-- Admin Section (Only for ADMIN role) -->
        <template v-if="authStore.isAdmin">
          <v-divider class="my-2" />
          <v-list-subheader v-if="!rail">ADMINISTRATION</v-list-subheader>
          <v-list-item
            :to="{ name: 'Analytics' }"
            prepend-icon="mdi-chart-line"
            title="Analytics"
            value="analytics"
          />
          <v-list-item
            :to="{ name: 'UserAdmin' }"
            prepend-icon="mdi-account-cog"
            title="User Management"
            value="user-admin"
          />
          <v-list-item
            :to="{ name: 'CategoryManager' }"
            prepend-icon="mdi-folder-cog"
            title="Categories"
            value="category-manager"
          />
          <!-- View as Customer Toggle (Admin Only) -->
          <v-divider class="my-2" />
          <v-list-item
            @click="authStore.toggleCustomerView"
            prepend-icon="mdi-eye"
            color="primary"
            :title="authStore.viewingAsCustomer ? 'Exit Customer View' : 'View as Customer'"
            value="toggle-customer-view"
          />
        </template>
      </template>

      <!-- Logout (always visible) -->
      <v-divider />
      <v-list-item
        @click="logout"
        prepend-icon="mdi-logout"
        title="Logout"
        value="logout"
      />
    </v-list>

    <!-- Rail Toggle Button -->
    <template v-slot:append>
      <v-divider />
      <div class="pa-2">
        <v-btn
          block
          variant="text"
          :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          @click="emit('update:rail', !rail)"
        />
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true
  },
  rail: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:rail'])

const authStore = useAuthStore()
const router = useRouter()

const localDrawer = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
