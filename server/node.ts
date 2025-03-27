import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { poweredBy } from 'hono/powered-by'
import { createRequestHandler } from 'react-router'
import { 
  getBuildMode, 
  importBuild, 
  bindIncomingRequestSocketInfo,
  createGetLoadContext
} from './helpers'
import { api } from './api'

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
  async (c, next) => {
    // 简单的缓存控制
    c.header('Cache-Control', 'public, max-age=31536000') // 1年
    await next()
  },
  serveStatic({ root: PRODUCTION ? './build/client' : './public' })
)

// favicon 支持（明确指定）
app.use('/favicon.ico', serveStatic({ 
  path: PRODUCTION ? './build/client/favicon.ico' : './public/favicon.ico' 
}))

// 其他静态文件
app.use('*', 
  async (c, next) => {
    // 短期缓存控制
    c.header('Cache-Control', 'public, max-age=3600') // 1小时
    await next()
  },
  serveStatic({ root: PRODUCTION ? './build/client' : './public' })
)


// 示例 API 路由
api.get('/hello', (c) => {
  return c.json({ message: 'Hello from API!' })
})

api.post('/data', async (c) => {
  const body = await c.req.json()
  return c.json({ success: true, data: body })
})

// 将 API 子应用挂载到 /api 路径
app.route('/api', api)

// 创建 getLoadContext 函数
const getLoadContext = createGetLoadContext()

// 处理 React Router 请求
app.use('*', async (c) => {
  try {
    // 导入服务器构建
    const build = await importBuild()
    
    // 创建请求处理程序
    const requestHandler = createRequestHandler(build, mode)
    
    // 获取加载上下文
    const loadContext = getLoadContext(c)
    
    // 处理请求
    return await requestHandler(c.req.raw, loadContext)
  } catch (error) {
    console.error('Error handling request:', error)
    return c.text('Internal Server Error', 500)
  }
})

// 配置服务器端口
const PORT = Number(process.env.PORT) || 3000

// 只有在直接运行此文件时才启动服务器
if (import.meta.url.includes('/node.ts')) {
  console.log(`Server is running in ${mode} mode on http://localhost:${PORT}`)
  serve({
    fetch: app.fetch,
    port: PORT
  })
}

// 导出应用，以便在其他地方使用
export default app 