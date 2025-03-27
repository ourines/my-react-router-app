import { Hono } from "hono";

export const api = new Hono<{ Bindings: CloudflareEnvironment }>();

api.get("/hello", (c) => {
    return c.json({ message: "Hello from API!" });
});

api.post("/data", async (c) => {
    const body = await c.req.json();
    // Process data...
    return c.json({ success: true, data: body });
});
