import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { poweredBy } from 'hono/powered-by'
import { createRequestHandler } from 'react-router'
import { api } from '../api'
import { 
  getBuildMode, 
  importBuild, 
  bindIncomingRequestSocketInfo,
  createGetLoadContext
} from '../utils'
import { cache } from '../middleware'

/**
 * 初始化 Node.js 服务器
 */
export async function createNodeServer() {
  // 创建 Hono 应用实例
  const app = new Hono()

  // 获取环境模式
  const mode = getBuildMode()
  const PRODUCTION = mode === 'production'

  // 添加中间件
  app.use('*', logger())
  app.use('*', poweredBy({ serverName: 'Hono on Node.js' }))

  // 绑定传入请求的 socket 信息 (开发模式中有用)
  if (!PRODUCTION) {
    app.use(bindIncomingRequestSocketInfo())
  }

  // 服务静态资源
  // 长期缓存的资源文件
  app.use('/assets/*', 
    cache(31536000), // 1年
    serveStatic({ root: PRODUCTION ? './build/client' : './public' })
  )

  // favicon 支持（明确指定）
  app.use('/favicon.ico', serveStatic({ 
    path: PRODUCTION ? './build/client/favicon.ico' : './public/favicon.ico' 
  }))

  // 其他静态文件
  app.use('*', 
    cache(3600), // 1小时
    serveStatic({ root: PRODUCTION ? './build/client' : './public' })
  )

  // 将 API 子应用挂载到 /api 路径
  app.route('/api', api)

  // 在服务器初始化时导入一次构建
  console.log('加载服务器构建文件...')
  const build = await importBuild()
  const requestHandler = createRequestHandler(build, mode)
  
  // 创建 getLoadContext 函数
  const getLoadContext = createGetLoadContext()
  
  // 处理 React Router 请求 - 使用已加载的 requestHandler
  app.use('*', async (c) => {
    try {
      // 获取加载上下文
      const loadContext = getLoadContext(c)
      
      // 使用预先创建的请求处理程序
      return await requestHandler(c.req.raw, loadContext)
    } catch (error) {
      console.error('Error handling request:', error)
      return c.text('Internal Server Error', 500)
    }
  })

  return app
}

/**
 * 启动 Node.js 服务器
 */
export async function startNodeServer(port = 3000) {
  const app = await createNodeServer()
  const mode = getBuildMode()
  
  console.log(`Server is running in ${mode} mode on http://localhost:${port}`)
  return serve({
    fetch: app.fetch,
    port
  })
}

// 只有在直接运行此文件时才启动服务器
if (import.meta.url.endsWith('node.ts')) {
  startNodeServer()
}

// 导出默认应用实例，用于测试或外部集成
export default { createNodeServer, startNodeServer } 