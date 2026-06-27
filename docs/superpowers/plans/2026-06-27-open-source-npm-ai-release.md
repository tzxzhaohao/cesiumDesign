# Open Source npm AI Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare `geo-effect-kit` for GitHub open source release, public npm publishing, GitHub Pages demo deployment, and AI agent/MCP consumption.

**Architecture:** Keep the current monorepo shape: `packages/core` is the runtime SDK, `apps/demo` is the public demo, `knowledge` is the machine-readable effect knowledge base, and `mcp-server` is the optional AI/MCP adapter. The release work adds public metadata, documentation, validation scripts, and GitHub workflows without rewriting the Cesium effect runtime.

**Tech Stack:** TypeScript, pnpm workspaces, Cesium, Vite, Node test runner, GitHub Actions, npm public packages, Model Context Protocol.

---

## File Structure

Create or modify the following files:

- Modify: `package.json`  
  Add root release helper scripts used by humans and CI.
- Modify: `packages/core/package.json`  
  Add public npm metadata, repository links, license, keywords, and `publishConfig`.
- Modify: `mcp-server/package.json`  
  Remove `private`, add public npm metadata, package files, repository links, license, keywords, and `publishConfig`.
- Modify: `apps/demo/vite.config.ts`  
  Add GitHub Pages-compatible base path driven by `GITHUB_PAGES` or `VITE_BASE_PATH`.
- Create: `LICENSE`  
  MIT license.
- Create: `CONTRIBUTING.md`  
  Development and contribution guide.
- Create: `CHANGELOG.md`  
  Initial release notes.
- Modify/Create: `README.md`  
  Root project overview, install, minimal usage, demo, AI/MCP, package links, and development commands.
- Create: `README.zh-CN.md`  
  Chinese root documentation mirroring the important content.
- Create: `packages/core/README.md`  
  npm package README for `@ztgk/geo-effect-kit`.
- Create: `packages/core/LICENSE`  
  Package-local MIT license copy for the SDK npm tarball.
- Create: `docs/getting-started.md`  
  First-use guide for installing and rendering an effect.
- Create: `docs/vite-cesium.md`  
  Cesium asset handling guide for Vite host projects.
- Create: `docs/react.md`  
  React lifecycle integration guide.
- Create: `docs/vue.md`  
  Vue lifecycle integration guide.
- Create: `docs/ai-agents.md`  
  AI/MCP usage guide.
- Create: `docs/release.md`  
  Maintainer release checklist.
- Create: `mcp-server/README.md`  
  Published MCP package usage and client configuration.
- Create: `mcp-server/LICENSE`  
  Package-local MIT license copy for the MCP npm tarball.
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`  
  Bug report template.
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`  
  Feature request template.
- Create: `.github/PULL_REQUEST_TEMPLATE.md`  
  Pull request checklist.
- Create: `.github/workflows/ci.yml`  
  Pull request and push validation.
- Create: `.github/workflows/pages.yml`  
  GitHub Pages demo deployment.
- Create: `.github/workflows/release.yml`  
  Manual npm release workflow for core and MCP packages.
- Create: `scripts/verify-package.mjs`  
  Local package tarball validation script.
- Create: `scripts/verify-external-install.mjs`  
  Temporary external Vite install smoke test.

Existing user changes are present in the workspace. Each task must stage only the files listed for that task and must not revert unrelated edits.

---

## Task 1: Add Public Package Metadata

**Files:**
- Modify: `packages/core/package.json`
- Modify: `mcp-server/package.json`
- Modify: `package.json`

- [ ] **Step 1: Inspect current package files**

Run:

```bash
sed -n '1,180p' package.json
sed -n '1,180p' packages/core/package.json
sed -n '1,180p' mcp-server/package.json
```

Expected: root package remains private; core package is public-ready but missing metadata; MCP package has `"private": true`.

- [ ] **Step 2: Update `packages/core/package.json`**

Set the file content to preserve existing fields and add public metadata:

```json
{
  "name": "@ztgk/geo-effect-kit",
  "version": "0.1.0",
  "type": "module",
  "description": "Framework-neutral Cesium effects SDK for geospatial visualizations.",
  "license": "MIT",
  "author": "zhaohao",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/tzxzhaohao/cesiumDesign.git",
    "directory": "packages/core"
  },
  "homepage": "https://tzxzhaohao.github.io/cesiumDesign/",
  "bugs": {
    "url": "https://github.com/tzxzhaohao/cesiumDesign/issues"
  },
  "keywords": [
    "cesium",
    "gis",
    "webgis",
    "visualization",
    "effects",
    "shader",
    "typescript",
    "mcp",
    "ai-agent"
  ],
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "pnpm run build && node --test test/*.test.mjs",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "peerDependencies": {
    "cesium": ">=1.120.0"
  },
  "dependencies": {
    "gifuct-js": "^2.1.2"
  },
  "devDependencies": {
    "cesium": "^1.136.0",
    "typescript": "^5.9.3"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

- [ ] **Step 3: Update `mcp-server/package.json`**

Remove `"private": true` and set the file content to:

```json
{
  "name": "@ztgk/geo-effect-kit-mcp",
  "version": "0.1.0",
  "type": "module",
  "description": "MCP server for geo-effect-kit Cesium effect manifests and integration examples.",
  "license": "MIT",
  "author": "zhaohao",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/tzxzhaohao/cesiumDesign.git",
    "directory": "mcp-server"
  },
  "homepage": "https://github.com/tzxzhaohao/cesiumDesign#readme",
  "bugs": {
    "url": "https://github.com/tzxzhaohao/cesiumDesign/issues"
  },
  "keywords": [
    "mcp",
    "model-context-protocol",
    "cesium",
    "gis",
    "ai-agent",
    "geo-effect-kit"
  ],
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "geo-effect-kit-mcp": "./dist/cli.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "package.json"
  ],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "pnpm run build && node --test test/*.test.mjs",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.24.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/node": "^24.10.1",
    "typescript": "^5.9.3"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

- [ ] **Step 4: Add root helper scripts**

Modify root `package.json` scripts to include package validation helpers while preserving existing scripts:

```json
{
  "scripts": {
    "build": "pnpm --filter @ztgk/geo-effect-kit build && pnpm --filter @ztgk/geo-effect-kit-mcp build && pnpm --filter geo-effect-kit-demo build",
    "test": "pnpm --filter @ztgk/geo-effect-kit test && pnpm --filter @ztgk/geo-effect-kit-mcp test && pnpm --filter geo-effect-kit-demo test",
    "typecheck": "pnpm --filter @ztgk/geo-effect-kit typecheck && pnpm --filter @ztgk/geo-effect-kit-mcp typecheck && pnpm --filter geo-effect-kit-demo typecheck",
    "pack:check": "node scripts/verify-package.mjs",
    "smoke:external": "node scripts/verify-external-install.mjs"
  }
}
```

Keep the existing top-level `name`, `private`, `version`, `type`, `packageManager`, and `devDependencies`.

- [ ] **Step 5: Validate package JSON**

Run:

```bash
node -e "JSON.parse(require('node:fs').readFileSync('package.json','utf8')); JSON.parse(require('node:fs').readFileSync('packages/core/package.json','utf8')); JSON.parse(require('node:fs').readFileSync('mcp-server/package.json','utf8')); console.log('package json ok')"
```

Expected: `package json ok`.

- [ ] **Step 6: Commit**

Run:

```bash
git add package.json packages/core/package.json mcp-server/package.json
git commit -m "chore: add public package metadata"
```

Expected: commit succeeds and no unrelated files are staged.

---

## Task 2: Add Open Source Repository Files

**Files:**
- Create: `LICENSE`
- Create: `CONTRIBUTING.md`
- Create: `CHANGELOG.md`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`

- [ ] **Step 1: Create MIT license**

Create `LICENSE` with:

```text
MIT License

Copyright (c) 2026 zhaohao

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Create contribution guide**

Create `CONTRIBUTING.md` with:

````markdown
# Contributing

Thanks for helping improve `geo-effect-kit`.

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm --filter geo-effect-kit-demo dev
```

## Project layout

- `packages/core`: the public Cesium effects SDK.
- `apps/demo`: Vite demo for previewing effects and generated usage snippets.
- `knowledge/effects`: machine-readable effect manifests.
- `knowledge/docs`: effect-level documentation for humans and AI agents.
- `mcp-server`: optional MCP server for querying effect manifests and examples.

## Pull requests

Before opening a pull request:

- Keep runtime SDK changes inside `packages/core` unless the demo or knowledge layer also needs updates.
- Add or update tests for SDK behavior changes.
- Update `knowledge/effects` and `knowledge/docs` when adding or changing public effect options.
- Run `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- Keep generated or vendor files out of unrelated changes.

## Public API expectations

Effects should accept an existing Cesium `Viewer` and return an instance with the common lifecycle methods:

- `update(options)`
- `show()`
- `hide()`
- `flyTo(options?)`
- `destroy()`
- `isVisible()`
- `isDestroyed()`
- `getOptions()`
````

- [ ] **Step 3: Create changelog**

Create `CHANGELOG.md` with:

````markdown
# Changelog

All notable changes to this project will be documented in this file.

This project follows semantic versioning after the public npm release. During `0.x`, public APIs may still evolve, but breaking changes should be documented here.

## 0.1.0 - 2026-06-27

- Initial public release preparation for `@ztgk/geo-effect-kit`.
- Added reusable Cesium effects including radar scan, ripple spread, fly line, pipe flow, water surface, light wall, scan cone, shield dome, temperature field, scene weather, post-process effects, polyline flow, and GIF fire billboards.
- Added machine-readable effect manifests and documentation for AI agents.
- Added MCP server package preparation for querying effect schemas and usage examples.
````

- [ ] **Step 4: Create GitHub issue templates**

Create `.github/ISSUE_TEMPLATE/bug_report.yml`:

```yaml
name: Bug report
description: Report a reproducible issue in geo-effect-kit.
title: "[Bug]: "
labels: ["bug"]
body:
  - type: textarea
    id: description
    attributes:
      label: Description
      description: What happened?
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Reproduction
      description: Provide a minimal reproduction or steps to reproduce.
      placeholder: |
        1. Install @ztgk/geo-effect-kit
        2. Create a Cesium Viewer
        3. Call createRadarScanEffect(viewer, { center: { longitude: 116.391, latitude: 39.907 }, radiusMeters: 22000 })
    validations:
      required: true
  - type: input
    id: versions
    attributes:
      label: Versions
      description: geo-effect-kit, Cesium, browser, Node.js, package manager.
      placeholder: "@ztgk/geo-effect-kit 0.1.0, Cesium 1.136.0, Chrome 126"
    validations:
      required: true
  - type: textarea
    id: logs
    attributes:
      label: Console output
      description: Paste relevant terminal or browser console output.
      render: text
```

Create `.github/ISSUE_TEMPLATE/feature_request.yml`:

```yaml
name: Feature request
description: Suggest an effect, integration, or documentation improvement.
title: "[Feature]: "
labels: ["enhancement"]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem
      description: What use case should this solve?
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Proposal
      description: Describe the API, visual effect, or documentation you want.
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives
      description: Mention any workaround or similar library you considered.
```

- [ ] **Step 5: Create PR template**

Create `.github/PULL_REQUEST_TEMPLATE.md`:

````markdown
## Summary

- 

## Validation

- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`

## Checklist

- [ ] Public API changes are documented.
- [ ] Effect manifest changes are reflected in `knowledge/effects`.
- [ ] Effect docs are reflected in `knowledge/docs`.
- [ ] Demo changes are included when user-facing behavior changes.
- [ ] No npm tokens, API keys, or local credentials are committed.
````

- [ ] **Step 6: Validate repository files**

Run:

```bash
test -f LICENSE
test -f CONTRIBUTING.md
test -f CHANGELOG.md
test -f .github/ISSUE_TEMPLATE/bug_report.yml
test -f .github/ISSUE_TEMPLATE/feature_request.yml
test -f .github/PULL_REQUEST_TEMPLATE.md
```

Expected: command exits with status 0.

- [ ] **Step 7: Commit**

Run:

```bash
git add LICENSE CONTRIBUTING.md CHANGELOG.md .github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/feature_request.yml .github/PULL_REQUEST_TEMPLATE.md
git commit -m "docs: add open source project files"
```

Expected: commit succeeds and no unrelated files are staged.

---

## Task 3: Rewrite Root README and Add Chinese README

**Files:**
- Modify: `README.md`
- Create: `README.zh-CN.md`

- [ ] **Step 1: Inspect existing README**

Run:

```bash
sed -n '1,260p' README.md
```

Expected: README already lists current effects and minimal examples. Preserve accurate API examples, but restructure for public release.

- [ ] **Step 2: Replace `README.md` with public-facing content**

Use this structure in `README.md`:

````markdown
# geo-effect-kit

Framework-neutral Cesium effects for WebGIS dashboards, emergency command systems, 3D maps, and AI-assisted geospatial applications.

[中文文档](./README.zh-CN.md)

## Features

- Works with an existing Cesium `Viewer`.
- Framework-neutral TypeScript API.
- Reusable effects for radar scans, ripple spread, fly lines, pipe flow, water surfaces, light walls, scan cones, shield domes, temperature fields, GIF fire billboards, scene weather, post-processing, and route flow.
- Common lifecycle API: `update`, `show`, `hide`, `flyTo`, `destroy`.
- Machine-readable manifests for AI agents.
- Optional MCP server for effect discovery and integration examples.

## Install

```bash
pnpm add @ztgk/geo-effect-kit cesium
```

Cesium is a peer dependency. The host project owns Cesium versioning, static assets, `CESIUM_BASE_URL`, and Viewer initialization.

## Minimal Usage

```ts
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { Viewer } from 'cesium'
import { createRadarScanEffect } from '@ztgk/geo-effect-kit'

const viewer = new Viewer('cesiumContainer')

const radar = createRadarScanEffect(viewer, {
  center: { longitude: 116.391, latitude: 39.907 },
  radiusMeters: 22000,
  color: '#36d6ff',
  scanDurationMs: 3600,
})

radar.flyTo()

// Later, when the layer or page is removed:
radar.destroy()
```

## Available Effects

| Effect | Import | Use case |
| --- | --- | --- |
| Radar scan | `createRadarScanEffect` | Circular radar and warning scans |
| Ripple spread | `createRippleSpreadEffect` | Water, energy, and soft ripple expansion |
| Polyline flow | `createPolylineFlowEffect` | Dispatch routes, data links, migration paths |
| Fly line | `createFlyLineEffect` | High-altitude arcs, hub-spoke links, bidirectional routes |
| Pipe flow | `createPipeFlowEffect` | Water pipes and pressure flow |
| Water surface | `createWaterSurfaceEffect` | Rivers, lakes, and flood surfaces |
| Light wall | `createLightWallEffect` | Security boundaries and protected areas |
| Scan cone | `createScanConeEffect` | Searchlights, sensors, cameras, drones |
| Shield dome | `createShieldDomeEffect` | Protective domes and highlighted regions |
| Temperature field | `createTemperatureFieldEffect` | Risk surfaces and heat fields |
| Fire billboard | `createFireBillboardEffect` | GIF fire markers by longitude/latitude |
| Scene weather | `createSceneWeatherEffect` | Rain, snow, fog, lightning |
| Post process | `createPostProcessEffect` | Bloom, night vision, black-white, brightness, mosaic, depth of field |

## Documentation

- [Getting started](./docs/getting-started.md)
- [Vite and Cesium assets](./docs/vite-cesium.md)
- [React usage](./docs/react.md)
- [Vue usage](./docs/vue.md)
- [AI agents and MCP](./docs/ai-agents.md)
- [Release process](./docs/release.md)

Effect-level manifests and long-form effect notes live in:

- [`knowledge/effects`](./knowledge/effects)
- [`knowledge/docs`](./knowledge/docs)

## Demo

Run locally:

```bash
pnpm install
pnpm --filter geo-effect-kit-demo dev
```

After GitHub Pages is enabled, the public demo will be available at:

```text
https://tzxzhaohao.github.io/cesiumDesign/
```

## AI Agent Usage

AI agents should prefer the structured knowledge files instead of reverse-engineering examples from the demo:

- Use `knowledge/effects/*.effect.json` for effect IDs, imports, options, methods, examples, and notes.
- Use `knowledge/docs/*.md` for effect-specific integration guidance.
- Use `@ztgk/geo-effect-kit-mcp` when the agent supports MCP tools.

Start the MCP server:

```bash
npx @ztgk/geo-effect-kit-mcp
```

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## License

MIT
````

- [ ] **Step 3: Create `README.zh-CN.md`**

Create `README.zh-CN.md` with:

````markdown
# geo-effect-kit

面向 Cesium 的框架无关动效 SDK，适合 WebGIS 大屏、应急指挥、三维地图和 AI 辅助地理可视化项目。

[English README](./README.md)

## 特性

- 接收已有 Cesium `Viewer`，不接管宿主项目的地图初始化。
- TypeScript API，React、Vue、原生项目都可以使用。
- 内置雷达扫描、水波扩散、飞线、水管流动、水面、光墙、锥形扫描、护盾、温度场、GIF 火点、天气、后处理和路线流光等效果。
- 统一生命周期：`update`、`show`、`hide`、`flyTo`、`destroy`。
- 提供机器可读的效果 manifest，方便 AI 智能体读取。
- 提供可选 MCP server，用于查询效果 schema 和集成示例。

## 安装

```bash
pnpm add @ztgk/geo-effect-kit cesium
```

Cesium 是 peer dependency，由宿主项目负责版本、静态资源、`CESIUM_BASE_URL` 和 `Viewer` 初始化。

## 最小用法

```ts
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { Viewer } from 'cesium'
import { createRadarScanEffect } from '@ztgk/geo-effect-kit'

const viewer = new Viewer('cesiumContainer')

const radar = createRadarScanEffect(viewer, {
  center: { longitude: 116.391, latitude: 39.907 },
  radiusMeters: 22000,
  color: '#36d6ff',
  scanDurationMs: 3600,
})

radar.flyTo()

// 页面、图层或 Viewer 销毁前调用
radar.destroy()
```

## 文档

- [快速开始](./docs/getting-started.md)
- [Vite 与 Cesium 静态资源](./docs/vite-cesium.md)
- [React 接入](./docs/react.md)
- [Vue 接入](./docs/vue.md)
- [AI 智能体与 MCP](./docs/ai-agents.md)
- [发布流程](./docs/release.md)

效果级知识文件：

- [`knowledge/effects`](./knowledge/effects)
- [`knowledge/docs`](./knowledge/docs)

## Demo

```bash
pnpm install
pnpm --filter geo-effect-kit-demo dev
```

GitHub Pages 启用后，在线 demo 地址：

```text
https://tzxzhaohao.github.io/cesiumDesign/
```

## AI 智能体

智能体应优先读取结构化知识文件：

- `knowledge/effects/*.effect.json`：效果 ID、导入名、参数、方法、示例和注意事项。
- `knowledge/docs/*.md`：每个效果的详细说明和迁移建议。
- `@ztgk/geo-effect-kit-mcp`：支持 MCP 的智能体可直接查询效果信息。

启动 MCP server：

```bash
npx @ztgk/geo-effect-kit-mcp
```

## 开发

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## 许可证

MIT
````

- [ ] **Step 4: Validate README links**

Run:

```bash
rg -n "docs/getting-started|docs/vite-cesium|docs/react|docs/vue|docs/ai-agents|docs/release|README.zh-CN" README.md README.zh-CN.md
```

Expected: all intended doc links are present. Some target files are created in later tasks, so broken-link validation is deferred until Task 5.

- [ ] **Step 5: Commit**

Run:

```bash
git add README.md README.zh-CN.md
git commit -m "docs: refresh public readme"
```

Expected: commit succeeds and no unrelated files are staged.

---

## Task 4: Add npm Package README and License Copies

**Files:**
- Create: `packages/core/README.md`
- Create: `packages/core/LICENSE`
- Create: `mcp-server/LICENSE`

- [ ] **Step 1: Create SDK package README**

Create `packages/core/README.md` with:

````markdown
# @ztgk/geo-effect-kit

Framework-neutral Cesium effects SDK.

## Install

```bash
pnpm add @ztgk/geo-effect-kit cesium
```

Cesium is a peer dependency. The host project owns Cesium static assets, `CESIUM_BASE_URL`, widgets CSS, and Viewer initialization.

## Minimal usage

```ts
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { Viewer } from 'cesium'
import { createRadarScanEffect } from '@ztgk/geo-effect-kit'

const viewer = new Viewer('cesiumContainer')

const radar = createRadarScanEffect(viewer, {
  center: { longitude: 116.391, latitude: 39.907 },
  radiusMeters: 22000,
  color: '#36d6ff',
})

radar.flyTo()
radar.destroy()
```

## Documentation

- Repository: https://github.com/tzxzhaohao/cesiumDesign
- Demo: https://tzxzhaohao.github.io/cesiumDesign/
- AI/MCP package: `@ztgk/geo-effect-kit-mcp`

## License

MIT
````

- [ ] **Step 2: Create SDK package license**

Create `packages/core/LICENSE` with the same MIT text as root `LICENSE`:

```text
MIT License

Copyright (c) 2026 zhaohao

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 3: Create MCP package license**

Run:

```bash
cp packages/core/LICENSE mcp-server/LICENSE
```

Expected: `mcp-server/LICENSE` contains the same MIT license text as `packages/core/LICENSE`.

- [ ] **Step 4: Validate package-local files**

Run:

```bash
test -f packages/core/README.md
test -f packages/core/LICENSE
test -f mcp-server/LICENSE
```

Expected: command exits with status 0.

- [ ] **Step 5: Commit**

Run:

```bash
git add packages/core/README.md packages/core/LICENSE mcp-server/LICENSE
git commit -m "docs: add package readme and license files"
```

Expected: commit succeeds and no unrelated files are staged.

---

## Task 5: Add Developer Integration Documentation

**Files:**
- Create: `docs/getting-started.md`
- Create: `docs/vite-cesium.md`
- Create: `docs/react.md`
- Create: `docs/vue.md`

- [ ] **Step 1: Create getting started guide**

Create `docs/getting-started.md` with:

````markdown
# 快速开始

`@ztgk/geo-effect-kit` 是一个面向 Cesium 的动效 SDK。它不创建 `Viewer`，只接收宿主项目已经创建好的 Cesium `Viewer`。

## 安装

```bash
pnpm add @ztgk/geo-effect-kit cesium
```

## 基础示例

```ts
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { Viewer } from 'cesium'
import { createRippleSpreadEffect } from '@ztgk/geo-effect-kit'

const viewer = new Viewer('cesiumContainer')

const ripple = createRippleSpreadEffect(viewer, {
  center: { longitude: 116.391, latitude: 39.907 },
  radiusMeters: 28000,
  type: 'water',
  color: '#62e8ff',
  ringCount: 5,
  durationMs: 2400,
})

ripple.flyTo()
```

## 生命周期

每个效果实例都应该由业务页面或图层保存引用：

```ts
const effect = createRippleSpreadEffect(viewer, options)

effect.update({ color: '#ff5d5d' })
effect.hide()
effect.show()
effect.flyTo()
effect.destroy()
```

页面卸载、图层关闭或 `Viewer` 销毁前必须调用 `destroy()`，避免 Cesium entity、primitive 或 post-process stage 残留。

## 坐标

SDK 参数默认使用 WGS84 经纬度：

```ts
{ longitude: 116.391, latitude: 39.907, height: 0 }
```

高度单位是米。
````

- [ ] **Step 2: Create Vite/Cesium guide**

Create `docs/vite-cesium.md` with:

````markdown
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
````

- [ ] **Step 3: Create React guide**

Create `docs/react.md` with:

````markdown
# React 接入

React 页面中建议把 Cesium `Viewer` 和效果实例都放在 `useEffect` 生命周期里管理。

```tsx
import { useEffect, useRef } from 'react'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { Viewer, type Viewer as CesiumViewer } from 'cesium'
import { createFlyLineEffect, type FlyLineEffectInstance } from '@ztgk/geo-effect-kit'

export function CesiumMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<CesiumViewer | null>(null)
  const effectRef = useRef<FlyLineEffectInstance | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const viewer = new Viewer(containerRef.current)
    viewerRef.current = viewer

    effectRef.current = createFlyLineEffect(viewer, {
      lines: [
        {
          from: { longitude: 116.285, latitude: 39.87 },
          to: { longitude: 116.391, latitude: 39.907 },
        },
      ],
      mode: 'single-arc',
      color: '#5ee8ff',
    })

    effectRef.current.flyTo()

    return () => {
      effectRef.current?.destroy()
      effectRef.current = null
      viewer.destroy()
      viewerRef.current = null
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
```

如果业务参数变化，优先调用 `effect.update(nextOptions)`，不要反复创建新实例。只有几何结构发生大变化或页面卸载时才销毁。
````

- [ ] **Step 4: Create Vue guide**

Create `docs/vue.md` with:

````markdown
# Vue 接入

Vue 页面中建议在 `onMounted` 创建 `Viewer` 和效果实例，在 `onBeforeUnmount` 中统一销毁。

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { Viewer } from 'cesium'
import { createRadarScanEffect, type RadarScanEffectInstance } from '@ztgk/geo-effect-kit'

const containerRef = ref<HTMLDivElement | null>(null)

let viewer: Viewer | null = null
let radar: RadarScanEffectInstance | null = null

onMounted(() => {
  if (!containerRef.value) return

  viewer = new Viewer(containerRef.value)
  radar = createRadarScanEffect(viewer, {
    center: { longitude: 116.391, latitude: 39.907 },
    radiusMeters: 22000,
    color: '#36d6ff',
  })
  radar.flyTo()
})

onBeforeUnmount(() => {
  radar?.destroy()
  radar = null
  viewer?.destroy()
  viewer = null
})
</script>

<template>
  <div ref="containerRef" class="cesium-map" />
</template>

<style scoped>
.cesium-map {
  width: 100%;
  height: 100%;
}
</style>
```

如果参数来自 Vue 响应式状态，监听参数变化后调用 `radar?.update(nextOptions)`。
````

- [ ] **Step 5: Validate docs exist**

Run:

```bash
test -f docs/getting-started.md
test -f docs/vite-cesium.md
test -f docs/react.md
test -f docs/vue.md
```

Expected: command exits with status 0.

- [ ] **Step 6: Commit**

Run:

```bash
git add docs/getting-started.md docs/vite-cesium.md docs/react.md docs/vue.md
git commit -m "docs: add integration guides"
```

Expected: commit succeeds and no unrelated files are staged.

---

## Task 6: Add AI Agent and MCP Documentation

**Files:**
- Create: `docs/ai-agents.md`
- Create: `mcp-server/README.md`

- [ ] **Step 1: Create AI agents guide**

Create `docs/ai-agents.md` with:

````markdown
# AI 智能体与 MCP

`geo-effect-kit` 为 AI 智能体提供两种入口：

1. 仓库内的结构化知识文件。
2. 可选的 MCP server。

## 结构化知识文件

智能体生成集成代码时应优先读取：

- `knowledge/effects/*.effect.json`
- `knowledge/docs/*.md`

`knowledge/effects` 适合机器读取，包含效果 ID、包名、导入名、参数、方法、示例和注意事项。`knowledge/docs` 适合补充理解具体效果的适用场景和迁移说明。

## MCP server

安装或直接运行：

```bash
npx @ztgk/geo-effect-kit-mcp
```

MCP server 提供以下工具：

- `list_effects`
- `get_effect_schema`
- `get_usage_example`
- `generate_integration_notes`

## 通用 MCP 配置

```json
{
  "mcpServers": {
    "geo-effect-kit": {
      "command": "npx",
      "args": ["@ztgk/geo-effect-kit-mcp"]
    }
  }
}
```

## 智能体生成代码原则

- 导入运行时代码时使用 `@ztgk/geo-effect-kit`。
- 查询效果知识时使用 MCP 或 `knowledge` 文件。
- 不要从 demo UI 反推 API。
- 宿主项目必须自己创建 Cesium `Viewer`。
- 页面卸载或图层移除时必须调用效果实例的 `destroy()`。
- Cesium 静态资源配置属于宿主项目责任。
````

- [ ] **Step 2: Create MCP package README**

Create `mcp-server/README.md` with:

````markdown
# @ztgk/geo-effect-kit-mcp

MCP server for querying `geo-effect-kit` Cesium effect manifests, schemas, usage examples, and integration notes.

## Usage

```bash
npx @ztgk/geo-effect-kit-mcp
```

## Tools

- `list_effects`: list all available effects.
- `get_effect_schema`: return the manifest and option schema for one effect.
- `get_usage_example`: return a named usage example.
- `generate_integration_notes`: generate target-project integration notes.

## MCP client configuration

```json
{
  "mcpServers": {
    "geo-effect-kit": {
      "command": "npx",
      "args": ["@ztgk/geo-effect-kit-mcp"]
    }
  }
}
```

## Relationship to the SDK

Runtime projects install `@ztgk/geo-effect-kit`. AI agents and MCP clients use `@ztgk/geo-effect-kit-mcp` to discover effects and generate integration code.
````

- [ ] **Step 3: Validate docs mention all MCP tools**

Run:

```bash
rg -n "list_effects|get_effect_schema|get_usage_example|generate_integration_notes" docs/ai-agents.md mcp-server/README.md
```

Expected: both files mention the MCP tools.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/ai-agents.md mcp-server/README.md
git commit -m "docs: add ai agent mcp guides"
```

Expected: commit succeeds and no unrelated files are staged.

---

## Task 7: Add Package Verification Scripts

**Files:**
- Create: `scripts/verify-package.mjs`
- Create: `scripts/verify-external-install.mjs`

- [ ] **Step 1: Create `scripts/verify-package.mjs`**

Create `scripts/verify-package.mjs` with:

```js
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const root = process.cwd()
const tmp = mkdtempSync(path.join(tmpdir(), 'geo-effect-kit-pack-'))

try {
  const output = execFileSync('pnpm', ['--filter', '@ztgk/geo-effect-kit', 'pack', '--pack-destination', tmp], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const tarball = output
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.endsWith('.tgz'))

  if (!tarball) {
    throw new Error(`Could not find packed tarball in output:\n${output}`)
  }

  const tarballPath = path.isAbsolute(tarball) ? tarball : path.join(tmp, path.basename(tarball))
  const listing = execFileSync('tar', ['-tzf', tarballPath], {
    cwd: root,
    encoding: 'utf8',
  })

  const required = [
    'package/package.json',
    'package/dist/index.js',
    'package/dist/index.d.ts',
    'package/README.md',
    'package/LICENSE',
  ]

  for (const file of required) {
    if (!listing.includes(file)) {
      throw new Error(`Packed package is missing ${file}`)
    }
  }

  const forbidden = [
    'package/test/',
    'package/src/',
    'package/apps/',
    'package/node_modules/',
  ]

  for (const file of forbidden) {
    if (listing.includes(file)) {
      throw new Error(`Packed package includes forbidden path ${file}`)
    }
  }

  console.log(`Package tarball verified: ${tarballPath}`)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
```

- [ ] **Step 2: Create `scripts/verify-external-install.mjs`**

Create `scripts/verify-external-install.mjs` with:

```js
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
  run('pnpm', ['--filter', '@ztgk/geo-effect-kit', 'pack', '--pack-destination', packDir], { cwd: root })
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
          '@ztgk/geo-effect-kit': tarball,
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
import { createRadarScanEffect, createSceneWeatherEffect } from '@ztgk/geo-effect-kit'

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
```

- [ ] **Step 3: Run package verification script**

Run:

```bash
pnpm build
pnpm pack:check
```

Expected: build succeeds and output starts with `Package tarball verified:`.

- [ ] **Step 4: Run external install smoke test**

Run:

```bash
pnpm smoke:external
```

Expected: temporary Vite project installs the packed SDK, typechecks, builds, and prints `External install smoke test passed`.

- [ ] **Step 5: Commit**

Run:

```bash
git add scripts/verify-package.mjs scripts/verify-external-install.mjs
git commit -m "test: add package publish smoke checks"
```

Expected: commit succeeds and no unrelated files are staged.

---

## Task 8: Add GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create CI workflow**

Create `.github/workflows/ci.yml` with:

```yaml
name: CI

on:
  push:
    branches:
      - master
      - main
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 11.7.0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Verify package tarball
        run: pnpm pack:check
```

- [ ] **Step 2: Validate workflow syntax shape**

Run:

```bash
test -f .github/workflows/ci.yml
rg -n "pnpm typecheck|pnpm test|pnpm build|pnpm pack:check" .github/workflows/ci.yml
```

Expected: all CI commands are present.

- [ ] **Step 3: Run local CI equivalent**

Run:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm pack:check
```

Expected: all commands pass.

- [ ] **Step 4: Commit**

Run:

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add validation workflow"
```

Expected: commit succeeds and no unrelated files are staged.

---

## Task 9: Add GitHub Pages Demo Deployment

**Files:**
- Modify: `apps/demo/vite.config.ts`
- Create: `.github/workflows/pages.yml`

- [ ] **Step 1: Update demo Vite base path**

Modify `apps/demo/vite.config.ts` so the config includes a `base` value and a helper for joining base paths:

```ts
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
```

Keep the existing `cesiumAssetsPlugin`, `copyDirectory`, and `getContentType` implementations.

- [ ] **Step 2: Create Pages workflow**

Create `.github/workflows/pages.yml` with:

```yaml
name: Deploy Demo

on:
  push:
    branches:
      - master
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 11.7.0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Build demo
        run: GITHUB_PAGES=true pnpm --filter geo-effect-kit-demo build

      - name: Configure Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: apps/demo/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Test Pages build locally**

Run:

```bash
GITHUB_PAGES=true pnpm --filter geo-effect-kit-demo build
test -d apps/demo/dist/cesium
```

Expected: demo builds and `apps/demo/dist/cesium` exists.

- [ ] **Step 4: Commit**

Run:

```bash
git add apps/demo/vite.config.ts .github/workflows/pages.yml
git commit -m "ci: add demo pages deployment"
```

Expected: commit succeeds and no unrelated files are staged.

---

## Task 10: Add Manual npm Release Workflow

**Files:**
- Create: `.github/workflows/release.yml`
- Create/Modify: `docs/release.md`

- [ ] **Step 1: Create release workflow**

Create `.github/workflows/release.yml` with:

```yaml
name: Release Packages

on:
  workflow_dispatch:
    inputs:
      package:
        description: Package to publish
        required: true
        type: choice
        options:
          - core
          - mcp
          - both
      dry_run:
        description: Run npm publish with --dry-run
        required: true
        default: true
        type: boolean

permissions:
  contents: read

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 11.7.0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          registry-url: https://registry.npmjs.org

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Validate
        run: |
          pnpm typecheck
          pnpm test
          pnpm build
          pnpm pack:check

      - name: Publish core dry run
        if: ${{ inputs.dry_run && (inputs.package == 'core' || inputs.package == 'both') }}
        run: pnpm --filter @ztgk/geo-effect-kit publish --access public --no-git-checks --dry-run
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish MCP dry run
        if: ${{ inputs.dry_run && (inputs.package == 'mcp' || inputs.package == 'both') }}
        run: pnpm --filter @ztgk/geo-effect-kit-mcp publish --access public --no-git-checks --dry-run
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish core
        if: ${{ !inputs.dry_run && (inputs.package == 'core' || inputs.package == 'both') }}
        run: pnpm --filter @ztgk/geo-effect-kit publish --access public --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish MCP
        if: ${{ !inputs.dry_run && (inputs.package == 'mcp' || inputs.package == 'both') }}
        run: pnpm --filter @ztgk/geo-effect-kit-mcp publish --access public --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- [ ] **Step 2: Create release docs**

Create or replace `docs/release.md` with:

````markdown
# 发布流程

## 首次手工发布

首次发布建议在本地完成，便于确认 npm scope 权限。

```bash
npm whoami
pnpm typecheck
pnpm test
pnpm build
pnpm pack:check
pnpm smoke:external
pnpm --filter @ztgk/geo-effect-kit publish --access public
pnpm --filter @ztgk/geo-effect-kit-mcp publish --access public
```

如果 `npm whoami` 提示未登录，先运行：

```bash
npm adduser
```

## GitHub Actions 发布

首次手工发布成功后，可以在 GitHub 仓库 Secrets 中配置：

```text
NPM_TOKEN
```

然后运行 `Release Packages` workflow。默认先用 `dry_run=true` 验证。

## 版本号

- patch：修复 bug 或文档修正。
- minor：新增效果、新增参数或新增集成方式。
- major：`1.0.0` 后才用于破坏性 API 变更。

当前 `0.x` 阶段仍可能调整 API，但破坏性变化必须写入 `CHANGELOG.md`。
````

- [ ] **Step 3: Validate release files**

Run:

```bash
rg -n "NPM_TOKEN|dry_run|@ztgk/geo-effect-kit|@ztgk/geo-effect-kit-mcp" .github/workflows/release.yml docs/release.md
```

Expected: release workflow and docs mention both packages and npm token handling.

- [ ] **Step 4: Commit**

Run:

```bash
git add .github/workflows/release.yml docs/release.md
git commit -m "ci: add manual npm release workflow"
```

Expected: commit succeeds and no unrelated files are staged.

---

## Task 11: Final Validation and Publish Readiness Check

**Files:**
- No required file changes unless validation reveals a defect in previous tasks.

- [ ] **Step 1: Check git status**

Run:

```bash
git status --short
```

Expected: only unrelated pre-existing user changes may remain. No files from this release-prep plan should be accidentally unstaged.

- [ ] **Step 2: Run full local validation**

Run:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm pack:check
pnpm smoke:external
GITHUB_PAGES=true pnpm --filter geo-effect-kit-demo build
```

Expected: all commands pass. If `pnpm smoke:external` fails because the environment cannot access npm, record the exact error and verify `pnpm pack:check` still passes.

- [ ] **Step 3: Check npm package name availability**

Run:

```bash
npm view @ztgk/geo-effect-kit version --json
npm view @ztgk/geo-effect-kit-mcp version --json
```

Expected before first release: npm returns 404 for both packages. If either package exists, stop and decide whether to use a new package name or publish a new version under an owned scope.

- [ ] **Step 4: Check npm login**

Run:

```bash
npm whoami
```

Expected: prints the npm username. If it prints `ENEEDAUTH`, the maintainer must run `npm adduser` before publishing.

- [ ] **Step 5: Verify no release-prep files are unstaged**

Run:

```bash
git diff --name-only -- package.json packages/core/package.json mcp-server/package.json apps/demo/vite.config.ts LICENSE CONTRIBUTING.md CHANGELOG.md README.md README.zh-CN.md packages/core/README.md packages/core/LICENSE docs/getting-started.md docs/vite-cesium.md docs/react.md docs/vue.md docs/ai-agents.md docs/release.md mcp-server/README.md mcp-server/LICENSE .github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/feature_request.yml .github/PULL_REQUEST_TEMPLATE.md .github/workflows/ci.yml .github/workflows/pages.yml .github/workflows/release.yml scripts/verify-package.mjs scripts/verify-external-install.mjs
```

Expected: no output. If this command prints a release-prep file, return to the task that owns that file, fix it there, and commit it before reporting readiness.

- [ ] **Step 6: Report publish readiness**

Prepare a final status report containing:

```text
Release readiness:
- typecheck: pass/fail
- test: pass/fail
- build: pass/fail
- pack check: pass/fail
- external smoke: pass/fail/skipped with reason
- GitHub Pages build: pass/fail
- npm package names: available/taken
- npm auth: logged in/not logged in
- next manual action: publish or login/configure secrets
```

Do not run `npm publish` unless the maintainer explicitly asks for publication after reviewing this status.
