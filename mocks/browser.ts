import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { isMockEnabled } from './config'

export const worker = setupWorker(...handlers)

export async function setupMockServer() {
  if (isMockEnabled) {
    // 在开发环境下，使用更详细的日志
    if (import.meta.env.DEV) {
      worker.start({
        onUnhandledRequest: 'warn',
      })
    } else {
      // 生产环境下使用静默模式
      worker.start({
        onUnhandledRequest: 'bypass',
      })
    }

    console.info('[MSW] Mock Service Worker 已启动')
  }
}
