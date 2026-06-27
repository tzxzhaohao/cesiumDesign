# 雷达扫描效果

`radar-scan` 会在 Cesium 地球上渲染一个动态圆形雷达扫描效果。它被设计为框架无关的 TypeScript SDK 效果：传入已有的 `Viewer`，配置扫描参数，并在页面或图层卸载时销毁即可。

## 最小用法

```ts
import { createRadarScanEffect } from '@ztgkzhaohao/geo-effect-kit'

const radar = createRadarScanEffect(viewer, {
  center: { longitude: 116.391, latitude: 39.907 },
  radiusMeters: 22000,
  type: 'classic',
  color: '#36d6ff',
  scanDurationMs: 3600,
})

radar.flyTo()
```

## 参数说明

- `center`：扫描中心点，使用 WGS84 经纬度。
- `radiusMeters`：扫描半径，单位为米。
- `type`：雷达视觉类型，可选 `classic`、`sector`、`pulse`、`grid`，默认值为 `classic`。
- `color`：扫描材质使用的 CSS 颜色，默认值为 `#36d6ff`。
- `scanDurationMs`：完整扫描一圈的时长，单位为毫秒，默认值为 `3600`。
- `opacity`：材质透明度倍率，取值范围为 `0` 到 `1`，默认值为 `0.85`。
- `rings`：是否显示同心圆环，默认值为 `true`。
- `showCenter`：是否显示中心点实体，默认值为 `false`。

## 雷达类型

- `classic`：原始雷达扫描，包含旋转扫线、拖尾和同心参考圈。
- `sector`：更宽的扇形扫描面，适合表现探测覆盖范围。
- `pulse`：高亮扫描头和强拖尾，视觉冲击更强，适合告警或重点目标扫描。
- `grid`：在扫描过程中叠加网格定位感，适合态势分析、搜索定位类场景。

```ts
radar.update({
  type: 'pulse',
  color: '#ff4fe2',
  scanDurationMs: 1800,
})
```

## FireHotspot 迁移说明

FireHotspot 目前在 `FirePredictionSurfaceLayer` 中维护了路由内专用的雷达 shader，并使用 `FirePredictionRadarScanMaterial`。迁移时可以把这部分路由内的雷达 primitive 逻辑替换为 `createRadarScanEffect(viewer, options)`，同时保持风险面图层独立。

迁移形态如下：

```ts
const radar = createRadarScanEffect(viewer, {
  center: { longitude: scan.longitude, latitude: scan.latitude },
  radiusMeters: scan.radiusMeters,
  type: 'sector',
  color: '#36d6ff',
  scanDurationMs: 3600,
})

radar.update({ radiusMeters: nextScan.radiusMeters })
radar.destroy()
```

`destroy()` 应放在当前移除 Cesium primitive、停止渲染循环的同一个清理路径中。

## 常见问题

**这个效果会创建 Cesium Viewer 吗？**

不会。它只会把效果资源挂载到传入的 `viewer` 上。

**React 或 Vue 可以使用吗？**

可以。核心 SDK 不依赖任何前端框架。React/Vue 页面应在生命周期钩子中创建效果，并在清理阶段调用 `destroy()`。

**坐标系使用什么？**

使用 WGS84 经纬度。SDK 内部会通过 `Cartesian3.fromDegrees` 转为 Cesium 笛卡尔坐标。
