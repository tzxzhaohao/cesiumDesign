# fly-line 飞线动画

`fly-line` 用于在 Cesium 地球上渲染高空弧线飞行动画。它和 `polyline-flow` 的区别是：`polyline-flow` 更适合贴地路线流光，`fly-line` 更适合跨区域链路、数据汇聚、通信同步、航线和大屏飞线。

## 最小用法

```ts
import { createFlyLineEffect } from '@ztgkzhaohao/geo-effect-kit'

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

## 三种模式

- `single-arc`：每条 `from -> to` 渲染一条单向高空弧线，适合航线和一次性调度。
- `hub-spoke`：仍使用传入的多条路线，但颜色和采样节奏偏向多源汇聚，适合中心大屏。
- `bidirectional`：每条路线自动镜像为正反两条飞线，适合通信、同步和往返巡检。

## 参数说明

`arcHeight` 是每条弧线的近似可见峰值高度，单位米。`trailLength` 是移动尾迹占整条弧线的比例。`pulseCount` 控制每条飞线上的移动光点数量。`showEndpoints` 控制是否显示端点标记。

## 生命周期

`createFlyLineEffect` 返回的实例支持 `update`、`show`、`hide`、`flyTo`、`destroy`、`isVisible`、`isDestroyed`、`getOptions`。页面卸载、路由切换或图层关闭时必须调用 `destroy()`，这样会移除 Cesium data source 和内部渲染循环。

## 集成建议

如果业务数据已经是点到点链路，直接映射为：

```ts
const lines = links.map((link) => ({
  from: { longitude: link.sourceLng, latitude: link.sourceLat },
  to: { longitude: link.targetLng, latitude: link.targetLat },
}))
```

如果业务是多个点汇聚到中心点，可以把中心点作为每条路线的 `to`，并设置 `mode: 'hub-spoke'`。如果要表达双向通信，只传一组方向并设置 `mode: 'bidirectional'` 即可。
