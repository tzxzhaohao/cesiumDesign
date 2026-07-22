# Scan Cone Smooth Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为开源 `scan-cone` 增加半径与高度同步平滑增长、逐帧状态回调、智能镜头跟随和可交互 Demo，同时保持静态模式向后兼容。

**Architecture:** 新建一个无 Cesium 依赖的扩散状态模块，集中定义公开类型、配置归一化和确定性的帧采样。`ScanConeEffect` 在配置 `expansion` 时改用单个单位锥体 `Primitive`，每帧只更新 `modelMatrix`；静态模式继续使用现有 Entity。镜头跟随由效果实例在扩散启动时一次性规划，并通过 Canvas 输入监听允许用户接管。

**Tech Stack:** TypeScript 5.9、Cesium 1.136、Node.js `node:test`、Vite、pnpm workspace。

---

## 文件结构

- Create: `packages/core/src/scan-cone-expansion.ts`：扩散公开类型、配置归一化、缓动和帧采样，不依赖 Cesium。
- Modify: `packages/core/src/index.ts`：接入扩散配置、Primitive 渲染、生命周期、回调和智能镜头。
- Modify: `packages/core/test/scanConeEffect.test.mjs`：核心扩散、生命周期、镜头和向后兼容测试。
- Modify: `apps/demo/index.html`：扩散参数、操作按钮和实时状态控件。
- Modify: `apps/demo/src/main.ts`：Demo 状态、实例控制和生成代码。
- Modify: `apps/demo/src/styles.css`：扩散操作区和实时状态样式。
- Modify: `apps/demo/test/tianditu-config.test.mjs`：Demo 接线和生成代码静态回归测试。
- Modify: `knowledge/effects/scan-cone.effect.json`：机器可读参数、方法、示例和注意事项。
- Modify: `knowledge/docs/scan-cone.md`：中文扩散接入与生命周期说明。
- Modify: `README.zh-CN.md`：中文能力摘要和示例入口。
- Modify: `README.md`：英文能力摘要。
- Modify: `packages/core/README.md`：npm 包能力摘要。
- Modify: `CHANGELOG.md`：记录未发布的扩散能力。

### Task 1: 建立扩散类型、归一化和确定性帧采样

**Files:**
- Create: `packages/core/src/scan-cone-expansion.ts`
- Modify: `packages/core/src/index.ts:537-582`
- Modify: `packages/core/src/index.ts:1002-1018`
- Test: `packages/core/test/scanConeEffect.test.mjs`

- [ ] **Step 1: 写扩散配置和帧采样失败测试**

在 `packages/core/test/scanConeEffect.test.mjs` 增加直接针对构建产物子模块的导入和测试：

```js
import {
  normalizeScanConeExpansionOptions,
  sampleScanConeExpansionFrame,
} from '../dist/scan-cone-expansion.js'

test('scan-cone expansion normalizes defaults and unsafe values', () => {
  const onFrame = () => undefined
  const normalized = normalizeScanConeExpansionOptions({
    maxRadiusMeters: Number.NaN,
    durationMs: 999_999,
    onFrame,
  })

  assert.equal(normalized.maxRadiusMeters, 1)
  assert.equal(normalized.durationMs, 120_000)
  assert.equal(normalized.cameraFollow, false)
  assert.equal(normalized.autoStart, true)
  assert.equal(normalized.onFrame, onFrame)
})

test('scan-cone expansion samples radius and length from one eased progress', () => {
  const options = normalizeScanConeExpansionOptions({
    maxRadiusMeters: 20_000,
    durationMs: 4_000,
  })

  assert.deepEqual(sampleScanConeExpansionFrame(options, 8_000, 0), {
    progress: 0,
    radiusMeters: 0,
    lengthMeters: 0,
    elapsedMs: 0,
  })
  assert.deepEqual(sampleScanConeExpansionFrame(options, 8_000, 2_000), {
    progress: 0.5,
    radiusMeters: 10_000,
    lengthMeters: 4_000,
    elapsedMs: 2_000,
  })
  assert.deepEqual(sampleScanConeExpansionFrame(options, 8_000, 5_000), {
    progress: 1,
    radiusMeters: 20_000,
    lengthMeters: 8_000,
    elapsedMs: 4_000,
  })
})
```

- [ ] **Step 2: 构建并确认测试因缺少模块而失败**

Run:

```bash
pnpm --filter @ztgkzhaohao/geo-effect-kit build
node --test packages/core/test/scanConeEffect.test.mjs
```

Expected: FAIL，错误包含 `Cannot find module '../dist/scan-cone-expansion.js'`。

- [ ] **Step 3: 创建纯扩散状态模块**

创建 `packages/core/src/scan-cone-expansion.ts`：

```ts
export interface ScanConeExpansionFrame {
  progress: number
  radiusMeters: number
  lengthMeters: number
  elapsedMs: number
}

export type ScanConeExpansionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled'

export interface ScanConeExpansionState extends ScanConeExpansionFrame {
  status: ScanConeExpansionStatus
}

export interface ScanConeExpansionOptions {
  maxRadiusMeters: number
  durationMs?: number
  cameraFollow?: boolean
  autoStart?: boolean
  onFrame?: (frame: ScanConeExpansionFrame) => void
  onComplete?: (frame: ScanConeExpansionFrame) => void
}

export interface NormalizedScanConeExpansionOptions {
  maxRadiusMeters: number
  durationMs: number
  cameraFollow: boolean
  autoStart: boolean
  onFrame?: (frame: ScanConeExpansionFrame) => void
  onComplete?: (frame: ScanConeExpansionFrame) => void
}

const DEFAULT_DURATION_MS = 4_500
const MIN_DURATION_MS = 100
const MAX_DURATION_MS = 120_000

export function normalizeScanConeExpansionOptions(
  options: ScanConeExpansionOptions,
): NormalizedScanConeExpansionOptions {
  const maxRadiusMeters = Number.isFinite(options.maxRadiusMeters)
    ? Math.max(1, options.maxRadiusMeters)
    : 1
  const rawDuration = Number.isFinite(options.durationMs) ? (options.durationMs ?? DEFAULT_DURATION_MS) : DEFAULT_DURATION_MS
  const durationMs = Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, rawDuration))

  return {
    maxRadiusMeters,
    durationMs,
    cameraFollow: options.cameraFollow ?? false,
    autoStart: options.autoStart ?? true,
    ...(options.onFrame ? { onFrame: options.onFrame } : {}),
    ...(options.onComplete ? { onComplete: options.onComplete } : {}),
  }
}

export function sampleScanConeExpansionFrame(
  options: NormalizedScanConeExpansionOptions,
  finalLengthMeters: number,
  elapsedMs: number,
): ScanConeExpansionFrame {
  const safeElapsed = Math.min(options.durationMs, Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0))
  const linearProgress = safeElapsed / options.durationMs
  const progress = easeInOutCubic(linearProgress)

  return {
    progress,
    radiusMeters: options.maxRadiusMeters * progress,
    lengthMeters: Math.max(1, finalLengthMeters) * progress,
    elapsedMs: safeElapsed,
  }
}

function easeInOutCubic(value: number): number {
  if (value <= 0) return 0
  if (value >= 1) return 1
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2
}
```

- [ ] **Step 4: 将扩散类型接入核心公开接口**

在 `packages/core/src/index.ts` 顶部导入纯函数和类型，并从包根导出公开类型：

```ts
import {
  normalizeScanConeExpansionOptions,
  sampleScanConeExpansionFrame,
  type NormalizedScanConeExpansionOptions,
  type ScanConeExpansionFrame,
  type ScanConeExpansionOptions,
  type ScanConeExpansionState,
} from './scan-cone-expansion.js'

export type {
  ScanConeExpansionFrame,
  ScanConeExpansionOptions,
  ScanConeExpansionState,
  ScanConeExpansionStatus,
} from './scan-cone-expansion.js'
```

扩展 Scan Cone 类型：

```ts
export interface ScanConeOptions {
  center: GeoEffectPosition
  type?: ScanConeType | string
  color?: string
  radiusMeters?: number
  lengthMeters?: number
  speed?: number
  opacity?: number
  aperture?: number
  heading?: number
  pitch?: number
  showOrigin?: boolean
  visible?: boolean
  expansion?: ScanConeExpansionOptions
}

export interface NormalizedScanConeOptions {
  center: GeoEffectPosition
  type: ScanConeType
  color: string
  radiusMeters: number
  lengthMeters: number
  speed: number
  opacity: number
  aperture: number
  heading: number
  pitch: number
  showOrigin: boolean
  visible: boolean
  expansion?: NormalizedScanConeExpansionOptions
}
```

在 `normalizeScanConeOptions()` 返回对象末尾加入：

```ts
...(options.expansion
  ? { expansion: normalizeScanConeExpansionOptions(options.expansion) }
  : {}),
```

- [ ] **Step 5: 构建并确认纯逻辑测试通过**

Run:

```bash
pnpm --filter @ztgkzhaohao/geo-effect-kit build
node --test packages/core/test/scanConeEffect.test.mjs
```

Expected: PASS，现有静态 Scan Cone 测试和新增两个扩散测试全部通过。

- [ ] **Step 6: 提交扩散模型**

```bash
git add packages/core/src/scan-cone-expansion.ts packages/core/src/index.ts packages/core/test/scanConeEffect.test.mjs
git commit -m "新增扫描锥扩散模型"
```

### Task 2: 使用单个 Primitive 实现扩散与生命周期

**Files:**
- Modify: `packages/core/src/index.ts:1-40`
- Modify: `packages/core/src/index.ts:4206-4413`
- Modify: `packages/core/src/index.ts:4794-4860`
- Test: `packages/core/test/scanConeEffect.test.mjs:121-211`

- [ ] **Step 1: 写单 Primitive、回调和生命周期失败测试**

为测试文件增加可控动画帧环境，并让 Viewer mock 支持 `scene.primitives`：

```js
function installAnimationFrameHarness() {
  let nextId = 1
  const callbacks = new Map()
  globalThis.window = {
    requestAnimationFrame(callback) {
      const id = nextId++
      callbacks.set(id, callback)
      return id
    },
    cancelAnimationFrame(id) {
      callbacks.delete(id)
    },
  }

  return {
    flush(timestamp) {
      const pending = Array.from(callbacks.values())
      callbacks.clear()
      pending.forEach((callback) => callback(timestamp))
    },
    pendingCount() {
      return callbacks.size
    },
    restore() {
      delete globalThis.window
    },
  }
}
```

新增核心行为测试：

```js
test('ScanConeEffect expands one primitive and reports exact frame state', () => {
  const animation = installAnimationFrameHarness()
  const frames = []
  const completed = []
  const viewer = createMockViewer()
  const effect = createScanConeEffect(viewer, {
    center,
    lengthMeters: 8_000,
    expansion: {
      maxRadiusMeters: 20_000,
      durationMs: 1_000,
      onFrame: (frame) => frames.push(frame),
      onComplete: (frame) => completed.push(frame),
    },
  })

  assert.equal(viewer.scene.primitives.addCount, 1)
  const primitive = viewer.scene.primitives.items[0]
  animation.flush(0)
  animation.flush(500)
  animation.flush(1_000)

  assert.equal(viewer.scene.primitives.items[0], primitive)
  assert.deepEqual(frames.map((frame) => frame.radiusMeters), [0, 10_000, 20_000])
  assert.deepEqual(frames.map((frame) => frame.lengthMeters), [0, 4_000, 8_000])
  assert.equal(completed.length, 1)
  assert.equal(effect.getExpansionState().status, 'completed')
  assert.equal(effect.isExpanding(), false)

  effect.restartExpansion()
  animation.flush(2_000)
  assert.equal(effect.getExpansionState().radiusMeters, 0)
  effect.cancelExpansion()
  assert.equal(effect.getExpansionState().status, 'cancelled')

  effect.destroy()
  assert.equal(viewer.scene.primitives.removeCount, 1)
  animation.restore()
})

test('ScanConeEffect pauses on hide and resumes on show without completing while hidden', () => {
  const animation = installAnimationFrameHarness()
  const completed = []
  const effect = createScanConeEffect(createMockViewer(), {
    center,
    lengthMeters: 4_000,
    expansion: {
      maxRadiusMeters: 10_000,
      durationMs: 1_000,
      onComplete: (frame) => completed.push(frame),
    },
  })

  animation.flush(0)
  animation.flush(400)
  effect.hide()
  animation.flush(900)
  assert.equal(effect.getExpansionState().status, 'paused')
  assert.equal(completed.length, 0)

  effect.show()
  animation.flush(1_000)
  animation.flush(1_600)
  assert.equal(effect.getExpansionState().status, 'completed')
  assert.equal(completed.length, 1)
  effect.destroy()
  animation.restore()
})
```

- [ ] **Step 2: 运行测试并确认 Primitive 和生命周期尚未实现**

Run:

```bash
pnpm --filter @ztgkzhaohao/geo-effect-kit build
node --test packages/core/test/scanConeEffect.test.mjs
```

Expected: FAIL，断言显示 `scene.primitives.addCount`、`restartExpansion` 或逐帧状态不符合预期。

- [ ] **Step 3: 增加 Primitive 所需 Cesium 导入和材质工厂**

在 `packages/core/src/index.ts` 的 Cesium 导入中加入：

```ts
CylinderGeometry,
MaterialAppearance,
Matrix4,
```

把扫描锥材质 uniforms 抽成共享函数：

```ts
function createScanConeUniforms(options: NormalizedScanConeOptions): Record<string, unknown> {
  return {
    color: Color.fromCssColorString(options.color).withAlpha(1),
    opacity: options.opacity,
    speed: options.speed,
    timeSeconds: -1,
    coneType: getScanConeTypeUniform(options.type),
    aperture: options.aperture,
  }
}

function createScanConePrimitiveMaterial(options: NormalizedScanConeOptions): Material {
  registerScanConeMaterial()
  return Material.fromType(GEO_SCAN_CONE_MATERIAL_TYPE, createScanConeUniforms(options))
}
```

`createScanConeMaterialProperty()` 改为调用 `createScanConeUniforms(normalized)`，保证静态 Entity 和扩散 Primitive 的材质字段一致。

- [ ] **Step 4: 在 ScanConeEffect 中增加扩散状态和单 Primitive 渲染**

先扩展实例接口：

```ts
export interface ScanConeEffectInstance {
  update(options: Partial<ScanConeOptions>): void
  show(): void
  hide(): void
  flyTo(options?: ScanConeFlyToOptions): void
  restartExpansion(): void
  cancelExpansion(): void
  isExpanding(): boolean
  getExpansionState(): ScanConeExpansionState
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedScanConeOptions
}
```

在类中增加核心字段：

```ts
private conePrimitive: Primitive | null = null
private primitiveMaterial: Material | null = null
private expansionStartedAt: number | null = null
private expansionState: ScanConeExpansionState = {
  status: 'idle',
  progress: 0,
  radiusMeters: 0,
  lengthMeters: 0,
  elapsedMs: 0,
}
private resumeExpansionAfterShow = false
private readonly expansionModelMatrix = new Matrix4()
```

新增扩散 Primitive 创建逻辑：

```ts
private renderExpansionPrimitive(): void {
  this.clearConeVolume()
  this.primitiveMaterial = createScanConePrimitiveMaterial(this.options)
  this.conePrimitive = this.viewer.scene.primitives.add(
    new Primitive({
      geometryInstances: new GeometryInstance({
        geometry: new CylinderGeometry({
          length: 1,
          topRadius: 0,
          bottomRadius: 1,
          slices: 128,
          vertexFormat: MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat,
        }),
      }),
      appearance: new MaterialAppearance({
        material: this.primitiveMaterial,
        faceForward: true,
        closed: true,
      }),
      asynchronous: false,
      modelMatrix: this.expansionModelMatrix,
      show: this.options.visible,
    }),
  )
  this.applyExpansionFrame(this.expansionState)
  this.syncOriginEntity()
}
```

模型矩阵以地面中心为原点，并让单位锥体底部停在原点：

```ts
private applyExpansionFrame(frame: ScanConeExpansionFrame): void {
  if (!this.conePrimitive) return
  const renderProgress = Math.max(frame.progress, 0.000001)
  const heading = this.options.heading + getAnimationSeconds() * this.options.speed * 36
  const base = Transforms.headingPitchRollToFixedFrame(
    this.getOriginCartesian(),
    HeadingPitchRoll.fromDegrees(heading, this.options.pitch, 0),
  )
  Matrix4.multiplyByScale(
    base,
    new Cartesian3(
      this.options.expansion?.maxRadiusMeters ?? 1,
      this.options.expansion?.maxRadiusMeters ?? 1,
      this.options.lengthMeters,
    ),
    this.expansionModelMatrix,
  )
  Matrix4.multiplyByUniformScale(this.expansionModelMatrix, renderProgress, this.expansionModelMatrix)
  Matrix4.multiplyByTranslation(
    this.expansionModelMatrix,
    new Cartesian3(0, 0, 0.5),
    this.expansionModelMatrix,
  )
  this.conePrimitive.modelMatrix = Matrix4.clone(this.expansionModelMatrix, this.conePrimitive.modelMatrix)
}
```

实现 `clearConeVolume()`，确保 Entity 和 Primitive 互斥并各自只移除一次：

```ts
private clearConeVolume(): void {
  if (this.coneEntity) {
    this.dataSource.entities.remove(this.coneEntity)
    this.coneEntity = null
  }
  if (this.conePrimitive) {
    this.viewer.scene.primitives.remove(this.conePrimitive)
    this.conePrimitive = null
  }
  this.material = null
  this.primitiveMaterial = null
}
```

- [ ] **Step 5: 将扩散采样接入现有渲染循环和生命周期**

渲染循环必须使用 `requestAnimationFrame` 传入的时间戳，先更新扩散，再请求场景渲染：

```ts
private tickExpansion(timestamp: number): void {
  const expansion = this.options.expansion
  if (!expansion || this.expansionState.status !== 'running') return
  this.expansionStartedAt ??= timestamp - this.expansionState.elapsedMs
  const elapsedMs = Math.max(this.expansionState.elapsedMs, timestamp - this.expansionStartedAt)
  const frame = sampleScanConeExpansionFrame(expansion, this.options.lengthMeters, elapsedMs)
  const completed = frame.elapsedMs >= expansion.durationMs
  this.expansionState = { ...frame, status: completed ? 'completed' : 'running' }
  this.applyExpansionFrame(frame)
  expansion.onFrame?.(frame)
  if (completed) expansion.onComplete?.(frame)
}
```

实现公开方法：

```ts
restartExpansion(): void {
  if (this.destroyed || !this.options.expansion) return
  this.expansionStartedAt = null
  this.expansionState = { status: 'running', progress: 0, radiusMeters: 0, lengthMeters: 0, elapsedMs: 0 }
  this.resumeExpansionAfterShow = false
  this.applyExpansionFrame(this.expansionState)
  this.startRenderLoop()
}

cancelExpansion(): void {
  if (this.destroyed || !this.options.expansion || this.expansionState.status !== 'running') return
  this.expansionState = { ...this.expansionState, status: 'cancelled' }
  this.expansionStartedAt = null
  this.resumeExpansionAfterShow = false
}

isExpanding(): boolean {
  return this.expansionState.status === 'running'
}

getExpansionState(): ScanConeExpansionState {
  return { ...this.expansionState }
}
```

构造函数在 `renderEntities()` 后根据 `autoStart` 调用 `restartExpansion()`；`hide()` 保存是否需要续播并把状态设为 `paused`；`show()` 恢复时把 `expansionStartedAt` 置空；`destroy()` 先取消扩散再移除 Primitive。`update()` 在扩散模式与静态模式切换时重建渲染路径，扩散目标或 `lengthMeters` 改变时自动调用 `restartExpansion()`。

构造和显隐逻辑按以下状态顺序接入：

```ts
constructor(viewer: Viewer, options: ScanConeOptions) {
  this.viewer = viewer
  this.options = normalizeScanConeOptions(options)
  this.dataSource = new CustomDataSource('geo-effect-kit-scan-cone')
  this.dataSource.show = this.options.visible
  this.viewer.dataSources.add(this.dataSource)
  this.renderConeVolume()
  if (this.options.expansion?.autoStart) this.restartExpansion()
  this.startRenderLoop()
  this.viewer.scene.requestRender()
}

show(): void {
  if (this.destroyed) return
  this.options = { ...this.options, visible: true }
  this.dataSource.show = true
  if (this.conePrimitive) this.conePrimitive.show = true
  if (this.resumeExpansionAfterShow && this.options.expansion) {
    this.expansionState = { ...this.expansionState, status: 'running' }
    this.expansionStartedAt = null
    this.resumeExpansionAfterShow = false
  }
  this.startRenderLoop()
  this.viewer.scene.requestRender()
}

hide(): void {
  if (this.destroyed) return
  this.options = { ...this.options, visible: false }
  this.resumeExpansionAfterShow = this.expansionState.status === 'running'
  if (this.resumeExpansionAfterShow) {
    this.expansionState = { ...this.expansionState, status: 'paused' }
    this.expansionStartedAt = null
  }
  this.dataSource.show = false
  if (this.conePrimitive) this.conePrimitive.show = false
  this.stopRenderLoop()
  this.viewer.scene.requestRender()
}
```

`renderConeVolume()` 只在静态 Entity 和扩散 Primitive 之间选择一次：

```ts
private renderConeVolume(): void {
  if (this.options.expansion) this.renderExpansionPrimitive()
  else this.renderEntities()
}
```

`update()` 比较旧、新配置：扩散模式开关变化时调用 `renderConeVolume()`；扩散模式内只有 `maxRadiusMeters`、`durationMs` 或 `lengthMeters` 变化才调用 `restartExpansion()`；颜色、透明度、速度、类型、中心、heading 和 pitch 只更新 uniforms、原点和下一帧矩阵。

- [ ] **Step 6: 扩展 Viewer mock 并确认测试通过**

在 `createMockViewer()` 的 `scene` 中加入：

```js
primitives: {
  addCount: 0,
  removeCount: 0,
  items: [],
  add(primitive) {
    this.addCount += 1
    this.items.push(primitive)
    return primitive
  },
  remove(primitive) {
    this.removeCount += 1
    this.items = this.items.filter((item) => item !== primitive)
    return true
  },
},
```

Run:

```bash
pnpm --filter @ztgkzhaohao/geo-effect-kit test
```

Expected: PASS，扩散只添加一个 Primitive，暂停、续播、取消、完成和销毁测试全部通过。

- [ ] **Step 7: 提交平滑扩散实现**

```bash
git add packages/core/src/index.ts packages/core/test/scanConeEffect.test.mjs
git commit -m "实现扫描锥平滑扩散"
```

### Task 3: 实现智能镜头与用户接管

**Files:**
- Modify: `packages/core/src/index.ts:1-40`
- Modify: `packages/core/src/index.ts:4206-4413`
- Test: `packages/core/test/scanConeEffect.test.mjs`

- [ ] **Step 1: 写镜头适配和用户接管失败测试**

从 Cesium 导入 `Intersect`，让 Viewer mock 的相机和 Canvas 可配置：

```js
import { Intersect } from 'cesium'

function createMockCanvas() {
  const listeners = new Map()
  return {
    addEventListener(type, listener) {
      const values = listeners.get(type) ?? []
      values.push(listener)
      listeners.set(type, values)
    },
    removeEventListener(type, listener) {
      listeners.set(type, (listeners.get(type) ?? []).filter((value) => value !== listener))
    },
    dispatch(type) {
      ;(listeners.get(type) ?? []).forEach((listener) => listener())
    },
  }
}
```

新增测试：

```js
test('ScanConeEffect only follows camera when final cone is outside the view', () => {
  const animation = installAnimationFrameHarness()
  const insideViewer = createMockViewer({ visibility: Intersect.INSIDE })
  const outsideViewer = createMockViewer({ visibility: Intersect.INTERSECTING })

  const inside = createScanConeEffect(insideViewer, {
    center,
    lengthMeters: 8_000,
    expansion: { maxRadiusMeters: 20_000, durationMs: 1_000, cameraFollow: true },
  })
  const outside = createScanConeEffect(outsideViewer, {
    center,
    lengthMeters: 8_000,
    expansion: { maxRadiusMeters: 20_000, durationMs: 1_000, cameraFollow: true },
  })

  assert.equal(insideViewer.camera.flyToBoundingSphereCount, 0)
  assert.equal(outsideViewer.camera.flyToBoundingSphereCount, 1)
  assert.equal(outsideViewer.camera.lastFlyToOptions.duration, 1)

  inside.destroy()
  outside.destroy()
  animation.restore()
})

test('user input cancels camera following without cancelling expansion', () => {
  const animation = installAnimationFrameHarness()
  const viewer = createMockViewer({ visibility: Intersect.INTERSECTING })
  const effect = createScanConeEffect(viewer, {
    center,
    expansion: { maxRadiusMeters: 20_000, durationMs: 1_000, cameraFollow: true },
  })

  viewer.scene.canvas.dispatch('wheel')
  assert.equal(viewer.camera.cancelFlightCount, 1)
  assert.equal(effect.isExpanding(), true)

  effect.restartExpansion()
  assert.equal(viewer.camera.flyToBoundingSphereCount, 2)
  effect.destroy()
  animation.restore()
})
```

- [ ] **Step 2: 运行测试并确认镜头尚未接线**

Run:

```bash
pnpm --filter @ztgkzhaohao/geo-effect-kit build
node --test packages/core/test/scanConeEffect.test.mjs
```

Expected: FAIL，`flyToBoundingSphereCount` 或 `cancelFlightCount` 仍为错误值。

- [ ] **Step 3: 计算最终包围体并仅在视野不足时启动镜头飞行**

在 Cesium 导入中增加 `Intersect`。在 `ScanConeEffect` 中实现：

```ts
private startExpansionCameraFollow(): void {
  const expansion = this.options.expansion
  if (!expansion?.cameraFollow) return

  const center = Cartesian3.fromDegrees(
    this.options.center.longitude,
    this.options.center.latitude,
    (this.options.center.height ?? 0) + this.options.lengthMeters / 2,
  )
  const halfLength = this.options.lengthMeters / 2
  const sphere = new BoundingSphere(
    center,
    Math.sqrt(expansion.maxRadiusMeters ** 2 + halfLength ** 2),
  )
  const camera = this.viewer.camera
  const cullingVolume = camera.frustum.computeCullingVolume(camera.positionWC, camera.directionWC, camera.upWC)
  if (cullingVolume.computeVisibility(sphere) === Intersect.INSIDE) return

  this.cameraFollowCancelled = false
  camera.flyToBoundingSphere(sphere, {
    duration: expansion.durationMs / 1000,
    offset: new HeadingPitchRange(camera.heading, camera.pitch, sphere.radius * 2.4),
  })
  this.installCameraInputListeners()
}
```

- [ ] **Step 4: 监听用户输入并清理监听器**

增加字段和方法：

```ts
private cameraFollowCancelled = false
private cameraInputCleanup: (() => void) | null = null

private installCameraInputListeners(): void {
  this.removeCameraInputListeners()
  const canvas = this.viewer.scene.canvas
  const cancel = () => {
    if (this.cameraFollowCancelled) return
    this.cameraFollowCancelled = true
    this.viewer.camera.cancelFlight()
    this.removeCameraInputListeners()
  }
  const eventNames = ['pointerdown', 'wheel', 'touchstart'] as const
  eventNames.forEach((name) => canvas.addEventListener(name, cancel, { passive: true }))
  this.cameraInputCleanup = () => {
    eventNames.forEach((name) => canvas.removeEventListener(name, cancel))
  }
}

private removeCameraInputListeners(): void {
  this.cameraInputCleanup?.()
  this.cameraInputCleanup = null
}
```

`restartExpansion()` 重置 `cameraFollowCancelled` 并调用 `startExpansionCameraFollow()`；完成、取消、隐藏和销毁时清理监听。`show()` 恢复暂停扩散时按剩余时长重新评估镜头，不恢复已由用户取消的同一轮跟随。

- [ ] **Step 5: 扩展相机 mock 并确认镜头测试通过**

Viewer mock 的相机增加：

```js
heading: 0,
pitch: -0.6,
positionWC: {},
directionWC: {},
upWC: {},
frustum: {
  computeCullingVolume() {
    return { computeVisibility: () => options.visibility ?? Intersect.INSIDE }
  },
},
cancelFlightCount: 0,
cancelFlight() {
  this.cancelFlightCount += 1
},
flyToBoundingSphere(_sphere, flyToOptions) {
  this.flyToBoundingSphereCount += 1
  this.lastFlyToOptions = flyToOptions
},
```

Run:

```bash
pnpm --filter @ztgkzhaohao/geo-effect-kit test
```

Expected: PASS，视野内不飞行、视野不足只启动一次飞行，用户接管只取消镜头。

- [ ] **Step 6: 提交智能镜头实现**

```bash
git add packages/core/src/index.ts packages/core/test/scanConeEffect.test.mjs
git commit -m "实现扫描锥镜头跟随"
```

### Task 4: 增加可交互 Demo

**Files:**
- Modify: `apps/demo/index.html:203-237`
- Modify: `apps/demo/index.html:343-367`
- Modify: `apps/demo/src/main.ts:169-217`
- Modify: `apps/demo/src/main.ts:793-928`
- Modify: `apps/demo/src/main.ts:1029-1037`
- Modify: `apps/demo/src/main.ts:1091-1152`
- Modify: `apps/demo/src/main.ts:1288-1301`
- Modify: `apps/demo/src/main.ts:1967-1978`
- Modify: `apps/demo/src/main.ts:2025-2200`
- Modify: `apps/demo/src/main.ts:2699-2715`
- Modify: `apps/demo/src/styles.css`
- Test: `apps/demo/test/tianditu-config.test.mjs`

- [ ] **Step 1: 写 Demo 控件、实时状态和生成代码失败测试**

在 `apps/demo/test/tianditu-config.test.mjs` 增加：

```js
test('scan-cone demo exposes smooth expansion controls and live frame state', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

  assert.match(html, /id="coneExpansion"/)
  assert.match(html, /id="coneMaxRadius"/)
  assert.match(html, /id="coneExpansionDuration"/)
  assert.match(html, /id="coneCameraFollow"/)
  assert.match(html, /id="restartConeExpansion"/)
  assert.match(html, /id="cancelConeExpansion"/)
  assert.match(html, /id="coneExpansionState"/)
  assert.match(source, /maxRadiusMeters: numberValue\(elements\.coneMaxRadius\)/)
  assert.match(source, /cameraFollow: elements\.coneCameraFollow\.checked/)
  assert.match(source, /onFrame: syncConeExpansionState/)
  assert.match(source, /restartExpansion\(\)/)
  assert.match(source, /cancelExpansion\(\)/)
  assert.match(source, /frame\.radiusMeters/)
  assert.match(source, /expansion: \{/)
})
```

- [ ] **Step 2: 运行 Demo 测试并确认控件不存在**

Run:

```bash
pnpm --filter geo-effect-kit-demo test
```

Expected: FAIL，首先缺少 `coneExpansion` 或 `coneMaxRadius`。

- [ ] **Step 3: 添加扩散控件和状态区域**

在 `apps/demo/index.html` 的长度和扫描时长控件附近加入：

```html
<label id="coneExpansionField" class="check-row" hidden>
  <input id="coneExpansion" type="checkbox" checked />
  <span>Smooth expansion</span>
</label>
<label id="coneMaxRadiusField" hidden>
  <span>Max radius</span>
  <input id="coneMaxRadius" type="range" min="1000" max="90000" step="1000" value="20000" />
  <output id="coneMaxRadiusValue">20,000 m</output>
</label>
<label id="coneExpansionDurationField" hidden>
  <span>Expansion duration</span>
  <input id="coneExpansionDuration" type="range" min="1000" max="12000" step="100" value="4500" />
  <output id="coneExpansionDurationValue">4,500 ms</output>
</label>
<label id="coneCameraFollowField" class="check-row" hidden>
  <input id="coneCameraFollow" type="checkbox" checked />
  <span>Smart camera</span>
</label>
<div id="coneExpansionActionsField" class="cone-expansion-actions" hidden>
  <button id="restartConeExpansion" type="button">Restart expansion</button>
  <button id="cancelConeExpansion" type="button">Cancel expansion</button>
  <output id="coneExpansionState" aria-live="polite">idle · 0 m · 0 m · 0%</output>
</div>
```

- [ ] **Step 4: 接入 Demo 元素、控制可见性和实时状态**

把五个新 Field ID 加入 `ControlId` 和 `controlFields`，把输入、输出和按钮加入 `elements`。`scan-cone` 的 `visibleByEffect` 增加全部扩散字段。

从核心包增加类型导入，并扩展控件类型：

```ts
import {
  // 现有导入保持原顺序
  type ScanConeEffectInstance,
  type ScanConeExpansionFrame,
} from '@ztgkzhaohao/geo-effect-kit'

type ControlId =
  // 现有 Field ID 保持不变
  | 'coneExpansionField'
  | 'coneMaxRadiusField'
  | 'coneExpansionDurationField'
  | 'coneCameraFollowField'
  | 'coneExpansionActionsField'
```

在 `elements` 和 `controlFields` 中分别加入：

```ts
const elements = {
  // 现有元素保持不变
  coneExpansion: getInput('coneExpansion'),
  coneMaxRadius: getInput('coneMaxRadius'),
  coneExpansionDuration: getInput('coneExpansionDuration'),
  coneCameraFollow: getInput('coneCameraFollow'),
  restartConeExpansion: getButton('restartConeExpansion'),
  cancelConeExpansion: getButton('cancelConeExpansion'),
  coneMaxRadiusValue: getElement('coneMaxRadiusValue'),
  coneExpansionDurationValue: getElement('coneExpansionDurationValue'),
  coneExpansionState: getElement('coneExpansionState'),
}

const controlFields: Record<ControlId, HTMLElement> = {
  // 现有字段保持不变
  coneExpansionField: getElement('coneExpansionField'),
  coneMaxRadiusField: getElement('coneMaxRadiusField'),
  coneExpansionDurationField: getElement('coneExpansionDurationField'),
  coneCameraFollowField: getElement('coneCameraFollowField'),
  coneExpansionActionsField: getElement('coneExpansionActionsField'),
}
```

新增状态同步函数：

```ts
function syncConeExpansionState(frame: ScanConeExpansionFrame): void {
  const status = (activeEffect as ScanConeEffectInstance | null)?.getExpansionState().status ?? 'idle'
  elements.coneExpansionState.textContent = [
    status,
    `${Math.round(frame.radiusMeters).toLocaleString()} m radius`,
    `${Math.round(frame.lengthMeters).toLocaleString()} m height`,
    `${Math.round(frame.progress * 100)}%`,
  ].join(' · ')
}
```

创建 Scan Cone 时按开关条件加入扩散配置：

```ts
const expansion = elements.coneExpansion.checked
  ? {
      maxRadiusMeters: numberValue(elements.coneMaxRadius),
      durationMs: numberValue(elements.coneExpansionDuration),
      cameraFollow: elements.coneCameraFollow.checked,
      autoStart: true,
      onFrame: syncConeExpansionState,
      onComplete: syncConeExpansionState,
    }
  : undefined

return createScanConeEffect(viewer, {
  center,
  type: elements.coneType.value as ScanConeType,
  color: elements.color.value,
  radiusMeters: numberValue(elements.radius),
  lengthMeters: numberValue(elements.length),
  speed: numberValue(elements.speed),
  opacity: numberValue(elements.opacity),
  aperture: numberValue(elements.aperture),
  heading: numberValue(elements.heading),
  showOrigin: elements.origin.checked,
  ...(expansion ? { expansion } : {}),
})
```

“平滑扩散”开关变化时销毁并重建当前 Scan Cone，使 `expansion` 可被完整移除；其他扩散参数走现有 `update()`。两个按钮仅在 `activeEffectId === 'scan-cone'` 时把实例收窄为 `ScanConeEffectInstance` 后调用对应方法。

开关和按钮使用独立监听，避免开关同时触发普通 `syncEffect()`：

```ts
elements.coneExpansion.addEventListener('change', () => {
  if (activeEffectId !== 'scan-cone') return
  activeEffect?.destroy()
  activeEffect = createEffect('scan-cone')
  activeEffect.flyTo()
  syncCopy()
})

elements.restartConeExpansion.addEventListener('click', () => {
  if (activeEffectId !== 'scan-cone') return
  ;(activeEffect as ScanConeEffectInstance | null)?.restartExpansion()
})

elements.cancelConeExpansion.addEventListener('click', () => {
  if (activeEffectId !== 'scan-cone') return
  ;(activeEffect as ScanConeEffectInstance | null)?.cancelExpansion()
  const state = (activeEffect as ScanConeEffectInstance | null)?.getExpansionState()
  if (state) syncConeExpansionState(state)
})
```

`setDefaults('scan-cone')` 设置 `coneExpansion=true`、`coneMaxRadius=20000`、`coneExpansionDuration=4500`、`coneCameraFollow=true`。`syncOutputs()` 更新最大半径和时长文本。`syncEffect()` 在扩散开关打开时把相同的 `expansion` 对象传给 `update()`，从而让目标尺寸或时长变化按核心语义重新开始。

- [ ] **Step 5: 添加操作区样式并更新生成代码**

在 `apps/demo/src/styles.css` 增加：

```css
.cone-expansion-actions {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.cone-expansion-actions button {
  min-height: 32px;
  color: #e6f7f9;
  background: rgb(94 232 255 / 10%);
  border: 1px solid rgb(94 232 255 / 32%);
  border-radius: 6px;
  cursor: pointer;
}

.cone-expansion-actions output {
  grid-column: 1 / -1;
  color: #e8ff72;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 12px;
}
```

`getScanConeCode()` 在扩散开关打开时生成：

```ts
expansion: {
  maxRadiusMeters: 20000,
  durationMs: 4500,
  cameraFollow: true,
  onFrame(frame) {
    console.log(frame.radiusMeters)
  },
},
```

并在示例末尾加入 `cone.restartExpansion()` 和现有 `cone.destroy()`。

- [ ] **Step 6: 运行 Demo 测试、类型检查和构建**

Run:

```bash
pnpm --filter geo-effect-kit-demo test
pnpm --filter geo-effect-kit-demo typecheck
pnpm --filter geo-effect-kit-demo build
```

Expected: 全部退出码为 `0`；Vite 只允许现有 Cesium 资源和大 chunk 警告。

- [ ] **Step 7: 提交 Demo**

```bash
git add apps/demo/index.html apps/demo/src/main.ts apps/demo/src/styles.css apps/demo/test/tianditu-config.test.mjs
git commit -m "完善扫描锥扩散演示"
```

### Task 5: 同步开源文档、知识清单和变更记录

**Files:**
- Modify: `knowledge/effects/scan-cone.effect.json`
- Modify: `knowledge/docs/scan-cone.md`
- Modify: `README.zh-CN.md`
- Modify: `README.md`
- Modify: `packages/core/README.md`
- Modify: `CHANGELOG.md`
- Test: `mcp-server/test/knowledge.test.mjs`

- [ ] **Step 1: 先写 MCP 清单失败测试**

在 `mcp-server/test/knowledge.test.mjs` 的 Scan Cone 断言中增加：

```js
assert.equal(cone.options.properties.expansion.type, 'object')
assert.match(cone.options.properties.expansion.description, /smooth|expansion/i)
assert.ok(cone.methods.includes('restartExpansion'))
assert.ok(cone.methods.includes('cancelExpansion'))
assert.match(cone.examples.minimal.code, /maxRadiusMeters/)
assert.match(cone.examples.minimal.code, /onFrame/)
```

- [ ] **Step 2: 运行 MCP 测试并确认知识清单缺少扩散字段**

Run:

```bash
pnpm --filter @ztgkzhaohao/geo-effect-kit-mcp test
```

Expected: FAIL，`cone.options.properties.expansion` 为 `undefined`。

- [ ] **Step 3: 更新机器可读清单**

在 `knowledge/effects/scan-cone.effect.json` 增加 `expansion`：

```json
"expansion": {
  "type": "object",
  "required": false,
  "description": "Optional smooth radius-and-length expansion with frame callbacks and opt-in smart camera following.",
  "properties": {
    "maxRadiusMeters": { "type": "number", "required": true, "minimum": 1 },
    "durationMs": { "type": "number", "default": 4500, "minimum": 100, "maximum": 120000 },
    "cameraFollow": { "type": "boolean", "default": false },
    "autoStart": { "type": "boolean", "default": true },
    "onFrame": { "type": "function", "required": false, "description": "Called once per rendered expansion frame with current progress, radius, length, and elapsed time." },
    "onComplete": { "type": "function", "required": false, "description": "Called once after the final onFrame notification." }
  }
}
```

把 `restartExpansion`、`cancelExpansion`、`isExpanding`、`getExpansionState` 加入 `methods`，最小示例加入 `maxRadiusMeters`、`cameraFollow` 和 `onFrame`。

- [ ] **Step 4: 更新中文、英文和包级文档**

在 `knowledge/docs/scan-cone.md` 新增“平滑扩散”章节，包含以下可复制示例：

```ts
const cone = createScanConeEffect(viewer, {
  center: { longitude: 116.85, latitude: 40.37 },
  type: 'radar',
  lengthMeters: 8_000,
  expansion: {
    maxRadiusMeters: 20_000,
    durationMs: 4_500,
    cameraFollow: true,
    onFrame(frame) {
      console.log('当前扫描半径', frame.radiusMeters)
    },
  },
})
```

明确说明静态模式不变、`cameraFollow` 默认关闭、回调不适合做重计算、资源渲染由使用方负责。README 中把 Scan Cone 描述更新为支持 opt-in smooth expansion；`CHANGELOG.md` 顶部增加 `Unreleased` 小节。

- [ ] **Step 5: 运行知识测试和完整工作区验证**

Run:

```bash
pnpm --filter @ztgkzhaohao/geo-effect-kit-mcp test
pnpm typecheck
pnpm test
pnpm build
pnpm pack:check
```

Expected: 全部退出码为 `0`；构建可出现仓库既有 Cesium 静态资源或 chunk 体积警告，但不得出现新错误。

- [ ] **Step 6: 启动 Demo 做人工验收**

Run:

```bash
pnpm --filter geo-effect-kit-demo dev
```

在浏览器打开终端输出的本地地址，选择 `scan-cone`，逐项验证：

1. 半径与高度同时从中心平滑增长到配置值。
2. 旋转材质在扩散时持续运行。
3. 实时半径、高度、进度和状态与画面一致。
4. 最大范围超出视野时镜头平滑拉远；当前视野足够时不移动。
5. 鼠标拖动或滚轮会停止镜头跟随，但扩散继续。
6. Restart、Cancel、隐藏、显示和关闭扩散开关行为符合设计。

Expected: 六项全部通过，无明显闪烁、尺寸跳变或镜头抢回控制。

- [ ] **Step 7: 提交文档和最终验证结果**

```bash
git add knowledge/effects/scan-cone.effect.json knowledge/docs/scan-cone.md README.zh-CN.md README.md packages/core/README.md CHANGELOG.md mcp-server/test/knowledge.test.mjs
git commit -m "补充扫描锥扩散文档"
```
