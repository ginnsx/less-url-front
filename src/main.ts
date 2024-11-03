import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'vfonts/Roboto.css'
import 'vfonts/FiraCode.css'
import { setupNaiveDiscreteApi, setupDayjs } from '@/plugins'
import { setupRouterGuard } from '@/router/guard'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { setupGuestStore } from '@/stores/guest'

const app = createApp(App)

setupNaiveDiscreteApi()
app.use(router)
setupRouterGuard(router)
setupDayjs()

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// 初始化 guest id
setupGuestStore()

app.mount('#app')

// production mock server
if (process.env.NODE_ENV === 'production') {
  import('./mockProdServer').then(({ setupProdMockServer }) => {
    setupProdMockServer()
  })
}
