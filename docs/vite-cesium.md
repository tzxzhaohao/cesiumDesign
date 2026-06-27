# Vite 与 Cesium 静态资源

Cesium 运行时需要访问 Workers、Assets、Widgets 和 ThirdParty 等静态资源。`@ztgk/geo-effect-kit` 不打包这些资源，宿主项目需要自己配置。

## 最小 Vite 配置

```ts
import { defineConfig, type Plugin } from 'vite'
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs'
import path from 'node:path'

export default defineConfig({
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium'),
  },
  optimizeDeps: {
    include: ['cesium'],
  },
  plugins: [cesiumAssetsPlugin()],
})

function cesiumAssetsPlugin(): Plugin {
  const cesiumRoot = path.resolve(process.cwd(), 'node_modules/cesium/Build/Cesium')

  return {
    name: 'cesium-assets',
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

        createReadStream(assetPath).pipe(res)
      })
    },
    closeBundle() {
      copyDirectory(cesiumRoot, path.resolve(process.cwd(), 'dist/cesium'))
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
```

## CSS

入口文件需要引入 Cesium widgets 样式：

```ts
import 'cesium/Build/Cesium/Widgets/widgets.css'
```

## GitHub Pages

如果应用部署在子路径，例如 `/cesiumDesign/`，需要确保 Vite `base` 和 Cesium 静态资源路径一致。当前 demo 使用 `/cesium` 作为 Cesium 资源目录，构建后会复制到 `dist/cesium`。
