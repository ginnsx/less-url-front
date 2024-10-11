import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'vfonts/Roboto.css'
import 'vfonts/FiraCode.css'
import { setupNaiveDiscreteApi, setupDayjs } from '@/plugins'
import { setupRouterGuard } from '@/router/guard'

const app = createApp(App)

app.use(createPinia())
setupNaiveDiscreteApi()
app.use(router)
setupRouterGuard(router)
setupDayjs()

app.mount('#app')
