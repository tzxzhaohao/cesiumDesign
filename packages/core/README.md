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
