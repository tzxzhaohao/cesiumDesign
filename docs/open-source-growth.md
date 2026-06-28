# 开源推广手册

这个文档用于每次发布或宣传 `geo-effect-kit` 时快速复用。目标不是泛泛刷屏，而是让真正做 Cesium、WebGIS、三维地图、数字孪生和 AI 辅助地理可视化的人能快速看到项目价值。

## 项目一句话

中文：

> `geo-effect-kit` 是一个面向 Cesium 的 TypeScript 动效 SDK，内置雷达扫描、飞线、水面、光墙、温度场、火点、天气和后处理等常见 WebGIS 可视化效果，并提供 AI/MCP 友好的结构化效果知识库。

English:

> `geo-effect-kit` is a framework-neutral TypeScript effects SDK for Cesium, with reusable WebGIS visual effects and AI/MCP-friendly effect manifests.

## 核心卖点

- 直接接入已有 Cesium `Viewer`，不接管宿主项目地图初始化。
- React、Vue、Vite 和原生 TypeScript 项目都可以用。
- 常见 WebGIS 大屏效果开箱即用：雷达扫描、飞线、路径流光、水面、光墙、锥形扫描、护盾、温度场、火点、天气和后处理。
- 每个效果都有统一生命周期：`update`、`show`、`hide`、`flyTo`、`destroy`。
- 提供 `knowledge/effects` 和 `knowledge/docs`，方便 AI Agent 读取效果 schema 与示例。
- 可选 MCP server：`@ztgkzhaohao/geo-effect-kit-mcp`。

## 发布前检查

1. GitHub 仓库 description、homepage、topics 已填写。
2. README 顶部包含 Demo、npm、安装命令、最小示例和贡献入口。
3. 在线 Demo 可访问，并能展示至少 3 个高辨识度效果。
4. npm 包页面能看到准确 description、keywords、homepage、repository。
5. `CHANGELOG.md` 有当前版本说明。
6. GitHub Release 有清晰标题、效果清单和 Demo 链接。
7. 新版本发布前运行：

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm pack:check
pnpm smoke:external
```

## 渠道顺序

第一优先级：

- GitHub repository topics
- npm package metadata
- GitHub Release
- 掘金 WebGIS / 前端方向文章
- 知乎 GIS / Cesium / 前端专栏

第二优先级：

- Cesium Community
- DEV Community
- X / Twitter
- LinkedIn
- V2EX / SegmentFault

第三优先级：

- Product Hunt
- Hacker News `Show HN`
- Reddit `r/gis`、`r/webdev`

## 中文发布文案

短版：

> 我开源了一个 Cesium 动效 SDK：`geo-effect-kit`。它把 WebGIS 大屏里常见的雷达扫描、飞线、水面、光墙、温度场、火点、天气和后处理效果封装成 TypeScript API，可以接入已有 Cesium Viewer，也提供 AI/MCP 可读的效果 schema。Demo: https://tzxzhaohao.github.io/cesiumDesign/

文章标题候选：

- 我把常用 Cesium 动效封装成了一个 TypeScript SDK
- 做 WebGIS 大屏时，如何复用雷达扫描、飞线、水面和光墙效果
- 给 Cesium 项目准备一个 AI 也能读懂的效果库

文章结构：

1. 痛点：WebGIS 项目反复写同类动效。
2. 方案：统一 TypeScript API + 生命周期。
3. 效果展示：放在线 Demo 和截图/GIF。
4. 快速接入：安装命令和 20 行最小示例。
5. AI/MCP：说明 `knowledge/effects` 和 MCP server。
6. 邀请：欢迎 issue、star、PR 和效果建议。

## English Post Draft

Short version:

> I open-sourced `geo-effect-kit`, a framework-neutral TypeScript effects SDK for Cesium. It includes reusable WebGIS effects such as radar scans, fly lines, route flows, water surfaces, light walls, temperature fields, fire billboards, weather, and post-processing. It also ships AI/MCP-friendly effect manifests so coding agents can discover schemas and generate integration snippets. Demo: https://tzxzhaohao.github.io/cesiumDesign/

Title ideas:

- A TypeScript effects SDK for Cesium WebGIS dashboards
- Reusable Cesium visual effects for maps, dashboards, and AI coding agents
- Making Cesium map effects discoverable for AI agents with MCP

## GitHub Release 模板

```markdown
## geo-effect-kit vX.Y.Z

This release provides reusable Cesium effects for WebGIS dashboards, digital twins, emergency command systems, and AI-assisted geospatial applications.

### Highlights

- Radar scan, ripple spread, polyline flow, fly line, pipe flow, water surface, light wall, scan cone, shield dome, temperature field, fire billboard, scene weather, and post-process effects.
- Framework-neutral TypeScript API that works with an existing Cesium `Viewer`.
- Effect-level manifests and docs for AI agents.
- Optional MCP server: `@ztgkzhaohao/geo-effect-kit-mcp`.

### Links

- Demo: https://tzxzhaohao.github.io/cesiumDesign/
- npm: https://www.npmjs.com/package/@ztgkzhaohao/geo-effect-kit
- Docs: https://github.com/tzxzhaohao/cesiumDesign#readme
```

## 后续可以补强的资产

- README 顶部效果截图或 GIF。
- 一篇中文长文。
- 一篇英文短文。
- `good first issue` 标签和 3-5 个低门槛 issue。
- React / Vue 最小可运行在线示例。
