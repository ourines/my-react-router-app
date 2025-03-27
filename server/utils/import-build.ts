import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ServerBuild } from 'react-router'

/**
 * 从构建目录中动态查找和导入最新的服务器构建
 */
export async function importBuild(): Promise<ServerBuild> {
  // 检查是否在 Vite 开发服务器环境中
  const isViteDevServer = process.env.VITE_DEV_SERVER === 'true' || 
                          typeof import.meta.env !== 'undefined';
  
  if (isViteDevServer) {
    // 在 Vite 开发服务器中使用虚拟模块
    console.log('Vite 开发环境: 使用虚拟模块导入服务器构建...');
    return await import('virtual:react-router/server-build');
  } else {
    // 在 Node.js 环境中直接从文件系统导入
    console.log('Node.js 环境: 从构建目录导入服务器构建...');
    return await importFromFileSystem();
  }
}

/**
 * 尝试使用 Vite 的虚拟模块导入
 */
async function importVirtualBuild(): Promise<ServerBuild> {
  try {
    // 尝试使用 React Router 提供的虚拟模块路径
    const build = await import('virtual:react-router/server-build')
    return build.default || build
  } catch (error) {
    console.error('通过虚拟模块导入失败:', error)
    throw error
  }
}

/**
 * 从构建目录查找并导入最新的服务器构建
 */
async function importFromFileSystem(): Promise<ServerBuild> {
  // 获取当前文件的目录
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  
  // 服务器构建资源目录
  const serverAssetsDir = path.resolve(__dirname, '../../build/server/assets')
  
  try {
    // 读取服务器资源目录
    const files = await fs.readdir(serverAssetsDir)
    
    // 查找 server-build 文件
    const serverBuildFile = files.find(file => file.startsWith('server-build-') && file.endsWith('.js'))
    
    if (!serverBuildFile) {
      throw new Error('找不到服务器构建文件')
    }
    
    // 构建完整路径
    const buildPath = path.join(serverAssetsDir, serverBuildFile)
    console.log(`找到服务器构建文件: ${buildPath}`)
    
    // 动态导入
    const build = await import(buildPath)
    return build.default || build
  } catch (error) {
    console.error('从构建目录导入失败:', error)
    throw error
  }
} 