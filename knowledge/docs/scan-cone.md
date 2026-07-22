# scan-cone 锥形扫描

`scan-cone` 是一个持续旋转的立体扫描锥，可用于探照灯、雷达、摄像头覆盖、无人机探测范围和告警范围。它既保留原有静态锥体，也支持半径与长度同步、平滑地扩散到目标尺寸。

## 静态最小接入

不传 `expansion` 时行为与既有版本一致：使用 Cesium `Entity` 渲染固定尺寸锥体，旋转材质持续运行。

```ts
import { createScanConeEffect } from '@ztgkzhaohao/geo-effect-kit'

const cone = createScanConeEffect(viewer, {
  center: { longitude: 116.391, latitude: 39.907 },
  type: 'searchlight',
  color: '#7cf7ff',
  radiusMeters: 2200,
  lengthMeters: 6200,
  speed: 1.2,
  aperture: 38,
})

cone.flyTo()
```

## 平滑扩散完整示例

传入 `expansion` 后，锥体从零尺寸平滑增长到 `maxRadiusMeters` 与 `lengthMeters`。扩散路径只创建一个 Cesium `Primitive`，每帧原地更新模型矩阵，不会逐帧重建几何。

```ts
import { createScanConeEffect } from '@ztgkzhaohao/geo-effect-kit'

const cone = createScanConeEffect(viewer, {
  center: { longitude: 116.391, latitude: 39.907 },
  type: 'alarm',
  color: '#ff315a',
  lengthMeters: 6200,
  speed: 1.2,
  aperture: 38,
  expansion: {
    maxRadiusMeters: 2200,
    durationMs: 4500,
    cameraFollow: false,
    autoStart: true,
    onFrame: (frame) => {
      const percent = Math.round(frame.progress * 100)
      console.log(`${percent}%`, frame.radiusMeters, frame.lengthMeters)
    },
    onComplete: (frame) => {
      console.log('扩散完成', frame.radiusMeters, frame.lengthMeters)
    },
  },
})

// 在页面、图层或 Viewer 的生命周期清理函数中调用：
// cone.destroy()
```

`durationMs` 默认 `4500` 毫秒，可用范围为 `100` 到 `120000` 毫秒。`autoStart` 默认 `true`；如果设为 `false`，创建后调用 `restartExpansion()` 才开始扩散。

## 回调帧字段

`onFrame` 在扩散的每个渲染帧调用，`onComplete` 只在最终帧后调用一次。二者收到相同结构的状态对象：

| 字段 | 含义 |
| --- | --- |
| `status` | `idle`、`running`、`paused`、`completed` 或 `cancelled` |
| `progress` | 平滑曲线采样后的进度，范围为 `0` 到 `1`；最终帧精确为 `1` |
| `radiusMeters` | 当前半径，单位为米 |
| `lengthMeters` | 当前锥长，Demo 中显示为 height，单位为米 |
| `elapsedMs` | 当前运行已累计的扩散时间，最终值精确为 `durationMs` |

回调运行在渲染循环中，应保持轻量。不要在 `onFrame` 中发起网络请求、遍历大量业务数据或重复进行昂贵计算；需要关联业务资源时，由宿主预先计算距离，再根据 `frame.radiusMeters` 决定资源是否显示。SDK 只报告扩散尺寸，不创建或管理业务资源模型。

## 控制与更新

```ts
// 从零开始一轮新扩散；取消后也可重新开始。
cone.restartExpansion()

// 停在当前尺寸，并把状态改为 cancelled。
cone.cancelExpansion()

// 查询运行状态和当前帧快照。
if (cone.isExpanding()) {
  console.log(cone.getExpansionState())
}

// 隐藏时自动暂停，show() 后从原进度继续。
cone.hide()
cone.show()

// 更新最终尺寸或时长会自动从零重启。
cone.update({
  lengthMeters: 9000,
  expansion: {
    maxRadiusMeters: 4800,
    durationMs: 6000,
    cameraFollow: false,
  },
})

// 永久清理 Primitive/Entity、数据源、镜头监听和渲染循环。
cone.destroy()
```

`hide()` 只会暂停正在运行的扩散，`show()` 会继续这一轮；`cancelExpansion()` 不会被 `show()` 恢复，需要调用 `restartExpansion()`。`getExpansionState()` 返回独立快照，可以安全读取。

## 智能镜头边界

`cameraFollow` 默认是 `false`。只有显式设为 `true` 时，SDK 才会在最终锥体超出视野时安排一次镜头拉远。用户通过鼠标、滚轮或触摸接管镜头后，本轮扩散仍继续，SDK 不会再次抢回镜头；下一次 `restartExpansion()` 才重新允许智能跟随。

若宿主需要完全控制镜头，请保持默认值，并直接通过 Cesium `viewer.camera` 安排镜头位置。普通 `cone.flyTo()` 只按静态 `radiusMeters` 与 `lengthMeters` 估算范围，不读取 `expansion.maxRadiusMeters`，因此不保证能完整容纳更大的扩散终态。

## 类型建议

- `searchlight`：探照灯或巡检光锥。
- `radar`：雷达扫描锥。
- `camera`：摄像头视锥。
- `drone`：无人机或移动探测范围。
- `alarm`：高危告警锥。

## 静态行为与清理

不传 `expansion` 时仍走原有静态 `Entity` 路径，`center`、`radiusMeters`、`lengthMeters` 或 `aperture` 变化会按原逻辑重建锥体几何；类型、颜色、速度、透明度、`heading` 和原点标记可直接更新。无论静态还是扩散模式，离开页面时都必须调用 `destroy()`。
