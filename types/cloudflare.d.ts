/// <reference types="@cloudflare/workers-types" />

declare global {
  interface Env {
    [key: string]: any;
  }
  
  interface CloudflareEnvironment extends Env { }
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment;
      ctx: ExecutionContext;
    };
  }
}

export type { CloudflareEnvironment };