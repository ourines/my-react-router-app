import { Hono } from 'hono'

export const dataRouter = new Hono()

dataRouter.post('/', async (c) => {
  const body = await c.req.json()
  // 处理数据...
  return c.json({ success: true, data: body })
}) 