# 水波扩散效果

`ripple-spread` 会在 Cesium 地球上渲染从中心点向外连续扩散的动态波纹。它是独立于 `radar-scan` 的效果，适合事件冲击范围、信号扩散、水面涟漪、告警点强调等场景。

## 最小用法

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
```

## 参数说明

- `center`：扩散中心点，使用 WGS84 经纬度。
- `radiusMeters`：最大扩散半径，单位为米。
- `type`：视觉类型，可选 `water`、`energy`、`soft`，默认值为 `water`。
- `color`：波纹材质使用的 CSS 颜色，默认值为 `#62e8ff`。
- `ringCount`：同时可见的扩散波纹圈数，范围为 `1` 到 `12`，默认值为 `4`。
- `durationMs`：单个波纹从中心扩散到边缘的时长，单位为毫秒，默认值为 `3200`。数值越小扩散越快。
- `opacity`：材质透明度倍率，取值范围为 `0` 到 `1`，默认值为 `0.82`。
- `showCenter`：是否显示中心点实体，默认值为 `false`。

## 波纹类型

- `water`：清晰水波，边缘柔和，多圈半透明涟漪连续向外扩散。
- `energy`：科技能量波，环线更锐利，中心和环边发光更强。
- `soft`：更宽、更轻的扩散晕染，适合低干扰态势底图。

```ts
ripple.update({
  type: 'energy',
  color: '#ff4fe2',
  ringCount: 8,
  durationMs: 1200,
  showCenter: true,
})
```

## 生命周期

`createRippleSpreadEffect` 返回的实例与 `radar-scan` 保持一致，支持 `update`、`show`、`hide`、`flyTo`、`destroy`、`isVisible`、`isDestroyed`、`getOptions`。

页面卸载、路由切换或图层关闭时必须调用 `destroy()`，这样会移除 Cesium primitive、中心点实体和内部渲染循环。
