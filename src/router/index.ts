import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '@/views/HomeView.vue'
import Dashboard from '@/views/DashboardView.vue'
import LinkAnalytics from '@/views/LinkAnalytics.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: Home, name: 'home' },
  { path: '/dashboard', component: Dashboard, name: 'dashboard' },
  { path: '/analytics/:id', component: LinkAnalytics, name: 'analytics' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
