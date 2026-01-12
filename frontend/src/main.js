import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import apolloProvider from './plugins/apollo'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(apolloProvider)

app.mount('#app')
