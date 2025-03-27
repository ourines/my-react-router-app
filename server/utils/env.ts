import type { CloudflareEnvironment } from '../../types/cloudflare'

/**
 * 获取当前运行环境的模式
 */
export function getBuildMode(): 'development' | 'production' {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development'
}

/**
 * 创建一个模拟的 ExecutionContext 对象
 */
export function createNodeExecutionContext() {
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
export function createNodeEnvironment() {
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