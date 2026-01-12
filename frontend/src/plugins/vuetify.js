import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Styles
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Custom theme with Material Design 3
const lightTheme = {
  dark: false,
  colors: {
    primary: '#1976D2',
    secondary: '#26A69A',
    accent: '#00BCD4',
    error: '#EF5350',
    warning: '#FF9800',
    info: '#2196F3',
    success: '#4CAF50',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-background': '#1C1B1F',
    'on-surface': '#1C1B1F',
  },
}

const darkTheme = {
  dark: true,
  colors: {
    primary: '#64B5F6',
    secondary: '#4DB6AC',
    accent: '#4DD0E1',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#42A5F5',
    success: '#66BB6A',
    background: '#121212',
    surface: '#1E1E1E',
    'on-primary': '#000000',
    'on-secondary': '#000000',
    'on-background': '#E1E1E1',
    'on-surface': '#E1E1E1',
  },
}

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  defaults: {
    VBtn: {
      elevation: 0,
      style: { textTransform: 'none' },
    },
    VCard: {
      elevation: 2,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
    },
  },
})
