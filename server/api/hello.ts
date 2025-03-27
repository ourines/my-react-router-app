import { Hono } from 'hono'

export const helloRouter = new Hono()

helloRouter.get('/', (c) => {
  return c.json({ message: 'Hello from API!' })
}) 