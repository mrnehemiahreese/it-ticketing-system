import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTicketStore = defineStore('ticket', () => {
  // State
  const tickets = ref([])
  const currentTicket = ref(null)
  const filters = ref({
    status: [],
    priority: [],
    category: [],
    assignedTo: null,
    search: '',
  })
  const sortBy = ref('createdAt')
  const sortOrder = ref('desc')

  // Getters
  const filteredTickets = computed(() => {
    let result = [...tickets.value]

    // Apply status filter
    if (filters.value.status.length > 0) {
      result = result.filter(ticket =>
        filters.value.status.includes(ticket.status)
      )
    }

    // Apply priority filter
    if (filters.value.priority.length > 0) {
      result = result.filter(ticket =>
        filters.value.priority.includes(ticket.priority)
      )
    }

    // Apply category filter
    if (filters.value.category.length > 0) {
      result = result.filter(ticket =>
        filters.value.category.includes(ticket.category)
      )
    }

    // Apply assignee filter
    if (filters.value.assignedTo) {
      result = result.filter(ticket =>
        ticket.assignedTo?.id === filters.value.assignedTo
      )
    }

    // Apply search filter
    if (filters.value.search) {
      const searchLower = filters.value.search.toLowerCase()
      result = result.filter(ticket =>
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower) ||
        ticket.ticketNumber.toLowerCase().includes(searchLower)
      )
    }

    return result
  })

  const ticketStats = computed(() => {
    const stats = {
      total: tickets.value.length,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      high: 0,
      medium: 0,
      low: 0,
    }

    tickets.value.forEach(ticket => {
      // Count by status
      if (ticket.status === 'OPEN') stats.open++
      if (ticket.status === 'IN_PROGRESS') stats.inProgress++
      if (ticket.status === 'RESOLVED') stats.resolved++
      if (ticket.status === 'CLOSED') stats.closed++

      // Count by priority
      if (ticket.priority === 'HIGH' || ticket.priority === 'URGENT') stats.high++
      if (ticket.priority === 'MEDIUM') stats.medium++
      if (ticket.priority === 'LOW') stats.low++
    })

    return stats
  })

  // Actions
  function setTickets(ticketList) {
    tickets.value = ticketList
  }

  function setCurrentTicket(ticket) {
    currentTicket.value = ticket
  }

  function addTicket(ticket) {
    tickets.value.unshift(ticket)
  }

  function updateTicket(ticketId, updates) {
    const index = tickets.value.findIndex(t => t.id === ticketId)
    if (index !== -1) {
      tickets.value[index] = { ...tickets.value[index], ...updates }
    }
    if (currentTicket.value?.id === ticketId) {
      currentTicket.value = { ...currentTicket.value, ...updates }
    }
  }

  function removeTicket(ticketId) {
    tickets.value = tickets.value.filter(t => t.id !== ticketId)
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = {
      status: [],
      priority: [],
      category: [],
      assignedTo: null,
      search: '',
    }
  }

  function setSorting(field, order = 'desc') {
    sortBy.value = field
    sortOrder.value = order
  }

  return {
    // State
    tickets,
    currentTicket,
    filters,
    sortBy,
    sortOrder,
    // Getters
    filteredTickets,
    ticketStats,
    // Actions
    setTickets,
    setCurrentTicket,
    addTicket,
    updateTicket,
    removeTicket,
    setFilters,
    clearFilters,
    setSorting,
  }
})
