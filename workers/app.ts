import { createRequestHandler } from "react-router";

// 记录 createRequestHandler 的内容
console.log('createRequestHandler:', createRequestHandler);

const requestHandler = createRequestHandler(
  () => {
    // 记录动态导入的模块
    console.log('Importing server build...');
    const module = import("virtual:react-router/server-build");
    module.then(m => console.log('Server build loaded:', m));
    return module;
  },
  import.meta.env.MODE
);

// 记录环境模式
console.log('Environment mode:', import.meta.env.MODE);

export default {
  async fetch(request, env, ctx) {
    console.log('Request received:', request.url);
    console.log('Environment:', env);
    console.log('Context:', ctx);
    
    const response = await requestHandler(request, {
      cloudflare: { env, ctx },
    });
    
    console.log('Response:', response.status, response.headers);
    return response;
  },
} satisfies ExportedHandler<CloudflareEnvironment>;
