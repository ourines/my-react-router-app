# Docker 部署指南

本文档介绍如何使用 Docker 和 Docker Compose 部署 React Router 应用。

## 前提条件

- 已安装 Docker (>= 20.10.0)
- 已安装 Docker Compose (>= 2.0.0)

## 部署步骤

### 1. 构建并启动容器

在项目根目录下执行以下命令：

```bash
# 构建并启动容器
docker-compose up -d

# 查看容器日志
docker-compose logs -f
```

应用将在 http://localhost:3000 上可用。

### 2. 停止和删除容器

```bash
docker-compose down
```

### 3. 重新构建（当代码更新时）

```bash
docker-compose up -d --build
```

## 自定义配置

如需修改应用配置，可以在 `docker-compose.yml` 文件的 `environment` 部分添加环境变量：

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  # 添加其他环境变量
```

## 生产环境注意事项

1. 考虑使用 NGINX 作为反向代理来处理 HTTPS 和负载均衡
2. 实现正确的日志收集和监控
3. 为 Docker 容器设置资源限制（内存、CPU）
4. 定期备份数据（如有需要）

## 常见问题排查

1. **容器无法启动**
   - 检查日志：`docker-compose logs app`
   - 确认端口没有被占用：`netstat -tulpn | grep 3000`

2. **应用无法访问**
   - 确认容器正在运行：`docker ps`
   - 检查端口映射：`docker-compose ps`

3. **性能问题**
   - 检查容器资源使用情况：`docker stats` 