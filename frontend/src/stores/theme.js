import { defineStore } from "pinia"
import { ref, computed, watch } from "vue"
import { useTheme } from "vuetify"
import { useAuthStore } from "./auth"

export const useThemeStore = defineStore("theme", () => {
  const vuetifyTheme = useTheme()
  const authStore = useAuthStore()

  // State
  const isDark = ref(localStorage.getItem("theme_dark") === "true")

  // Computed - determine which theme base to use
  const themeBase = computed(() => {
    return authStore.isCustomer ? "customer" : "agent"
  })

  // Computed - full theme name
  const currentTheme = computed(() => {
    const base = themeBase.value
    const mode = isDark.value ? "Dark" : "Light"
    return `${base}${mode}`
  })

  // Apply theme to Vuetify
  function applyTheme() {
    vuetifyTheme.global.name.value = currentTheme.value
  }

  // Toggle dark mode
  function toggleDark() {
    isDark.value = !isDark.value
    localStorage.setItem("theme_dark", isDark.value.toString())
    applyTheme()
  }

  // Set dark mode explicitly
  function setDark(value) {
    isDark.value = value
    localStorage.setItem("theme_dark", value.toString())
    applyTheme()
  }

  // Watch for auth changes (customer vs agent) and update theme
  watch(
    () => authStore.isCustomer,
    () => {
      applyTheme()
    }
  )

  // Initialize theme on store creation
  function init() {
    applyTheme()
  }

  return {
    isDark,
    themeBase,
    currentTheme,
    toggleDark,
    setDark,
    applyTheme,
    init,
  }
})
