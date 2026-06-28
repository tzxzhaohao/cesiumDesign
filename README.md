# geo-effect-kit

Framework-neutral Cesium effects for WebGIS dashboards, emergency command systems, digital twins, 3D maps, and AI-assisted geospatial applications.

[中文文档](./README.zh-CN.md)

![npm](https://img.shields.io/npm/v/%40ztgkzhaohao%2Fgeo-effect-kit?label=npm)
![license](https://img.shields.io/github/license/tzxzhaohao/cesiumDesign)
![CI](https://github.com/tzxzhaohao/cesiumDesign/actions/workflows/ci.yml/badge.svg)

## Try It

- Live demo: [tzxzhaohao.github.io/cesiumDesign](https://tzxzhaohao.github.io/cesiumDesign/)
- npm package: [`@ztgkzhaohao/geo-effect-kit`](https://www.npmjs.com/package/@ztgkzhaohao/geo-effect-kit)
- AI/MCP package: [`@ztgkzhaohao/geo-effect-kit-mcp`](https://www.npmjs.com/package/@ztgkzhaohao/geo-effect-kit-mcp)

![geo-effect-kit fly-line demo](./docs/assets/geo-effect-kit-fly-line-demo.jpg)

## Features

- Works with an existing Cesium `Viewer`.
- Framework-neutral TypeScript API.
- Reusable effects for radar scans, ripple spread, fly lines, pipe flow, water surfaces, light walls, scan cones, shield domes, temperature fields, GIF fire billboards, scene weather, post-processing, and route flow.
- Common lifecycle API: `update`, `show`, `hide`, `flyTo`, `destroy`.
- Machine-readable manifests for AI agents.
- Optional MCP server for effect discovery and integration examples.
- Works in React, Vue, Vite, and plain TypeScript Cesium projects.

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

## Why This Project

Cesium projects often rebuild the same visual layers for command dashboards, route dispatch, fire or flood monitoring, digital twins, and map demos. `geo-effect-kit` turns those recurring effects into small, typed primitives that plug into your existing viewer without taking over your map stack.

The repository also includes structured effect manifests and an optional MCP server, so AI coding agents can discover effect options and generate integration snippets without scraping the demo.

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

Public demo: [https://tzxzhaohao.github.io/cesiumDesign/](https://tzxzhaohao.github.io/cesiumDesign/)

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

## Contributing

Issues and pull requests are welcome. Good first contributions include adding a new effect example, improving a framework integration guide, polishing demo controls, or expanding an effect manifest in `knowledge/effects`.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development workflow and public API expectations.

## License

MIT
