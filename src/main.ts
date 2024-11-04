import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupMockServer } from '../mocks/browser'
import { isMockEnabled } from '../mocks/config'
import 'vfonts/Roboto.css'
import 'vfonts/FiraCode.css'
import { setupNaiveDiscreteApi, setupDayjs } from '@/plugins'
import { setupRouterGuard } from '@/router/guard'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { setupGuestStore } from '@/stores/guest'

function showMockMessage() {
  if (isMockEnabled) {
    window['$notification'].info({
      title: '当前为 Mock 环境',
      content: 'Mock 服务仅用于展示，不具备实际功能，如需体验完整功能，请部署真实后端服务。',
    })
  }
}

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
    showMockMessage()
  })
}

bootstrap()
