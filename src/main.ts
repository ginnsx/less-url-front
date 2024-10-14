import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'vfonts/Roboto.css'
import 'vfonts/FiraCode.css'
import { setupNaiveDiscreteApi, setupDayjs } from '@/plugins'
import { setupRouterGuard } from '@/router/guard'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
setupNaiveDiscreteApi()
app.use(router)
setupRouterGuard(router)
setupDayjs()

app.mount('#app')
