import test from 'node:test'
import assert from 'node:assert/strict'
import { Cartesian3, Matrix4 } from 'cesium'

import {
  buildScanConeMaterialSource,
  createScanConeEffect,
  createScanConeMaterialProperty,
  normalizeScanConeOptions,
  shouldRebuildScanCone,
} from '../dist/index.js'
import {
  normalizeScanConeExpansionOptions,
  sampleScanConeExpansionFrame,
} from '../dist/scan-cone-expansion.js'

globalThis.HTMLCanvasElement ??= class HTMLCanvasElement {}
globalThis.HTMLImageElement ??= class HTMLImageElement {}
globalThis.ImageBitmap ??= class ImageBitmap {}
globalThis.OffscreenCanvas ??= class OffscreenCanvas {}

const center = { longitude: 116.391, latitude: 39.907 }

test('normalizeScanConeExpansionOptions applies safe defaults and preserves callbacks', () => {
  const onFrame = () => {}
  const onComplete = () => {}
  const defaults = normalizeScanConeExpansionOptions({ maxRadiusMeters: Number.NaN })
  const options = normalizeScanConeExpansionOptions({
    maxRadiusMeters: -1,
    durationMs: Number.POSITIVE_INFINITY,
    cameraFollow: true,
    autoStart: false,
    onFrame,
    onComplete,
  })

  assert.equal(defaults.maxRadiusMeters, 1)
  assert.equal(defaults.durationMs, 4500)
  assert.equal(defaults.cameraFollow, false)
  assert.equal(defaults.autoStart, true)
  assert.equal(options.maxRadiusMeters, 1)
  assert.equal(options.durationMs, 4500)
  assert.equal(options.cameraFollow, true)
  assert.equal(options.autoStart, false)
  assert.equal(options.onFrame, onFrame)
  assert.equal(options.onComplete, onComplete)
  assert.equal(normalizeScanConeExpansionOptions({ maxRadiusMeters: 2, durationMs: 1 }).durationMs, 100)
  assert.equal(normalizeScanConeExpansionOptions({ maxRadiusMeters: 2, durationMs: 120001 }).durationMs, 120000)
  assert.equal(normalizeScanConeExpansionOptions({ maxRadiusMeters: 0.001 }).maxRadiusMeters, 1)
})

test('normalizeScanConeOptions only normalizes expansion when configured', () => {
  assert.equal(normalizeScanConeOptions({ center }).expansion, undefined)
  assert.deepEqual(normalizeScanConeOptions({
    center,
    expansion: { maxRadiusMeters: 120, durationMs: 700 },
  }).expansion, {
    maxRadiusMeters: 120,
    durationMs: 700,
    cameraFollow: false,
    autoStart: true,
  })
})

test('sampleScanConeExpansionFrame shares cubic easing between radius and length', () => {
  const options = normalizeScanConeExpansionOptions({
    maxRadiusMeters: 200,
    durationMs: 1000,
  })

  assert.deepEqual(sampleScanConeExpansionFrame(options, 600, -1), {
    progress: 0,
    radiusMeters: 0,
    lengthMeters: 0,
    elapsedMs: 0,
  })
  assert.deepEqual(sampleScanConeExpansionFrame(options, 600, 500), {
    progress: 0.5,
    radiusMeters: 100,
    lengthMeters: 300,
    elapsedMs: 500,
  })
  assert.deepEqual(sampleScanConeExpansionFrame(options, 600, 250), {
    progress: 0.0625,
    radiusMeters: 12.5,
    lengthMeters: 37.5,
    elapsedMs: 250,
  })
  assert.deepEqual(sampleScanConeExpansionFrame(options, 600, 750), {
    progress: 0.9375,
    radiusMeters: 187.5,
    lengthMeters: 562.5,
    elapsedMs: 750,
  })
  assert.deepEqual(sampleScanConeExpansionFrame(options, 600, Number.POSITIVE_INFINITY), {
    progress: 1,
    radiusMeters: 200,
    lengthMeters: 600,
    elapsedMs: 1000,
  })
  for (const invalidLength of [Number.NaN, -1, 0.001]) {
    assert.equal(sampleScanConeExpansionFrame(options, invalidLength, 1000).lengthMeters, 1)
  }
})

test('normalizeScanConeOptions fills rotating searchlight defaults', () => {
  const options = normalizeScanConeOptions({
    center,
  })

  assert.deepEqual(options.center, center)
  assert.equal(options.type, 'searchlight')
  assert.equal(options.color, '#7cf7ff')
  assert.equal(options.radiusMeters, 1800)
  assert.equal(options.lengthMeters, 4800)
  assert.equal(options.speed, 1)
  assert.equal(options.opacity, 0.62)
  assert.equal(options.aperture, 34)
  assert.equal(options.heading, 0)
  assert.equal(options.pitch, 0)
  assert.equal(options.showOrigin, true)
  assert.equal(options.visible, true)
})

test('normalizeScanConeOptions clamps unsafe values and unsupported type', () => {
  const options = normalizeScanConeOptions({
    center,
    type: 'unknown',
    radiusMeters: -1,
    lengthMeters: -1,
    speed: -3,
    opacity: 9,
    aperture: 999,
  })

  assert.equal(options.type, 'searchlight')
  assert.equal(options.radiusMeters, 1)
  assert.equal(options.lengthMeters, 1)
  assert.equal(options.speed, 0.05)
  assert.equal(options.opacity, 1)
  assert.equal(options.aperture, 120)
})

test('buildScanConeMaterialSource includes rotating cone style branches', () => {
  const source = buildScanConeMaterialSource()

  assert.match(source, /GeoScanConeMaterial/)
  assert.match(source, /timeSeconds/)
  assert.match(source, /max\(timeSeconds,\s*czm_frameNumber \* 0\.016667\)/)
  assert.match(source, /coneType/)
  assert.match(source, /sweepBand/)
  assert.match(source, /radialGrid/)
  assert.match(source, /searchlightCone/)
  assert.match(source, /radarCone/)
  assert.match(source, /cameraCone/)
  assert.match(source, /droneCone/)
  assert.match(source, /alarmCone/)
})

test('normalizeScanConeOptions accepts each scan cone type', () => {
  assert.equal(normalizeScanConeOptions({ center, type: 'searchlight' }).type, 'searchlight')
  assert.equal(normalizeScanConeOptions({ center, type: 'radar' }).type, 'radar')
  assert.equal(normalizeScanConeOptions({ center, type: 'camera' }).type, 'camera')
  assert.equal(normalizeScanConeOptions({ center, type: 'drone' }).type, 'drone')
  assert.equal(normalizeScanConeOptions({ center, type: 'alarm' }).type, 'alarm')
})

test('createScanConeMaterialProperty exposes dynamic material uniforms for moving cone entities', () => {
  const material = createScanConeMaterialProperty({
    center,
    type: 'alarm',
    color: '#ff315a',
    speed: 2.4,
    opacity: 0.5,
    aperture: 42,
  })

  assert.equal(material.uniforms.color.toCssHexString(), '#ff315a')
  assert.equal(material.uniforms.coneType, 5)
  assert.equal(material.uniforms.speed, 2.4)
  assert.equal(material.uniforms.timeSeconds, -1)
  assert.equal(material.uniforms.opacity, 0.5)
  assert.equal(material.uniforms.aperture, 42)
})

test('shouldRebuildScanCone only rebuilds entities for cone geometry changes', () => {
  const previous = normalizeScanConeOptions({ center })
  const styleOnly = normalizeScanConeOptions({
    ...previous,
    color: '#ff315a',
    type: 'alarm',
    speed: 3,
  })
  const radiusChanged = normalizeScanConeOptions({
    ...previous,
    radiusMeters: 2400,
  })
  const centerChanged = normalizeScanConeOptions({
    ...previous,
    center: { longitude: 117, latitude: 39 },
  })

  assert.equal(shouldRebuildScanCone(previous, styleOnly), false)
  assert.equal(shouldRebuildScanCone(previous, radiusChanged), true)
  assert.equal(shouldRebuildScanCone(previous, centerChanged), false)
})

test('ScanConeEffect updates material and orientation without rebuilding geometry', () => {
  const viewer = createMockViewer()
  const effect = createScanConeEffect(viewer, {
    center,
    radiusMeters: 2000,
    lengthMeters: 5000,
  })

  assert.equal(viewer.dataSources.addCount, 1)
  const dataSource = viewer.dataSources.sources[0]
  assert.equal(dataSource.entities.values.length, 2)
  assert.equal(viewer.scene.requestRenderCount, 1)

  const cone = dataSource.entities.values[0]
  effect.update({
    color: '#ff315a',
    type: 'alarm',
    speed: 2.6,
    opacity: 0.5,
    heading: 45,
    pitch: -12,
    showOrigin: false,
  })

  assert.equal(dataSource.entities.values[0], cone)
  assert.equal(dataSource.entities.values.length, 1)
  assert.equal(cone.cylinder.material.uniforms.color.toCssHexString(), '#ff315a')
  assert.equal(cone.cylinder.material.uniforms.coneType, 5)
  assert.equal(cone.cylinder.material.uniforms.speed, 2.6)

  effect.update({ center: { longitude: 116.43, latitude: 39.94 } })
  assert.equal(dataSource.entities.values[0], cone)
  assert.equal(dataSource.entities.removeAllCount, 0)

  effect.update({ radiusMeters: 2400 })
  assert.equal(dataSource.entities.removeAllCount, 1)
  assert.equal(dataSource.entities.values.length, 1)

  effect.hide()
  assert.equal(effect.isVisible(), false)
  assert.equal(dataSource.show, false)

  effect.show()
  assert.equal(effect.isVisible(), true)
  assert.equal(dataSource.show, true)

  effect.flyTo()
  assert.equal(viewer.camera.flyToBoundingSphereCount, 1)

  effect.destroy()
  effect.destroy()
  assert.equal(effect.isDestroyed(), true)
  assert.equal(viewer.dataSources.removeCount, 1)
})

test('ScanConeEffect expansion reuses one primitive and samples exact start, middle, and final frames', () => {
  const raf = installRafHarness()
  try {
    const frames = []
    const completions = []
    const callbackScales = []
    let primitive
    const viewer = createMockViewer()
    const effect = createScanConeEffect(viewer, {
      center,
      lengthMeters: 600,
      expansion: {
        maxRadiusMeters: 200,
        durationMs: 1000,
        onFrame: state => {
          frames.push(state)
          callbackScales.push(getModelScale(primitive.modelMatrix))
        },
        onComplete: state => completions.push(state),
      },
    })

    assert.equal(viewer.scene.primitives.addCount, 1)
    assert.equal(viewer.scene.primitives.values.length, 1)
    assert.equal(viewer.dataSources.sources[0].entities.values.length, 1)
    primitive = viewer.scene.primitives.values[0]
    const geometry = primitive.geometryInstances.geometry
    assert.equal(primitive.appearance.material.uniforms.timeSeconds, -1)

    raf.step(100)
    assert.deepEqual(effect.getExpansionState(), {
      status: 'running',
      progress: 0,
      radiusMeters: 0,
      lengthMeters: 0,
      elapsedMs: 0,
    })
    assertModelScale(primitive.modelMatrix, [0.000001, 0.000001, 0.000001])

    raf.step(600)
    assert.deepEqual(effect.getExpansionState(), {
      status: 'running',
      progress: 0.5,
      radiusMeters: 100,
      lengthMeters: 300,
      elapsedMs: 500,
    })
    assertModelScale(primitive.modelMatrix, [100, 100, 300])

    raf.step(1100)
    assert.deepEqual(effect.getExpansionState(), {
      status: 'completed',
      progress: 1,
      radiusMeters: 200,
      lengthMeters: 600,
      elapsedMs: 1000,
    })
    assertModelScale(primitive.modelMatrix, [200, 200, 600])
    assertModelBottomAtCenter(primitive.modelMatrix, center)
    assert.equal(primitive.geometryInstances.geometry, geometry)
    assert.equal(viewer.scene.primitives.addCount, 1)
    assert.equal(viewer.scene.primitives.removeCount, 0)
    assert.deepEqual(frames.map(frame => [frame.status, frame.progress]), [
      ['running', 0],
      ['running', 0.5],
      ['completed', 1],
    ])
    assert.deepEqual(callbackScales, [
      [0.000001, 0.000001, 0.000001],
      [100, 100, 300],
      [200, 200, 600],
    ])
    assert.equal(completions.length, 1)
    assert.deepEqual(completions[0], frames.at(-1))

    const completedMatrix = Matrix4.clone(primitive.modelMatrix)
    raf.step(1600)
    assert.equal(completions.length, 1)
    assert.equal(frames.length, 3)
    assert.equal(primitive.appearance.material.uniforms.timeSeconds, 1.6)
    assert.equal(Matrix4.equals(primitive.modelMatrix, completedMatrix), false)
  } finally {
    raf.restore()
  }
})

test('ScanConeEffect expansion supports idle, pause, cancel, restart, and copied state', () => {
  const raf = installRafHarness()
  try {
    let completed = 0
    const viewer = createMockViewer()
    const effect = createScanConeEffect(viewer, {
      center,
      lengthMeters: 600,
      expansion: {
        maxRadiusMeters: 200,
        durationMs: 1000,
        autoStart: false,
        onComplete: () => { completed += 1 },
      },
    })
    const dataSource = viewer.dataSources.sources[0]
    const primitive = viewer.scene.primitives.values[0]

    assert.equal(effect.isExpanding(), false)
    assert.equal(effect.getExpansionState().status, 'idle')
    assertModelScale(primitive.modelMatrix, [0.000001, 0.000001, 0.000001])
    raf.step(100)
    assert.equal(effect.getExpansionState().progress, 0)

    effect.restartExpansion()
    assert.equal(effect.isExpanding(), true)
    raf.step(200)
    raf.step(700)
    assert.equal(effect.getExpansionState().progress, 0.5)
    const copiedState = effect.getExpansionState()
    copiedState.status = 'completed'
    copiedState.progress = 1
    assert.equal(effect.getExpansionState().status, 'running')
    assert.equal(effect.getExpansionState().progress, 0.5)

    effect.hide()
    assert.equal(effect.getExpansionState().status, 'paused')
    assert.equal(effect.isExpanding(), false)
    assert.equal(dataSource.show, false)
    assert.equal(primitive.show, false)
    raf.step(5000)
    assert.equal(effect.getExpansionState().progress, 0.5)

    effect.show()
    assert.equal(effect.getExpansionState().status, 'running')
    assert.equal(primitive.show, true)
    raf.step(6000)
    assert.equal(effect.getExpansionState().progress, 0.5)
    effect.cancelExpansion()
    assert.equal(effect.getExpansionState().status, 'cancelled')
    assert.equal(completed, 0)
    effect.hide()
    effect.show()
    assert.equal(effect.getExpansionState().status, 'cancelled')

    effect.restartExpansion()
    assert.equal(effect.getExpansionState().progress, 0)
    raf.step(7000)
    raf.step(8000)
    assert.equal(effect.getExpansionState().status, 'completed')
    assert.equal(completed, 1)
  } finally {
    raf.restore()
  }
})

test('ScanConeEffect expansion ignores backward timestamps and completes callbacks in order once', () => {
  const raf = installRafHarness()
  try {
    const events = []
    const effect = createScanConeEffect(createMockViewer(), {
      center,
      lengthMeters: 600,
      expansion: {
        maxRadiusMeters: 200,
        durationMs: 1000,
        onFrame: state => events.push(`frame:${state.status}:${state.elapsedMs}`),
        onComplete: state => events.push(`complete:${state.status}:${state.elapsedMs}`),
      },
    })

    raf.step(100)
    raf.step(600)
    raf.step(400)
    assert.equal(effect.getExpansionState().elapsedMs, 500)
    raf.step(1100)
    raf.step(1600)
    assert.deepEqual(events, [
      'frame:running:0',
      'frame:running:500',
      'frame:running:500',
      'frame:completed:1000',
      'complete:completed:1000',
    ])
  } finally {
    raf.restore()
  }
})

test('ScanConeEffect keeps one animation frame when onFrame hides and shows the effect', () => {
  const raf = installRafHarness()
  try {
    let effect
    let toggled = false
    effect = createScanConeEffect(createMockViewer(), {
      center,
      expansion: {
        maxRadiusMeters: 200,
        durationMs: 1000,
        onFrame: () => {
          if (toggled) return
          toggled = true
          effect.hide()
          effect.show()
        },
      },
    })

    assert.equal(raf.pendingCount(), 1)
    raf.step(100)
    assert.equal(raf.pendingCount(), 1)
  } finally {
    raf.restore()
  }
})

test('ScanConeEffect does not schedule another animation frame when onFrame destroys the effect', () => {
  const raf = installRafHarness()
  try {
    let effect
    effect = createScanConeEffect(createMockViewer(), {
      center,
      expansion: {
        maxRadiusMeters: 200,
        durationMs: 1000,
        onFrame: () => effect.destroy(),
      },
    })

    raf.step(100)
    assert.equal(effect.isDestroyed(), true)
    assert.equal(raf.pendingCount(), 0)
  } finally {
    raf.restore()
  }
})

test('ScanConeEffect completes both runs when final onFrame restarts expansion', () => {
  const raf = installRafHarness()
  try {
    let effect
    let completedFrames = 0
    let completions = 0
    effect = createScanConeEffect(createMockViewer(), {
      center,
      expansion: {
        maxRadiusMeters: 200,
        durationMs: 1000,
        onFrame: state => {
          if (state.status !== 'completed') return
          completedFrames += 1
          if (completedFrames === 1) effect.restartExpansion()
        },
        onComplete: () => { completions += 1 },
      },
    })

    raf.step(0)
    raf.step(1000)
    assert.equal(completions, 1)
    assert.equal(effect.getExpansionState().status, 'running')
    raf.step(2000)
    raf.step(3000)
    assert.equal(completedFrames, 2)
    assert.equal(completions, 2)
    assert.equal(effect.getExpansionState().status, 'completed')
  } finally {
    raf.restore()
  }
})

test('ScanConeEffect getOptions returns an isolated expansion snapshot', () => {
  const effect = createScanConeEffect(createMockViewer(), {
    center,
    expansion: { maxRadiusMeters: 200, durationMs: 1000 },
  })

  const snapshot = effect.getOptions()
  snapshot.expansion.maxRadiusMeters = 900
  snapshot.expansion.durationMs = 9000

  assert.equal(effect.getOptions().expansion.maxRadiusMeters, 200)
  assert.equal(effect.getOptions().expansion.durationMs, 1000)
})

test('ScanConeEffect mutates one model matrix once per frame while preserving a pitched cone pivot', () => {
  const raf = installRafHarness()
  try {
    const viewer = createMockViewer()
    createScanConeEffect(viewer, {
      center,
      heading: 37,
      pitch: -23,
      lengthMeters: 600,
      expansion: { maxRadiusMeters: 200, durationMs: 1000 },
    })
    const primitive = viewer.scene.primitives.values[0]
    const originalMatrix = primitive.modelMatrix
    const initialMatrix = Matrix4.clone(originalMatrix)
    let currentMatrix = originalMatrix
    let matrixReplacements = 0
    Object.defineProperty(primitive, 'modelMatrix', {
      configurable: true,
      get: () => currentMatrix,
      set: value => {
        matrixReplacements += 1
        currentMatrix = value
      },
    })

    raf.step(100)
    raf.step(600)

    assert.equal(primitive.modelMatrix, originalMatrix)
    assert.equal(matrixReplacements, 0)
    assert.equal(Matrix4.equals(primitive.modelMatrix, initialMatrix), false)
    assertModelScale(primitive.modelMatrix, [100, 100, 300])
    assertModelBottomAtCenter(primitive.modelMatrix, center)
    assert.equal(viewer.scene.primitives.addCount, 1)
  } finally {
    raf.restore()
  }
})

test('ScanConeEffect updates an expansion primitive in place, restarts dimensional changes, and cleans mode switches', () => {
  const raf = installRafHarness()
  try {
    const viewer = createMockViewer()
    const effect = createScanConeEffect(viewer, {
      center,
      lengthMeters: 600,
      expansion: { maxRadiusMeters: 200, durationMs: 1000 },
    })
    const primitive = viewer.scene.primitives.values[0]
    const material = primitive.appearance.material
    raf.step(100)
    raf.step(600)

    effect.update({
      center: { longitude: 116.43, latitude: 39.94 },
      color: '#ff315a',
      type: 'alarm',
      opacity: 0.4,
      speed: 2.5,
      aperture: 48,
      heading: 35,
      pitch: -18,
      showOrigin: false,
    })
    assert.equal(viewer.scene.primitives.values[0], primitive)
    assert.equal(viewer.scene.primitives.addCount, 1)
    assert.equal(viewer.scene.primitives.removeCount, 0)
    assert.equal(material.uniforms.color.toCssHexString(), '#ff315a')
    assert.equal(material.uniforms.coneType, 5)
    assert.equal(material.uniforms.opacity, 0.4)
    assert.equal(material.uniforms.speed, 2.5)
    assert.equal(material.uniforms.aperture, 48)
    assert.equal(effect.getExpansionState().progress, 0.5)

    effect.update({ lengthMeters: 800 })
    assert.equal(effect.getExpansionState().status, 'running')
    assert.equal(effect.getExpansionState().progress, 0)
    assert.equal(viewer.scene.primitives.values[0], primitive)

    effect.update({
      expansion: {
        ...effect.getOptions().expansion,
        maxRadiusMeters: 300,
        durationMs: 2000,
      },
    })
    assert.equal(effect.getExpansionState().progress, 0)
    assert.equal(viewer.scene.primitives.values[0], primitive)
    assert.equal(viewer.scene.primitives.addCount, 1)

    effect.update({ expansion: undefined, showOrigin: true })
    assert.equal(viewer.scene.primitives.removeCount, 1)
    assert.equal(viewer.scene.primitives.values.length, 0)
    assert.equal(viewer.dataSources.sources[0].entities.values.length, 2)
    assert.equal(effect.getExpansionState().status, 'idle')

    effect.update({
      expansion: { maxRadiusMeters: 250, durationMs: 1200, autoStart: false },
    })
    assert.equal(viewer.scene.primitives.addCount, 2)
    assert.equal(viewer.scene.primitives.values.length, 1)
    assert.equal(effect.getExpansionState().status, 'idle')

    effect.destroy()
    effect.destroy()
    effect.update({ color: '#ffffff' })
    effect.restartExpansion()
    effect.cancelExpansion()
    effect.show()
    effect.hide()
    assert.equal(viewer.scene.primitives.removeCount, 2)
    assert.equal(viewer.scene.primitives.values.length, 0)
    assert.equal(viewer.dataSources.removeCount, 1)
    assert.equal(raf.pendingCount(), 0)
  } finally {
    raf.restore()
  }
})

function createMockViewer() {
  return {
    scene: {
      requestRenderCount: 0,
      requestRender() {
        this.requestRenderCount += 1
      },
      primitives: {
        addCount: 0,
        removeCount: 0,
        values: [],
        add(primitive) {
          this.addCount += 1
          this.values.push(primitive)
          return primitive
        },
        remove(primitive) {
          this.removeCount += 1
          const index = this.values.indexOf(primitive)
          if (index >= 0) this.values.splice(index, 1)
          return index >= 0
        },
      },
    },
    dataSources: {
      addCount: 0,
      removeCount: 0,
      sources: [],
      add(dataSource) {
        this.addCount += 1
        const removeAll = dataSource.entities.removeAll.bind(dataSource.entities)
        dataSource.entities.removeAllCount = 0
        dataSource.entities.removeAll = () => {
          dataSource.entities.removeAllCount += 1
          return removeAll()
        }
        this.sources.push(dataSource)
        return dataSource
      },
      remove() {
        this.removeCount += 1
        return true
      },
    },
    camera: {
      flyToBoundingSphereCount: 0,
      flyToBoundingSphere() {
        this.flyToBoundingSphereCount += 1
      },
    },
  }
}

function installRafHarness() {
  const previousWindow = globalThis.window
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
    step(timestamp) {
      const pending = [...callbacks.entries()]
      callbacks.clear()
      for (const [, callback] of pending) callback(timestamp)
    },
    restore() {
      callbacks.clear()
      if (previousWindow === undefined) delete globalThis.window
      else globalThis.window = previousWindow
    },
    pendingCount() {
      return callbacks.size
    },
  }
}

function assertModelScale(modelMatrix, expected) {
  const actual = getModelScale(modelMatrix)
  assert.ok(Math.abs(actual[0] - expected[0]) < 1e-7, `expected x scale ${expected[0]}, got ${actual[0]}`)
  assert.ok(Math.abs(actual[1] - expected[1]) < 1e-7, `expected y scale ${expected[1]}, got ${actual[1]}`)
  assert.ok(Math.abs(actual[2] - expected[2]) < 1e-7, `expected z scale ${expected[2]}, got ${actual[2]}`)
}

function getModelScale(modelMatrix) {
  const scale = Matrix4.getScale(modelMatrix, new Cartesian3())
  return [scale.x, scale.y, scale.z].map(value => Math.round(value * 1000000) / 1000000)
}

function assertModelBottomAtCenter(modelMatrix, position) {
  const actual = Matrix4.multiplyByPoint(modelMatrix, new Cartesian3(0, 0, -0.5), new Cartesian3())
  const expected = Cartesian3.fromDegrees(position.longitude, position.latitude, position.height ?? 0)
  assert.ok(Cartesian3.distance(actual, expected) < 1e-6)
}
