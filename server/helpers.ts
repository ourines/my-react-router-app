import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ServerBuild } from 'react-router'
import type { CloudflareEnvironment } from '../types/cloudflare'

/**
 * 获取当前运行环境的模式
 */
export function getBuildMode(): 'development' | 'production' {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development'
}

/**
 * 从构建目录中动态查找和导入最新的服务器构建
 */
export async function importBuild(): Promise<ServerBuild> {
  try {
    // 尝试使用虚拟模块路径导入 (在 Vite/开发环境可能有效)
    return await importVirtualBuild()
  } catch (error) {
    // 如果虚拟模块导入失败，尝试直接查找和导入文件
    console.log('直接从构建目录导入服务器构建...')
    return await importFromBuildDirectory()
  }
}

/**
 * 尝试使用 Vite 的虚拟模块导入
 */
async function importVirtualBuild(): Promise<ServerBuild> {
  try {
    // 尝试使用 React Router 提供的虚拟模块路径
    const build = await import('virtual:react-router/server-build')
    return build.default || build
  } catch (error) {
    console.error('通过虚拟模块导入失败:', error)
    throw error
  }
}

/**
 * 从构建目录查找并导入最新的服务器构建
 */
async function importFromBuildDirectory(): Promise<ServerBuild> {
  // 获取当前文件的目录
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  
  // 服务器构建资源目录
  const serverAssetsDir = path.resolve(__dirname, '../build/server/assets')
  
  try {
    // 读取服务器资源目录
    const files = await fs.readdir(serverAssetsDir)
    
    // 查找 server-build 文件
    const serverBuildFile = files.find(file => file.startsWith('server-build-') && file.endsWith('.js'))
    
    if (!serverBuildFile) {
      throw new Error('找不到服务器构建文件')
    }
    
    // 构建完整路径
    const buildPath = path.join(serverAssetsDir, serverBuildFile)
    console.log(`找到服务器构建文件: ${buildPath}`)
    
    // 动态导入
    const build = await import(buildPath)
    return build.default || build
  } catch (error) {
    console.error('从构建目录导入失败:', error)
    throw error
  }
}

/**
 * 创建一个模拟的 ExecutionContext 对象
 */
function createNodeExecutionContext() {
  const promises: Promise<any>[] = []
  return {
    waitUntil: (promise: Promise<any>) => {
      promises.push(promise)
    },
    passThroughOnException: () => {
      // 在 Node.js 中这是一个空操作
    },
    props: {} // 必需的属性
  }
}

/**
 * 创建适用于 Node.js 环境的环境对象
 * 使用类型断言来解决类型兼容性问题
 */
function createNodeEnvironment() {
  // 使用类型断言创建满足接口的对象
  const nodeEnv = {
    // 复制 Node.js 环境变量
    ...process.env,
    // 模拟 Cloudflare Workers 的 ASSETS 绑定
    ASSETS: {},
    // 添加其他所需的属性
    VALUE_FROM_CLOUDFLARE: 'mock-value'
  }
  
  // 返回带有类型断言的对象
  return nodeEnv as unknown as CloudflareEnvironment
}

/**
 * 创建 getLoadContext 函数，返回符合 React Router AppLoadContext 接口的对象
 */
export function createGetLoadContext() {
  return (c: any) => {
    return {
      // 在 Node.js 环境中提供请求上下文
      req: c.req.raw,
      // 提供模拟的 CloudflareEnvironment
      env: createNodeEnvironment(),
      // 模拟 Cloudflare Workers 的 ExecutionContext
      ctx: createNodeExecutionContext()
    }
  }
}

/**
 * 绑定传入请求的 socket 信息
 */
export function bindIncomingRequestSocketInfo() {
  return async (c: any, next: () => Promise<unknown>) => {
    if (c.req.raw.socket && !c.env.remoteAddress) {
      c.env.remoteAddress = c.req.raw.socket.remoteAddress
    }
    await next()
  }
}