# 快速开始

`@ztgkzhaohao/geo-effect-kit` 是一个面向 Cesium 的动效 SDK。它不创建 `Viewer`，只接收宿主项目已经创建好的 Cesium `Viewer`。

## 安装

```bash
pnpm add @ztgkzhaohao/geo-effect-kit cesium
```

## 基础示例

```ts
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { Viewer } from 'cesium'
import { createRippleSpreadEffect } from '@ztgkzhaohao/geo-effect-kit'

const viewer = new Viewer('cesiumContainer')

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

## 生命周期

每个效果实例都应该由业务页面或图层保存引用：

```ts
const effect = createRippleSpreadEffect(viewer, options)

effect.update({ color: '#ff5d5d' })
effect.hide()
effect.show()
effect.flyTo()
effect.destroy()
```

页面卸载、图层关闭或 `Viewer` 销毁前必须调用 `destroy()`，避免 Cesium entity、primitive 或 post-process stage 残留。

## 坐标

SDK 参数默认使用 WGS84 经纬度：

```ts
{ longitude: 116.391, latitude: 39.907, height: 0 }
```

高度单位是米。
