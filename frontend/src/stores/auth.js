import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('auth_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const loading = ref(false)
  const viewingAsCustomer = ref(false) // NEW

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => {
    if (!user.value || !user.value.roles) return false
    return Array.isArray(user.value.roles)
      ? user.value.roles.includes('ADMIN')
      : user.value.roles === 'ADMIN'
  })
  const isAgent = computed(() => {
    if (!user.value || !user.value.roles) return false
    return Array.isArray(user.value.roles)
      ? user.value.roles.includes('AGENT')
      : user.value.roles === 'AGENT'
  })

  // NEW: Check if user should see customer portal
  const isCustomer = computed(() => {
    if (!user.value) return false
    // If admin is viewing as customer, show customer view
    if (viewingAsCustomer.value) return true
    // If user is not admin/agent, they are a customer
    return !isAdmin.value && !isAgent.value
  })

  const fullName = computed(() => {
    if (!user.value) return ''
    // Support both fullname (backend) and firstName/lastName (legacy)
    if (user.value.fullname) return user.value.fullname
    if (user.value.firstName && user.value.lastName) {
      return `${user.value.firstName} ${user.value.lastName}`
    }
    return user.value.username || user.value.email || ''
  })

  // Actions
  function setAuth(authToken, userData) {
    token.value = authToken
    user.value = userData
    viewingAsCustomer.value = false // Reset on login
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    token.value = null
    user.value = null
    viewingAsCustomer.value = false
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  function updateUser(userData) {
    user.value = { ...user.value, ...userData }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  // NEW: Toggle customer view mode (admin only)
  function toggleCustomerView() {
    if (!isAdmin.value) return

    viewingAsCustomer.value = !viewingAsCustomer.value

    // Redirect to appropriate dashboard
    if (viewingAsCustomer.value) {
      router.push('/portal/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  return {
    // State
    token,
    user,
    loading,
    viewingAsCustomer, // NEW
    // Getters
    isAuthenticated,
    isAdmin,
    isAgent,
    isCustomer, // NEW
    fullName,
    // Actions
    setAuth,
    logout,
    updateUser,
    toggleCustomerView, // NEW
  }
})
