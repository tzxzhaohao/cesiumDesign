# 温度场效果

`temperature-field` 用 Cesium shader 渲染一个静态温度/风险面。它适合卫星遥感、火情预测、干旱风险、热异常分析等场景：传入 WGS84 行政区 polygon、温度控制点、色带、透明度和稳定 seed，SDK 会在区域内生成连续的温度色带、轻微纹理扰动和等值线。

这个效果不使用 `czm_frameNumber`，也不启动 `requestAnimationFrame` 渲染循环，适合 FireHotspot 火情预测页面中不需要动效的风险面。

## 最小用法

```ts
import { createTemperatureFieldEffect } from '@ztgkzhaohao/geo-effect-kit'

const field = createTemperatureFieldEffect(viewer, {
  polygons: [
    {
      outer: [
        [116.11, 39.76],
        [116.62, 39.88],
        [116.56, 40.06],
        [116.18, 40.02],
      ],
      holes: [],
    },
  ],
  seed: 9528,
  samples: [
    { longitude: 116.32, latitude: 39.96, value: 88, type: 'critical' },
    { longitude: 116.48, latitude: 39.9, value: 68, type: 'hot' },
    { longitude: 116.26, latitude: 39.82, value: 15, type: 'low' },
  ],
  opacity: 0.76,
})

field.flyTo()
```

## 参数说明

- `polygons`：WGS84 polygon 列表，格式为 `{ outer: [lng, lat][], holes?: [lng, lat][][] }`。
- `stops`：温度/风险色带，默认包含蓝、绿、黄、橙、红五段。
- `samples`：温度控制点数组，格式为 `{ longitude, latitude, value, type? }[]`。提供后 shader 会以这些点插值控制局部颜色。
- `seed`：静态随机种子，用于控制 shader 中热点、冷点和纹理相位。相同 seed 会得到稳定图案。
- `opacity`：整体透明度，默认值为 `0.76`。
- `noiseStrength`：静态纹理扰动强度，默认值为 `0.42`。
- `contourLines`：是否显示等值线，默认值为 `true`。
- `contourStrength`：等值线强度，默认值为 `0.18`。
- `outline`：是否渲染行政区边界发光线，默认值为 `true`。
- `outlineColor`：边界线颜色，默认值为 `#dff8ff`。
- `outlineWidth`：边界线宽度，默认值为 `5`。

## FireHotspot 迁移说明

FireHotspot 火情预测页当前在 `FirePredictionSurfaceLayer` 中使用 `ImageMaterialProperty` 和 `buildRiskFieldCanvas(surface.riskField)` 生成风险面贴图。迁移到 SDK 后，可以用 `createTemperatureFieldEffect` 替换这块 canvas 贴图逻辑，并保留现有业务数据结构：

```ts
const field = createTemperatureFieldEffect(viewer, {
  polygons: riskSurface.polygons,
  samples: riskSurface.riskField.samples,
  seed: riskSurface.riskField.seed,
  opacity: riskSurface.riskField.opacity,
  stops: riskSurface.riskField.stops,
  contourLines: true,
  contourStrength: 0.18,
  outline: true,
})
```

当用户切换区域或重新预测时，直接更新同一个实例：

```ts
field.update({
  polygons: nextRiskSurface.polygons,
  samples: nextRiskSurface.riskField.samples,
  seed: nextRiskSurface.riskField.seed,
  opacity: nextRiskSurface.riskField.opacity,
  stops: nextRiskSurface.riskField.stops,
})
```

页面卸载、切换路线或清空预测面时调用：

```ts
field.destroy()
```

## 实现边界

- 输入坐标保持 WGS84/EPSG:4326，适合 Cesium `Cartesian3.fromDegrees`。
- 行政区洞面会通过 `PolygonHierarchy` 传给 `PolygonGeometry`。
- shader 基于 `materialInput.st` 和 `samples` 控制点计算色带，不依赖外部图片或 canvas。
- 当前最多把前 16 个温度控制点送入 shader uniform，适合火情预测页的抽样控制点或聚合热点。
