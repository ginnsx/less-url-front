import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupMockServer } from '../mocks/browser'
import 'vfonts/Roboto.css'
import 'vfonts/FiraCode.css'
import { setupNaiveDiscreteApi, setupDayjs } from '@/plugins'
import { setupRouterGuard } from '@/router/guard'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { setupGuestStore } from '@/stores/guest'

function bootstrap() {
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

  // 根据环境变量决定是否启用 mock
  setupMockServer().then(() => {
    app.mount('#app')
  })
}

bootstrap()
