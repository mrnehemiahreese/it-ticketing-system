import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const show = ref(false)
  const message = ref('')
  const type = ref('info')
  const timeout = ref(3000)

  // Computed color based on type
  const color = ref('primary')

  // Actions
  function showNotification(msg, notificationType = 'info', duration = 3000) {
    message.value = msg
    type.value = notificationType
    timeout.value = duration

    // Set color based on type
    switch (notificationType) {
      case 'success':
        color.value = 'success'
        break
      case 'error':
        color.value = 'error'
        break
      case 'warning':
        color.value = 'warning'
        break
      case 'info':
      default:
        color.value = 'info'
        break
    }

    show.value = true
  }

  function success(msg, duration = 3000) {
    showNotification(msg, 'success', duration)
  }

  function error(msg, duration = 5000) {
    showNotification(msg, 'error', duration)
  }

  function warning(msg, duration = 4000) {
    showNotification(msg, 'warning', duration)
  }

  function info(msg, duration = 3000) {
    showNotification(msg, 'info', duration)
  }

  function hide() {
    show.value = false
  }

  return {
    // State
    show,
    message,
    type,
    color,
    timeout,
    // Actions
    showNotification,
    success,
    error,
    warning,
    info,
    hide,
  }
})
