# GIF 火点 Billboard

`fire-billboard` 用 Cesium entity billboard 渲染火点图标。调用方只需要传入点位数组，每个点位包含 WGS84 `longitude`、`latitude` 和自己的 `gif`，SDK 会先把 GIF 作为 billboard 图片显示出来；浏览器支持 `fetch`、`document` 和 canvas 时，会用 `gifuct-js` 把 GIF 拆成帧图片，再按 `frameIntervalMs` 切换 billboard 图片形成动画。

SDK 不内置默认火点图，也不会替调用方选择颜色或等级。不同火点可以传不同 GIF，包括业务静态资源、接口返回 URL、data URL，或允许跨域读取的网上 GIF。Billboard 默认保持 GIF 原始尺寸，只通过 `scale` 做整体缩放。

## 最小用法

```ts
import { createFireBillboardEffect } from '@ztgk/geo-effect-kit'

const fireBillboard = createFireBillboardEffect(viewer, {
  points: [
    { longitude: 116.322, latitude: 39.968, gif: '/fire-red-billboard.gif' },
    { longitude: 116.372, latitude: 39.932, gif: '/fire-orange-billboard.gif' },
    { longitude: 116.431, latitude: 39.974, gif: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Torche.gif' },
    { longitude: 116.486, latitude: 39.908, gif: '/fire-green-billboard.gif' },
  ],
  scale: 1,
  frameIntervalMs: 72,
})

fireBillboard.flyTo()
```

## 参数说明

- `points`：火点数组，必填。每个点位至少包含 `longitude`、`latitude` 和 `gif`。
- `points[].gif`：GIF URL 或 data URL。不同点位可以传不同 GIF。
- `points[].height`：点位高度，默认值为 `0`。
- `points[].id`：可选实体 ID，便于业务侧追踪。
- `points[].label`：可选标签文本。
- `scale`：billboard 缩放倍数，默认值为 `1`。SDK 不覆盖 GIF 的原始 `width/height`，需要放大或缩小时使用该参数。
- `frameIntervalMs`：GIF 拆帧后的帧切换间隔，默认值为 `80` 毫秒。
- `clampToGround`：是否贴地，默认值为 `true`。
- `disableDepthTestDistance`：Cesium billboard 的深度测试关闭距离，默认值为 `Infinity`。

## 更新点位

当火点列表刷新时，直接传入新的经纬度和 GIF：

```ts
fireBillboard.update({
  points: latestHotspots.map((item) => ({
    id: item.id,
    longitude: item.longitude,
    latitude: item.latitude,
    gif: item.alarmLevel === 'high' ? highFireGif : normalFireGif,
    label: item.satellite,
  })),
})
```

## FireHotspot 迁移说明

FireHotspot 的火点图层如果已有火点业务数据，可以把每条记录映射成 `{ longitude, latitude, gif }` 后传给 `createFireBillboardEffect`。GIF 可以来自前端静态资源、接口返回的 URL，或业务根据等级选择的 data URL。

```ts
const fireLayer = createFireBillboardEffect(viewer, {
  points: fireRecords.map((record) => ({
    id: record.id,
    longitude: record.longitude,
    latitude: record.latitude,
    gif: getFireGifByLevel(record.level),
    label: record.satellite,
  })),
  scale: 1.2,
})
```

页面卸载、图层关闭或重新创建 viewer 前调用：

```ts
fireLayer.destroy()
```

## 实现边界

- 输入坐标保持 WGS84/EPSG:4326，内部使用 `Cartesian3.fromDegrees`。
- GIF 拆帧在浏览器能力可用时异步执行；拆帧失败时保留原始 GIF URL，不让火点消失。
- 每个点位独立拆帧；某个远程 GIF 加载慢或失败时，不会阻塞其他已就绪 GIF 播放动画。
- 远程 GIF 请求有 5 秒超时兜底，超时后先保留原 GIF URL，后续重新创建或更新时可再次尝试。
- 同一个 GIF URL 的拆帧结果会缓存，多个火点复用同一 GIF 时不会重复解析。
- `update()` 如果只改 `scale` 或帧间隔，会复用已有 entity；点位或 GIF 列表变化时会重建 billboard entity。
