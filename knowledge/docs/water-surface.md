# water-surface 水面材质

`water-surface` 用 Cesium polygon entity 和 `GeoWaterSurfaceMaterial` shader 渲染动态水面。材质参考 Three.js 官方 `Water`/`Water2` 示例的视觉思路，使用程序化法线扰动、Fresnel 反射、折射色彩混合和流向动画，适合河流、湖泊、洪水淹没面、水位变化和水务大屏。`flow` 类型参考 yunzhou-onemap 中 `WaterPrimitive` 的水流参数，适合更强调河道流向的场景。

## 最小接入

```ts
import { createWaterSurfaceEffect } from '@ztgkzhaohao/geo-effect-kit'

const water = createWaterSurfaceEffect(viewer, {
  polygon: [
    { longitude: 116.332, latitude: 39.886 },
    { longitude: 116.454, latitude: 39.884 },
    { longitude: 116.491, latitude: 39.925 },
    { longitude: 116.346, latitude: 39.966 },
  ],
  type: 'flow',
  color: '#00777f',
  waveStrength: 0.32,
  reflectionStrength: 0.3,
  distortionScale: 3.7,
  reflectivity: 0.3,
  refractionStrength: 0.34,
  fresnelPower: 3.2,
  flowDirection: 186,
})

water.flyTo()
```

## 类型建议

- `river`：方向性流动明显，适合河道和排水通道。
- `lake`：波纹更柔和，适合湖面、水库和静态水域。
- `flood`：带扩散脉冲，适合洪水演进和淹没范围。
- `flow`：更接近 yunzhou-onemap `WaterPrimitive` 的强方向水流，适合真实河道 polygon 和水务项目演示。

## 参数说明

`polygon` 使用 WGS84 经纬度点。`height` 控制水面高度，单位米。`waveStrength` 控制程序化法线波纹强度，`reflectionStrength` 控制高光闪烁，`distortionScale` 控制类似 Three.js `distortionScale` 的水面扰动尺度，`reflectivity` 控制 Fresnel 反射强度，`refractionStrength` 控制折射底色混合，`fresnelPower` 控制斜视角反射曲线，`flowDirection` 控制流向角度。

## 生命周期

实例支持 `update`、`show`、`hide`、`flyTo`、`destroy`、`isVisible`、`isDestroyed`、`getOptions`。`polygon`、`height` 或 `outline` 变化会重建实体；颜色、速度、透明度、波纹强度、反射/折射参数、Fresnel 参数和流向会直接更新材质。
