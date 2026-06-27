# geo-effect-kit

`geo-effect-kit` 是一个面向 Cesium 的框架无关动效 SDK，同时提供 examples 演示页和可被智能体读取的知识层。

当前包含十个可复用效果：

- `radar-scan`：基于 `GeoRadarScanMaterial` 的动态圆形雷达扫描效果。
- `ripple-spread`：基于 `GeoRippleSpreadMaterial` 的动态水波扩散效果。
- `polyline-flow`：路线流光，适合指挥调度路线、迁徙线、攻击路径和数据链路。
- `fly-line`：高空飞线，适合单向航线、多源汇聚和双向通信链路。
- `pipe-flow`：透明水管流动，适合水务管网、排水调度、压力流向和管线大屏。
- `light-wall`：动态光墙，适合园区、禁区、安防边界和重点保护范围。
- `scan-cone`：锥形扫描，适合探照灯、雷达、摄像头、无人机和告警范围。
- `shield-dome`：能量护盾半球，适合 GitHub 首页 demo、保护区和大屏重点区域。
- `temperature-field`：静态 shader 温度/风险面，适合卫星遥感温度场、火情预测和行政区风险色带。
- `fire-billboard`：GIF 火点 Billboard，适合用户按经纬度和自定义 GIF 渲染火点动画。

## 安装

本地或私有项目使用时：

```bash
pnpm add @ztgk/geo-effect-kit
```

Cesium 是 peer dependency，由宿主项目自行管理 Cesium 版本。

## 最小用法

```ts
import { createRadarScanEffect } from '@ztgk/geo-effect-kit'

const radar = createRadarScanEffect(viewer, {
  center: { longitude: 116.391, latitude: 39.907 },
  radiusMeters: 22000,
  color: '#36d6ff',
  scanDurationMs: 3600,
})

radar.flyTo()
radar.destroy()
```

水波扩散效果：

```ts
import { createRippleSpreadEffect } from '@ztgk/geo-effect-kit'

const ripple = createRippleSpreadEffect(viewer, {
  center: { longitude: 116.391, latitude: 39.907 },
  radiusMeters: 28000,
  type: 'water',
  color: '#62e8ff',
  ringCount: 5,
  durationMs: 2400,
})

ripple.flyTo()
ripple.destroy()
```

路线流光：

```ts
import { createPolylineFlowEffect } from '@ztgk/geo-effect-kit'

const flow = createPolylineFlowEffect(viewer, {
  positions: [
    { longitude: 116.285, latitude: 39.87 },
    { longitude: 116.394, latitude: 39.91 },
    { longitude: 116.505, latitude: 39.9 },
  ],
  type: 'dispatch',
  color: '#33f7ff',
  speed: 1.4,
  width: 7,
  trailLength: 0.34,
  pulseCount: 4,
  cornerRadius: 0.18,
})

flow.flyTo()
flow.destroy()
```

高空飞线：

```ts
import { createFlyLineEffect } from '@ztgk/geo-effect-kit'

const flyLine = createFlyLineEffect(viewer, {
  lines: [
    {
      from: { longitude: 116.285, latitude: 39.87 },
      to: { longitude: 116.391, latitude: 39.907 },
    },
    {
      from: { longitude: 116.505, latitude: 39.9 },
      to: { longitude: 116.391, latitude: 39.907 },
    },
  ],
  mode: 'hub-spoke',
  color: '#5ee8ff',
  speed: 1.2,
  width: 5,
  arcHeight: 42000,
  trailLength: 0.28,
  pulseCount: 3,
})

flyLine.flyTo()
flyLine.destroy()
```

透明水管流动：

```ts
import { createPipeFlowEffect } from '@ztgk/geo-effect-kit'

const pipe = createPipeFlowEffect(viewer, {
  positions: [
    { longitude: 116.285, latitude: 39.87 },
    { longitude: 116.335, latitude: 39.92 },
    { longitude: 116.394, latitude: 39.91 },
    { longitude: 116.452, latitude: 39.95 },
    { longitude: 116.505, latitude: 39.9 },
  ],
  color: '#45dfff',
  speed: 1.35,
  width: 14,
  pipeOpacity: 0.34,
  waterOpacity: 0.88,
  cornerRadius: 0.22,
  bubbleDensity: 8,
})

pipe.flyTo()
pipe.destroy()
```

静态温度/风险面：

```ts
import { createTemperatureFieldEffect } from '@ztgk/geo-effect-kit'

const field = createTemperatureFieldEffect(viewer, {
  polygons: riskSurface.polygons,
  seed: riskSurface.riskField.seed,
  opacity: riskSurface.riskField.opacity,
  stops: riskSurface.riskField.stops,
  contourLines: true,
})

field.flyTo()
field.destroy()
```

GIF 火点 Billboard：

```ts
import { createFireBillboardEffect } from '@ztgk/geo-effect-kit'

const fireBillboard = createFireBillboardEffect(viewer, {
  points: [
    { longitude: 116.322, latitude: 39.968, gif: '/fire-red-billboard.gif' },
    { longitude: 116.372, latitude: 39.932, gif: '/fire-orange-billboard.gif' },
    { longitude: 116.431, latitude: 39.974, gif: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Torche.gif' },
    { longitude: 116.486, latitude: 39.908, gif: '/fire-green-billboard.gif' },
  ],
  scale: 1,
  frameIntervalMs: 72,
})

fireBillboard.flyTo()
fireBillboard.destroy()
```

## Examples

`apps/demo` 是类似 Three.js examples 的实时演示页：左侧选择效果，地图画布实时预览，面板中调整参数并查看对应集成代码。

```bash
pnpm --filter geo-effect-kit-demo dev
```

## Agent Knowledge

`knowledge/effects/*.effect.json` 和 `knowledge/docs/*.md` 描述每个效果的参数、用例、示例代码和迁移说明。`mcp-server` 会读取这些文件，让其他智能体可以直接查询可用动效和集成方式。

## 工作区结构

- `packages/core`：TypeScript SDK 核心包。
- `apps/demo`：Vite + Cesium 演示项目。
- `knowledge`：效果清单与 Markdown 文档。
- `mcp-server`：兼容 MCP 的知识查询辅助服务。

## 常用命令

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm --filter geo-effect-kit-demo dev
```

## Codex 文档生成约定

由 Codex 生成或维护的 Markdown 文档优先使用中文；除非外部协议、第三方引用或用户明确要求英文，否则 `.md` 正文不要默认写成英文。
