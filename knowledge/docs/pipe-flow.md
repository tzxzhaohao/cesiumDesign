# pipe-flow 水管流动

`pipe-flow` 是独立的透明水管流动效果，适合把路线从“流光线”升级成更像真实管道的表达。它由半透明管壁、内部水流、压力波和泡沫粒子组成，并支持圆角弯头。

## 最小接入

```ts
import { createPipeFlowEffect } from '@ztgk/geo-effect-kit'

const pipe = createPipeFlowEffect(viewer, {
  positions: [
    { longitude: 116.285, latitude: 39.87 },
    { longitude: 116.335, latitude: 39.92 },
    { longitude: 116.394, latitude: 39.91 },
    { longitude: 116.452, latitude: 39.95 },
    { longitude: 116.505, latitude: 39.9 },
  ],
  color: '#45dfff',
  speed: 1.35,
  width: 14,
  pipeOpacity: 0.34,
  waterOpacity: 0.88,
  cornerRadius: 0.22,
  bubbleDensity: 8,
})
```

## 参数建议

- `width`：控制内部水流宽度；外层管壁会按比例更宽。
- `pipeOpacity`：控制透明管壁强度，低一些更像玻璃管，高一些更像发光管道。
- `waterOpacity`：控制内部水流和压力波强度。
- `cornerRadius`：控制弯头圆滑程度，建议管网展示用 `0.18` 到 `0.28`。
- `bubbleDensity`：控制泡沫粒子数量，`0` 可关闭泡沫，`8` 到 `12` 更有水流感。

## 生命周期

`positions`、`clampToGround`、`cornerRadius` 或 `bubbleDensity` 变化会重建路线实体；颜色、速度、宽度、管壁透明度和水流透明度可直接 `update()`。页面卸载或图层替换时调用 `destroy()`。
