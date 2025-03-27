/**
 * 创建适合 Cloudflare Workers 的 ExecutionContext
 * @param executionCtx Hono 的执行上下文
 * @returns 增强的执行上下文
 */
export function createWorkerContext(executionCtx: ExecutionContext) {
    return {
        ...executionCtx,
        props: {},
    };
}


export function getRequestContext(c: any) {
    const workerCtx = createWorkerContext(c.executionCtx);

    return {
        env: c.env,
        ctx: workerCtx
    };
}