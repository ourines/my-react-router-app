import { Hono } from 'hono'
import { helloRouter } from './hello'
import { dataRouter } from './data'

/**
 * 创建 API 路由器
 * 聚合所有 API 子路由
 */
export function createApiRouter() {
  const api = new Hono()
  
  // 挂载各个 API 子路由
  api.route('/hello', helloRouter)
  api.route('/data', dataRouter)
  
  return api
}

// 直接导出预配置的 API 路由实例
export const api = createApiRouter() 