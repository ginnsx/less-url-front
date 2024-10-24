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
  {
    path: '/404',
    name: 'notFound',
    component: () => import('@/views/404View.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
