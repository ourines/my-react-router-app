import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';
import { createRequestHandler } from 'react-router';
import { api } from '../api';
import type { CloudflareEnvironment } from '../../types/cloudflare';

/**
 * 创建 Cloudflare Workers 环境的请求上下文
 */
function getRequestContext(c: any) {
  return {
    env: c.env,
    ctx: c.executionCtx
  };
}

/**
 * 创建 Cloudflare Workers 版本的 Hono 应用
 */
export function createCloudflareApp() {
  // 创建 Hono 应用实例，指定 Cloudflare 环境类型
  const app = new Hono<{ Bindings: CloudflareEnvironment }>();

  // 添加中间件
  app.use('*', logger());
  app.use('*', poweredBy({ 
    serverName: 'Cloudflare Workers and HonoJS'
  }));

  // 挂载 API 路由到 /api 路径
  app.route('/api', api);

  // 创建 React Router 请求处理器
  const requestHandler = createRequestHandler(
    () => {
      console.log('Importing server build...');
      return import('virtual:react-router/server-build');
    },
    import.meta.env.MODE
  );

  // 处理所有其他路由，交给 React Router
  app.use('*', async (c) => {
    console.log('Web request received:', c.req.url);
    
    const context = getRequestContext(c);
    
    return await requestHandler(c.req.raw, context);
  });

  return app;
}

// 创建应用实例
const app = createCloudflareApp();

// 导出 Cloudflare Worker
export default app; 