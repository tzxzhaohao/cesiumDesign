# @ztgkzhaohao/geo-effect-kit

Framework-neutral Cesium effects SDK.

## Effects

- `createRadarScanEffect`
- `createRippleSpreadEffect`
- `createPolylineFlowEffect`
- `createMaterialPolylineEffect` for Mars3D-style material polylines, including custom image textures.
- `createFlyLineEffect`
- `createPipeFlowEffect`
- `createWaterSurfaceEffect`
- `createLightWallEffect`
- `createScanConeEffect` with optional smooth radius-and-length expansion, live frame callbacks, and opt-in camera follow.
- `createShieldDomeEffect`
- `createTemperatureFieldEffect`
- `createFireBillboardEffect`
- `createSceneWeatherEffect`
- `createPostProcessEffect`

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

## Scan cone expansion

Omit `expansion` to keep the existing static Entity behavior. When enabled, the effect grows radius and length together with one Primitive and reports each sampled frame:

```ts
import { createScanConeEffect } from '@ztgkzhaohao/geo-effect-kit'

const cone = createScanConeEffect(viewer, {
  center: { longitude: 116.391, latitude: 39.907 },
  lengthMeters: 6200,
  expansion: {
    maxRadiusMeters: 2200,
    durationMs: 4500,
    cameraFollow: false,
    onFrame: (frame) => console.log(frame.progress, frame.radiusMeters),
  },
})

cone.destroy()
```

## Documentation

- Repository: https://github.com/tzxzhaohao/cesiumDesign
- Demo: https://tzxzhaohao.github.io/cesiumDesign/
- AI/MCP package: `@ztgkzhaohao/geo-effect-kit-mcp`

## License

MIT
