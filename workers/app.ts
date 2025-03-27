import { Hono } from "hono";
import { logger } from "hono/logger";
import { createRequestHandler } from "react-router";
import { getRequestContext } from "utils/env";
import { api } from "server/api";
import { poweredBy } from "hono/powered-by";
// Create a simple Hono app
const app = new Hono<{ Bindings: CloudflareEnvironment }>();

// Add logger middleware
app.use("*", logger());

// Mount API sub-application to /api path
app.route("/api", api);

app.use("*", poweredBy({
  serverName: "Cloudflare Workers and HonoJS"
}));

// Create React Router request handler
const requestHandler = createRequestHandler(
  () => {
    console.log('Importing server build...');
    return import("virtual:react-router/server-build");
  },
  import.meta.env.MODE
);

// Handle all other routes with React Router
app.use("*", async (c) => {
  console.log('Web request received:', c.req.url);

  const context = getRequestContext(c);

  return await requestHandler(c.req.raw, context);
});

// Export the Cloudflare Worker
export default app;
