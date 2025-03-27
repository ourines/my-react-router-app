import type { MiddlewareHandler } from 'hono'

/**
 * 缓存控制中间件
 * 设置 Cache-Control 响应头
 * 
 * @param maxAge 缓存最大时间（秒）
 * @returns Hono 中间件
 */
export function cache(maxAge: number): MiddlewareHandler {
  return async (c, next) => {
    await next()
    c.header('Cache-Control', `public, max-age=${maxAge}`)
  }
} 