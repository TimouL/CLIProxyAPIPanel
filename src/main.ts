import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Global error handler
app.config.errorHandler = (err: unknown, _instance, info) => {
  if (import.meta.env.DEV) {
    console.error('Global error handler:', err, info)
  }
}

app.mount('#app')
