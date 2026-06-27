# polyline-flow 路线流光

`polyline-flow` 用于指挥调度路线、迁徙线、攻击路径和数据流向。效果由一条 Cesium `PolylineGlowMaterialProperty` 基础发光线，加多条动态尾迹 polyline 组成。

## 最小接入

```ts
import { createPolylineFlowEffect } from '@ztgkzhaohao/geo-effect-kit'

const flow = createPolylineFlowEffect(viewer, {
  positions: [
    { longitude: 116.285, latitude: 39.87 },
    { longitude: 116.394, latitude: 39.91 },
    { longitude: 116.505, latitude: 39.9 },
  ],
  type: 'dispatch',
  color: '#33f7ff',
  speed: 1.4,
  width: 7,
  trailLength: 0.34,
  pulseCount: 4,
  cornerRadius: 0.18,
})
```

## 类型建议

- `dispatch`：指挥调度、车辆路径、任务线路。
- `migration`：迁徙线、客流/物流流向。
- `attack`：攻击路径、告警推演、强方向性流光。
- `comet`：亮头长尾，适合首页展示。
- `electric`：高能电流感，适合数据链路。

## 生命周期

`positions`、`clampToGround` 或 `cornerRadius` 变化会重建路线实体；颜色、速度、宽度、尾迹长度和脉冲数量可直接 `update()`。页面卸载或图层替换时调用 `destroy()`。
