import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: () => import('@/views/HomeView.vue'), name: 'home' },
  {
    path: '/dashboard',
    component: () => import('@/views/DashboardView.vue'),
    name: 'dashboard',
  },
  {
    path: '/analytics/:id',
    component: () => import('@/views/LinkAnalytics.vue'),
    name: 'analytics',
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/AuthView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
