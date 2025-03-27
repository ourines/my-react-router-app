FROM node:20-slim AS base

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖阶段
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# 生产运行阶段
FROM base AS runner
ENV NODE_ENV=production

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
# 复制构建产物
COPY --from=builder /app/build ./build
# 复制必要的源代码文件
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/types ./types

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["pnpm", "tsx", "server/adapters/node.ts"] 