# @ztgkzhaohao/geo-effect-kit

Framework-neutral Cesium effects SDK for WebGIS dashboards, emergency command systems, digital twins, 3D maps, and AI-assisted geospatial applications.

- Demo: https://tzxzhaohao.github.io/cesiumDesign/
- Repository: https://github.com/tzxzhaohao/cesiumDesign
- Documentation: https://github.com/tzxzhaohao/cesiumDesign#readme

## Install

```bash
pnpm add @ztgkzhaohao/geo-effect-kit cesium
```

Cesium is a peer dependency. The host project owns Cesium static assets, `CESIUM_BASE_URL`, widgets CSS, and Viewer initialization.

## Minimal usage

```ts
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { Viewer } from 'cesium'
import { createRadarScanEffect } from '@ztgkzhaohao/geo-effect-kit'

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

- Demo: https://tzxzhaohao.github.io/cesiumDesign/
- AI/MCP package: `@ztgkzhaohao/geo-effect-kit-mcp`

## License

MIT
