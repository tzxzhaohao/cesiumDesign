# light-wall 动态光墙

`light-wall` 会沿区域边界拉起透明墙，带流动纹理、扫描线和呼吸高光，适合园区、禁区、安防边界和重点保护范围。

## 最小接入

```ts
import { createLightWallEffect } from '@ztgkzhaohao/geo-effect-kit'

const wall = createLightWallEffect(viewer, {
  positions: [
    { longitude: 116.337, latitude: 39.879 },
    { longitude: 116.448, latitude: 39.882 },
    { longitude: 116.468, latitude: 39.962 },
  ],
  type: 'security',
  color: '#27f5ff',
  height: 3600,
  speed: 1.1,
  opacity: 0.72,
})
```

## 类型建议

- `security`：安防边界，青蓝扫描线。
- `warning`：告警围栏，偏橙高亮。
- `data`：数据边界，竖向数据流。
- `fence`：禁区围挡，网格更明显。
- `pulse`：脉冲光墙，适合强提示。

## 生命周期

`positions` 和 `height` 变化会重建墙体几何；材质类型、颜色、透明度、扫描线数量、呼吸高光和顶部轮廓可直接更新。离开页面时调用 `destroy()`。
