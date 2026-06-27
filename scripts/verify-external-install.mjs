import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const root = process.cwd()
const tmp = mkdtempSync(path.join(tmpdir(), 'geo-effect-kit-smoke-'))
const packDir = path.join(tmp, 'packs')

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd ?? tmp,
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  })
}

try {
  mkdirSync(packDir, { recursive: true })
  run('pnpm', ['--filter', '@ztgkzhaohao/geo-effect-kit', 'pack', '--pack-destination', packDir], { cwd: root })
  const tarball = run('find', [packDir, '-name', '*.tgz']).trim().split(/\r?\n/)[0]
  if (!tarball) throw new Error('No SDK tarball produced')

  writeFileSync(
    path.join(tmp, 'package.json'),
    JSON.stringify(
      {
        type: 'module',
        scripts: {
          typecheck: 'tsc -p tsconfig.json --noEmit',
          build: 'vite build',
        },
        dependencies: {
          '@ztgkzhaohao/geo-effect-kit': tarball,
          cesium: '^1.136.0',
          vite: '^7.2.4',
          typescript: '^5.9.3',
        },
        devDependencies: {},
      },
      null,
      2,
    ),
  )

  writeFileSync(
    path.join(tmp, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          skipLibCheck: true,
          noEmit: true,
        },
        include: ['src/**/*.ts'],
      },
      null,
      2,
    ),
  )

  writeFileSync(
    path.join(tmp, 'index.html'),
    '<!doctype html><html><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>\n',
  )

  writeFileSync(
    path.join(tmp, 'vite.config.ts'),
    "import { defineConfig } from 'vite'\n\nexport default defineConfig({ define: { CESIUM_BASE_URL: JSON.stringify('/cesium') } })\n",
  )

  mkdirSync(path.join(tmp, 'src'), { recursive: true })
  writeFileSync(
    path.join(tmp, 'src/main.ts'),
    `import 'cesium/Build/Cesium/Widgets/widgets.css'
import type { Viewer } from 'cesium'
import { createRadarScanEffect, createSceneWeatherEffect } from '@ztgkzhaohao/geo-effect-kit'

declare const viewer: Viewer

const radar = createRadarScanEffect(viewer, {
  center: { longitude: 116.391, latitude: 39.907 },
  radiusMeters: 22000,
  color: '#36d6ff',
})

const weather = createSceneWeatherEffect(viewer, {
  type: 'rain',
  intensity: 0.4,
})

radar.hide()
radar.show()
weather.destroy()
radar.destroy()
`,
  )

  run('pnpm', ['install', '--ignore-scripts'], { cwd: tmp, stdio: 'inherit' })
  run('pnpm', ['typecheck'], { cwd: tmp, stdio: 'inherit' })
  run('pnpm', ['build'], { cwd: tmp, stdio: 'inherit' })

  console.log(`External install smoke test passed in ${tmp}`)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
