import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false, layout: 'blank' }
  },
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tickets',
    name: 'Tickets',
    component: () => import('@/views/TicketsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tickets/create',
    name: 'CreateTicket',
    component: () => import('@/views/CreateTicketView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tickets/:id',
    name: 'TicketDetail',
    component: () => import('@/views/TicketDetailView.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/my-tickets',
    name: 'MyTickets',
    component: () => import('@/views/MyTicketsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/knowledge-base',
    name: 'KnowledgeBase',
    component: () => import('@/views/KnowledgeBaseView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  // Admin routes
  {
    path: '/admin/analytics',
    name: 'Analytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'UserAdmin',
    component: () => import('@/views/UserAdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/categories',
    name: 'CategoryManager',
    component: () => import('@/views/CategoryManagerView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // Portal routes for customer portal
  {
    path: '/portal',
    redirect: '/portal/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'CustomerDashboard',
        component: () => import('@/views/portal/CustomerDashboardView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'submit',
        name: 'CustomerSubmitTicket',
        component: () => import('@/views/CreateTicketView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'tickets',
        name: 'CustomerTickets',
        component: () => import('@/views/MyTicketsView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'tickets/:id',
        name: 'CustomerTicketDetail',
        component: () => import('@/views/TicketDetailView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'knowledge-base',
        name: 'CustomerKnowledgeBase',
        component: () => import('@/views/KnowledgeBaseView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'CustomerProfile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Check if route requires admin role
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Dashboard' })
    return
  }

  // Redirect to dashboard if authenticated user tries to access login
  if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  // Portal-specific routing logic
  if (to.path.startsWith('/portal')) {
    next()
  } else if (authStore.isCustomer && !to.path.startsWith('/portal') && to.path !== '/login') {
    next('/portal/dashboard')
  } else {
    next()
  }
})

export default router
