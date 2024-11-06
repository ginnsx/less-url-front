import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function setupRouterGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const loadingBar = window['$loading'] || {}
    loadingBar && loadingBar.start()
    next()

    // // 权限验证
    // const requiresAuth = to.meta.requiresAuth
    // const isLoggedIn = useAuthStore().isAuthenticated

    // if (requiresAuth && !isLoggedIn) {
    //   // 需要登录但未登录，重定向到登录页
    //   // todo 提示登录
    //   next({
    //     path: '/auth',
    //     // 保存目标路由，登录后可以跳转回去
    //     query: { redirect: to.fullPath },
    //   })
    // } else {
    //   // 不需要登录或已登录，允许访问
    //   next()
    // }
  })

  router.afterEach(() => {
    const loadingBar = window['$loading'] || {}
    loadingBar.finish()
  })

  router.onError(() => {
    const loadingBar = window['$loading'] || {}
    loadingBar.error()
  })
}
