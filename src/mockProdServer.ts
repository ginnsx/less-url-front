//  mockProdServer.ts
import { createProdMockServer } from 'vite-plugin-mock/client'

// 逐一导入您的mock.ts文件
// 如果使用vite.mock.config.ts，只需直接导入文件
// 可以使用 import.meta.glob功能来进行全部导入
import linksModule from '../mocks/links'
import authModule from '../mocks/auth'
import analysisModule from '../mocks/analysis'
import guestModule from '../mocks/guest'

export function setupProdMockServer() {
  createProdMockServer([...linksModule, ...authModule, ...analysisModule, ...guestModule])
}
