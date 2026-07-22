# Scan Cone 平滑扩散设计

## 背景

`scan-cone` 当前支持旋转扫描、样式更新和位置更新，但修改 `radiusMeters`、`lengthMeters` 或 `aperture` 会重新创建锥体几何。它适合展示固定尺寸的扫描锥，不适合在连续动画帧中扩大搜索范围。

本次增强面向开源组件库本身，只提供通用的锥体扩散和镜头跟随能力。消防资源、无人机巢、Billboard、Text、列表、接口请求和业务操作均由 FireHotspot 等使用方实现。

## 目标

- 扫描锥从中心平滑扩散到指定的最大扫描半径。
- `length` 与半径使用同一进度同步增长，扩散过程中保持稳定的锥体比例。
- 锥体原有旋转扫描材质在扩散过程中持续运行。
- 最终范围超出当前视野时，镜头平滑拉远；用户主动操作后退出自动跟随。
- 每个扩散动画帧向使用方返回当前半径等状态。
- 支持完成、暂停、取消、重播和销毁等生命周期。
- 保持未启用扩散时的现有 API 和视觉行为不变。
- 在现有 Demo 中提供可直接操作和观察的演示。

## 非目标

- 不定义消防资源或其他业务资源模型。
- 不计算资源与扫描中心之间的距离。
- 不渲染资源 Billboard、Label、列表或详情。
- 不请求任何资源搜索接口。
- 不决定资源何时出现；使用方可根据逐帧半径自行处理。

## 公开 API

在 `ScanConeOptions` 中增加可选的 `expansion` 配置：

```ts
export interface ScanConeExpansionOptions {
  maxRadiusMeters: number
  durationMs?: number
  cameraFollow?: boolean
  autoStart?: boolean
  onFrame?: (frame: ScanConeExpansionFrame) => void
  onComplete?: (frame: ScanConeExpansionFrame) => void
}

export interface ScanConeExpansionFrame {
  progress: number
  radiusMeters: number
  lengthMeters: number
  elapsedMs: number
}

export type ScanConeExpansionStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled'

export interface ScanConeExpansionState extends ScanConeExpansionFrame {
  status: ScanConeExpansionStatus
}

export interface ScanConeOptions {
  // 保留现有字段
  expansion?: ScanConeExpansionOptions
}
```

`ScanConeEffectInstance` 增加：

```ts
restartExpansion(): void
cancelExpansion(): void
isExpanding(): boolean
getExpansionState(): ScanConeExpansionState
```

使用示例：

```ts
const cone = createScanConeEffect(viewer, {
  center: { longitude: 116.85, latitude: 40.37 },
  type: 'radar',
  color: '#7cf7ff',
  lengthMeters: 8_000,
  expansion: {
    maxRadiusMeters: 20_000,
    durationMs: 4_500,
    cameraFollow: true,
    autoStart: true,
    onFrame(frame) {
      revealResourcesWithin(frame.radiusMeters)
    },
    onComplete(frame) {
      finishResourceSearch(frame.radiusMeters)
    },
  },
})
```

## 配置语义与默认值

- `maxRadiusMeters` 是扩散模式下最终地面扫描半径，也是最终锥体底面半径。
- `lengthMeters` 沿用现有字段，在扩散模式下表示最终高度。
- 扩散开始时，逻辑半径和逻辑高度均为 `0`。渲染层可使用极小的非零缩放规避零矩阵，但回调必须从合法的 `0` 进度开始。
- `durationMs` 默认 `4500`，归一化到 `100` 至 `120000` 毫秒。
- `cameraFollow` 默认 `false`。开源库不能在未获使用方明确同意时主动改变镜头。
- `autoStart` 默认 `true`。使用方可设为 `false`，再调用 `restartExpansion()` 启动。
- 动画使用固定的平滑缓入缓出曲线，首尾没有突跳。首版不开放自定义 easing，避免扩大公开 API。
- 未提供 `expansion` 时，`radiusMeters`、`lengthMeters` 和 `aperture` 的现有含义保持不变。
- 提供 `expansion` 时，`maxRadiusMeters` 是最终底面半径的权威值；当前半径通过扩散状态和回调暴露。`radiusMeters` 不再作为该次扩散的最终目标。

## 渲染设计

### 固定几何与连续缩放

扩散模式预先创建最终尺寸的锥体几何，在动画帧中只更新模型变换，不重复删除和创建 Entity 或 Geometry。横向缩放控制当前半径，纵向缩放控制当前高度，两者共享同一进度，因此锥体不会在扩散中突然变扁或变尖。

扩散模式使用可更新 `modelMatrix` 的 Cesium Primitive。静态模式继续走现有 Entity 路径，减少对既有用户的影响。两条路径复用相同的扫描材质注册、颜色、透明度、速度和类型语义。

锥体以地面扫描中心为缩放原点。最终底面半径严格等于 `maxRadiusMeters`，最终高度严格等于 `lengthMeters`。

### 材质动画

旋转扫描材质的时间轴与扩散时间轴分离：

- 扩散暂停时，尺寸进度暂停。
- 锥体可见时，旋转扫描仍按现有 `speed` 运转。
- 重播扩散只重置尺寸进度，不重置材质旋转相位。

## 逐帧回调

每个实际扩散渲染帧同步调用一次 `onFrame`。回调包含归一化进度、当前半径、当前高度和已用时间，FireHotspot 可据此自行判断哪些资源进入扫描范围。

完成时遵循固定顺序：

1. 将状态设置为最终尺寸和 `completed`。
2. 最后调用一次 `onFrame`，并保证 `progress` 为 `1`、半径为 `maxRadiusMeters`、高度为 `lengthMeters`。
3. 调用一次 `onComplete`，参数与最后一次 `onFrame` 一致。

`cancelExpansion()` 不调用 `onComplete`。逐帧回调是同步通知，使用方不应在其中执行网络请求或其他重计算任务。

## 智能镜头

启动扩散时，根据扫描中心、最终底面范围和最终锥体高度计算最终包围体：

- 当前视野已能完整容纳最终包围体时，不移动镜头。
- 当前视野不足时，保持合理的当前朝向和俯视关系，平滑调整到能容纳最终锥体并保留约 15% 至 20% 边距的位置。
- 镜头调整与扩散使用相同的总体时长，避免锥体追上屏幕边缘后镜头才突然移动。
- 仅在本次扩散期间监听鼠标、触控和滚轮操作。用户主动操作时取消 Cesium 镜头飞行并关闭本次自动跟随，扩散动画继续。
- 本次跟随被取消后不自动恢复；调用 `restartExpansion()` 会重新评估是否需要跟随。

镜头跟随不持续锁定目标，也不在每一帧重复调用相机飞行 API。

## 生命周期

- `restartExpansion()`：取消旧动画帧，将逻辑尺寸重置为 `0`，重新评估镜头并开始新一轮扩散。
- `cancelExpansion()`：取消动画，保留当前可见尺寸，状态变为 `cancelled`。
- `hide()`：隐藏效果并暂停正在运行的扩散，状态变为 `paused`。
- `show()`：仅当扩散由 `hide()` 暂停时从原进度继续；被显式取消的扩散不会恢复。
- `update()`：颜色、透明度、速度、类型、中心和朝向继续按现有语义更新。正在运行时若修改 `lengthMeters` 或 `expansion` 的尺寸、时长配置，则从 `0` 自动重启，避免中途尺寸跳变。
- `destroy()`：取消动画帧和镜头飞行，移除输入监听、Primitive、Entity 和 DataSource。后续方法调用保持无操作语义。

## Demo 设计

现有 `scan-cone` Demo 增加扩散控制区：

- “平滑扩散”开关。
- 最大扫描半径输入框。
- 扩散时长输入框。
- “智能镜头”开关。
- “重新扩散”和“取消扩散”按钮。
- 实时显示当前半径、当前高度、进度和状态。

默认演示使用足以明显观察镜头拉远的最终半径和高度。关闭“平滑扩散”后仍展示原有固定尺寸 `scan-cone`，便于对照和验证向后兼容性。生成的示例代码同步包含扩散配置与逐帧回调。

## 错误处理

- 非有限或非正数的最大半径回退到安全最小值 `1` 米。
- 非有限时长回退到默认值，过大或过小值按约定范围截断。
- 动画时间戳倒退时不允许进度回退。
- 重复调用取消、隐藏、显示或销毁保持幂等。
- 镜头飞行失败或已被外部逻辑取消时，不影响扩散本身和逐帧回调。

## 测试与验收

### 自动化测试

- 归一化扩散默认值、非法半径和非法时长。
- 使用可控时间戳验证进度、半径和高度单调增长。
- 验证同一帧中半径和高度使用相同进度。
- 验证结束值精确等于最大半径和最终高度。
- 验证 `onFrame` 顺序和 `onComplete` 仅调用一次。
- 验证取消不触发完成回调，重播从 `0` 开始。
- 验证隐藏后暂停、显示后续播、销毁后不再产生回调。
- 验证扩散模式不在动画帧中重复创建几何。
- 验证视野足够时不移动镜头，视野不足时启动一次镜头调整。
- 验证用户输入取消镜头跟随但不取消扩散。
- 保留并运行现有 `scan-cone` 和完整核心包测试。

### Demo 验收

- 扩散过程没有可见闪烁、跳变或锥体比例突变。
- 旋转扫描与尺寸扩散同时平滑运行。
- 实时数值与画面尺寸变化一致，最后准确到达配置值。
- 智能镜头只在必要时拉远，用户接管后不抢回控制权。
- 重新扩散、取消扩散、隐藏、显示和切换固定模式行为明确。

## 兼容性

- `expansion` 为完全可选字段，现有调用无需修改。
- 现有 `createScanConeEffect` 工厂名称、返回实例和静态模式生命周期保持不变。
- 新类型和新实例方法从核心包公开导出。
- 更新 `knowledge/effects/scan-cone.effect.json`、`knowledge/docs/scan-cone.md`、核心 README、Demo 示例和变更记录，使 MCP、文档和人工演示保持一致。
