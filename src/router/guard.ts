import type { Router } from 'vue-router'

export function setupRouterGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const loadingBar = window['$loading'] || {}
    loadingBar && loadingBar.start()
    next()
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
