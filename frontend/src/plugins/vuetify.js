import { createVuetify } from "vuetify"
import { aliases, mdi } from "vuetify/iconsets/mdi"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

// Styles
import "vuetify/styles"
import "@mdi/font/css/materialdesignicons.css"

// Agent Theme - Professional Blue
const agentLight = {
  dark: false,
  colors: {
    primary: "#1565C0",       // Deep Blue
    secondary: "#0D47A1",     // Darker Blue
    accent: "#2979FF",        // Bright Blue
    error: "#D32F2F",
    warning: "#F57C00",
    info: "#1976D2",
    success: "#388E3C",
    background: "#ECEFF1",    // Blue-gray background
    surface: "#FFFFFF",
    "surface-variant": "#E3F2FD",  // Light blue tint
    "on-primary": "#FFFFFF",
    "on-secondary": "#FFFFFF",
    "on-background": "#1C1B1F",
    "on-surface": "#1C1B1F",
    "navbar": "#1565C0",      // Blue navbar
    "navbar-text": "#FFFFFF",
  },
}

const agentDark = {
  dark: true,
  colors: {
    primary: "#42A5F5",
    secondary: "#1E88E5",
    accent: "#82B1FF",
    error: "#EF5350",
    warning: "#FFA726",
    info: "#42A5F5",
    success: "#66BB6A",
    background: "#0D1B2A",    // Dark blue background
    surface: "#1B2838",       // Dark blue surface
    "surface-variant": "#1E3A5F",
    "on-primary": "#000000",
    "on-secondary": "#000000",
    "on-background": "#E1E1E1",
    "on-surface": "#E1E1E1",
    "navbar": "#1B2838",
    "navbar-text": "#E1E1E1",
  },
}

// Customer Theme - Friendly Teal/Green
const customerLight = {
  dark: false,
  colors: {
    primary: "#00897B",       // Teal
    secondary: "#00695C",     // Darker Teal
    accent: "#1DE9B6",        // Bright Teal
    error: "#E53935",
    warning: "#FB8C00",
    info: "#00ACC1",
    success: "#43A047",
    background: "#E0F2F1",    // Light teal background
    surface: "#FFFFFF",
    "surface-variant": "#B2DFDB",  // Teal tint
    "on-primary": "#FFFFFF",
    "on-secondary": "#FFFFFF",
    "on-background": "#1C1B1F",
    "on-surface": "#1C1B1F",
    "navbar": "#00897B",      // Teal navbar
    "navbar-text": "#FFFFFF",
  },
}

const customerDark = {
  dark: true,
  colors: {
    primary: "#4DB6AC",
    secondary: "#26A69A",
    accent: "#64FFDA",
    error: "#EF5350",
    warning: "#FFA726",
    info: "#4DD0E1",
    success: "#66BB6A",
    background: "#0A1F1C",    // Dark teal background
    surface: "#152D29",       // Dark teal surface
    "surface-variant": "#1D4D47",
    "on-primary": "#000000",
    "on-secondary": "#000000",
    "on-background": "#E1E1E1",
    "on-surface": "#E1E1E1",
    "navbar": "#152D29",
    "navbar-text": "#E1E1E1",
  },
}

// Legacy themes for backwards compatibility
const lightTheme = agentLight
const darkTheme = agentDark

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: "agentLight",
    themes: {
      light: lightTheme,
      dark: darkTheme,
      agentLight,
      agentDark,
      customerLight,
      customerDark,
    },
  },
  defaults: {
    VBtn: {
      elevation: 0,
      style: { textTransform: "none" },
    },
    VCard: {
      elevation: 2,
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
    },
    VTextarea: {
      variant: "outlined",
      density: "comfortable",
    },
    VSelect: {
      variant: "outlined",
      density: "comfortable",
    },
    VAutocomplete: {
      variant: "outlined",
      density: "comfortable",
    },
  },
})
