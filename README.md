# geo-effect-kit

Framework-neutral Cesium effects for WebGIS dashboards, emergency command systems, 3D maps, and AI-assisted geospatial applications.

[中文文档](./README.zh-CN.md)

## Features

- Works with an existing Cesium `Viewer`.
- Framework-neutral TypeScript API.
- Reusable effects for radar scans, ripple spread, route flow, material polylines, fly lines, pipe flow, water surfaces, light walls, scan cones, shield domes, temperature fields, GIF fire billboards, scene weather, and post-processing.
- Common lifecycle API: `update`, `show`, `hide`, `flyTo`, `destroy`.
- Machine-readable manifests for AI agents.
- Optional MCP server for effect discovery and integration examples.

## Install

```bash
pnpm add @ztgkzhaohao/geo-effect-kit cesium
```

Cesium is a peer dependency. The host project owns Cesium versioning, static assets, `CESIUM_BASE_URL`, and Viewer initialization.

## Minimal Usage

```ts
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { Viewer } from 'cesium'
import { createRadarScanEffect } from '@ztgkzhaohao/geo-effect-kit'

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
| Material polyline | `createMaterialPolylineEffect` | Mars3D-style solid, outline, arrow, dash, texture, cross, and navigation lines with custom image materials |
| Fly line | `createFlyLineEffect` | High-altitude arcs, hub-spoke links, bidirectional routes |
| Pipe flow | `createPipeFlowEffect` | Water pipes and pressure flow |
| Water surface | `createWaterSurfaceEffect` | Rivers, lakes, flood surfaces, and directional Flow Type water |
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
- Use `@ztgkzhaohao/geo-effect-kit-mcp` when the agent supports MCP tools.

Start the MCP server:

```bash
npx @ztgkzhaohao/geo-effect-kit-mcp
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
