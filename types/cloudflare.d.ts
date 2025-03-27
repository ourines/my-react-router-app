/// <reference types="@cloudflare/workers-types" />

declare global {
  interface Env {
    [key: string]: any;
  }

  interface CloudflareEnvironment extends Env { }
}

declare module "react-router" {
  export interface AppLoadContext {
    // hono 绑定的内容，在 node 环境下需要另外的实现
    env: CloudflareEnvironment;
    // workers 运行时的上下文
    ctx: ExecutionContext;
  }
}

export type { CloudflareEnvironment };