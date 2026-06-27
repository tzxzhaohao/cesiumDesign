# shield-dome 能量护盾

`shield-dome` 是贴地半球护盾，带网格、扫描线、能量脉冲和可选底部光环。它视觉冲击强，适合 GitHub 首页 demo、保护区和指挥大屏重点区域。

## 最小接入

```ts
import { createShieldDomeEffect } from '@ztgkzhaohao/geo-effect-kit'

const dome = createShieldDomeEffect(viewer, {
  center: { longitude: 116.391, latitude: 39.907 },
  radiusMeters: 12000,
  type: 'hex',
  color: '#57f7ff',
  speed: 1,
  opacity: 0.56,
  gridDensity: 14,
  pulseStrength: 0.72,
})
```

## 类型建议

- `hex`：经典科技网格护盾。
- `plasma`：等离子能量罩。
- `matrix`：数据矩阵风格。
- `aegis`：稳态防御护盾。
- `storm`：高能扰动护盾。

## 生命周期

`center` 和 `radiusMeters` 变化会重建半球几何；颜色、类型、速度、透明度、网格密度、脉冲强度和底环可直接更新。离开页面时调用 `destroy()`。
