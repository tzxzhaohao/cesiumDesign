import { defineConfig, type Plugin } from 'vite'
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const basePath = process.env.VITE_BASE_PATH ?? (process.env.GITHUB_PAGES === 'true' ? '/cesiumDesign/' : '/')

function joinBasePath(base: string, child: string) {
  return `${base.replace(/\/$/, '')}/${child.replace(/^\//, '')}`
}

export default defineConfig({
  base: basePath,
  define: {
    CESIUM_BASE_URL: JSON.stringify(joinBasePath(basePath, 'cesium')),
  },
  optimizeDeps: {
    include: ['cesium'],
  },
  plugins: [cesiumAssetsPlugin()],
})

function cesiumAssetsPlugin(): Plugin {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const cesiumRoot = path.resolve(currentDir, 'node_modules/cesium/Build/Cesium')

  return {
    name: 'geo-effect-kit-cesium-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/cesium/')) {
          next()
          return
        }

        const assetPath = path.join(cesiumRoot, decodeURIComponent(req.url.replace('/cesium/', '').split('?')[0] ?? ''))
        if (!assetPath.startsWith(cesiumRoot) || !existsSync(assetPath) || !statSync(assetPath).isFile()) {
          next()
          return
        }

        res.setHeader('Content-Type', getContentType(assetPath))
        createReadStream(assetPath).pipe(res)
      })
    },
    closeBundle() {
      copyDirectory(cesiumRoot, path.resolve(currentDir, 'dist/cesium'))
    },
  }
}

function copyDirectory(source: string, target: string) {
  mkdirSync(target, { recursive: true })
  for (const entry of readdirSync(source)) {
    const sourcePath = path.join(source, entry)
    const targetPath = path.join(target, entry)
    if (statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, targetPath)
    } else {
      copyFileSync(sourcePath, targetPath)
    }
  }
}

function getContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase()
  switch (extension) {
    case '.json':
      return 'application/json'
    case '.js':
      return 'text/javascript'
    case '.css':
      return 'text/css'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.svg':
      return 'image/svg+xml'
    case '.wasm':
      return 'application/wasm'
    default:
      return 'application/octet-stream'
  }
}
