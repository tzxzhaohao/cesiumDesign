import test from 'node:test'
import assert from 'node:assert/strict'
import { Cartographic, Math as CesiumMath } from 'cesium'

import {
  createFlyLineEffect,
  expandFlyLineRoutes,
  normalizeFlyLineOptions,
  sampleFlyLineArc,
  sampleFlyLineTrail,
  shouldRebuildFlyLine,
} from '../dist/index.js'

globalThis.HTMLCanvasElement ??= class HTMLCanvasElement {}
globalThis.HTMLImageElement ??= class HTMLImageElement {}
globalThis.ImageBitmap ??= class ImageBitmap {}
globalThis.OffscreenCanvas ??= class OffscreenCanvas {}

const lines = [
  {
    from: { longitude: 116.285, latitude: 39.87 },
    to: { longitude: 116.391, latitude: 39.907 },
  },
  {
    from: { longitude: 116.505, latitude: 39.9 },
    to: { longitude: 116.391, latitude: 39.907 },
  },
]

test('normalizeFlyLineOptions fills single-arc defaults', () => {
  const options = normalizeFlyLineOptions({ lines })

  assert.deepEqual(options.lines, lines)
  assert.equal(options.mode, 'single-arc')
  assert.equal(options.color, '#5ee8ff')
  assert.equal(options.speed, 1)
  assert.equal(options.width, 4)
  assert.equal(options.arcHeight, 38000)
  assert.equal(options.trailLength, 0.28)
  assert.equal(options.pulseCount, 3)
  assert.equal(options.glowPower, 0.26)
  assert.equal(options.taperPower, 0.62)
  assert.equal(options.showEndpoints, true)
  assert.equal(options.visible, true)
})

test('normalizeFlyLineOptions clamps unsafe values and unsupported mode', () => {
  const options = normalizeFlyLineOptions({
    lines: [{ from: lines[0].from, to: lines[0].from }],
    mode: 'unknown',
    speed: -1,
    width: -10,
    arcHeight: -30,
    trailLength: 9,
    pulseCount: 99,
    glowPower: 9,
    taperPower: -2,
  })

  assert.equal(options.mode, 'single-arc')
  assert.equal(options.speed, 0.05)
  assert.equal(options.width, 1)
  assert.equal(options.arcHeight, 0)
  assert.equal(options.trailLength, 0.95)
  assert.equal(options.pulseCount, 12)
  assert.equal(options.glowPower, 1)
  assert.equal(options.taperPower, 0)
})

test('normalizeFlyLineOptions accepts all fly-line modes', () => {
  assert.equal(normalizeFlyLineOptions({ lines, mode: 'single-arc' }).mode, 'single-arc')
  assert.equal(normalizeFlyLineOptions({ lines, mode: 'hub-spoke' }).mode, 'hub-spoke')
  assert.equal(normalizeFlyLineOptions({ lines, mode: 'bidirectional' }).mode, 'bidirectional')
})

test('expandFlyLineRoutes mirrors routes for bidirectional mode', () => {
  assert.equal(expandFlyLineRoutes(lines, 'single-arc').length, 2)
  assert.equal(expandFlyLineRoutes(lines, 'hub-spoke').length, 2)

  const expanded = expandFlyLineRoutes(lines, 'bidirectional')
  assert.equal(expanded.length, 4)
  assert.deepEqual(expanded[0], lines[0])
  assert.deepEqual(expanded[1], { from: lines[0].to, to: lines[0].from })
})

test('sampleFlyLineArc creates a raised arc between endpoints', () => {
  const arc = sampleFlyLineArc(lines[0], 30000, 9)

  assert.equal(arc.length, 9)
  assert.deepEqual(arc[0], lines[0].from)
  assert.deepEqual(arc.at(-1), lines[0].to)
  assert.ok(Math.max(...arc.map((position) => position.height ?? 0)) > 25000)
})

test('sampleFlyLineTrail follows the raised arc without wrapping an open route', () => {
  const originalPerformance = globalThis.performance
  globalThis.performance = { now: () => 0 }

  try {
    const trail = sampleFlyLineTrail(lines[0], 30000, 0, 0.5, 6)

    assert.ok(trail.length >= 1)
    assert.deepEqual(trail[0], lines[0].from)
    assert.ok(trail.every((position) => position.longitude <= lines[0].to.longitude))
    assert.ok(Math.max(...sampleFlyLineTrail(lines[0], 30000, 0.45, 0.5, 6).map((position) => position.height ?? 0)) > 0)
  } finally {
    globalThis.performance = originalPerformance
  }
})

test('shouldRebuildFlyLine only rebuilds entities for route geometry, mode, or endpoint changes', () => {
  const previous = normalizeFlyLineOptions({ lines })
  const styleOnly = normalizeFlyLineOptions({
    ...previous,
    color: '#ff58c8',
    speed: 2,
    width: 8,
  })
  const modeChanged = normalizeFlyLineOptions({
    ...previous,
    mode: 'bidirectional',
  })
  const arcChanged = normalizeFlyLineOptions({
    ...previous,
    arcHeight: 50000,
  })

  assert.equal(shouldRebuildFlyLine(previous, styleOnly), false)
  assert.equal(shouldRebuildFlyLine(previous, modeChanged), true)
  assert.equal(shouldRebuildFlyLine(previous, arcChanged), true)
})

test('FlyLineEffect renders base arcs, animated trails, endpoints, and bidirectional routes', () => {
  const viewer = createMockViewer()
  const effect = createFlyLineEffect(viewer, {
    lines: [lines[0]],
    mode: 'bidirectional',
    pulseCount: 2,
    showEndpoints: true,
  })

  assert.equal(viewer.dataSources.addCount, 1)
  const dataSource = viewer.dataSources.sources[0]
  assert.equal(dataSource.entities.values.length, 8)
  assert.equal(viewer.scene.requestRenderCount, 1)

  const firstArc = dataSource.entities.values[0]
  const arcDegrees = toDegrees(getPropertyValue(firstArc.polyline.positions))
  assert.ok(Math.max(...arcDegrees.map((position) => position.height)) > 30000)

  effect.update({
    color: '#ff58c8',
    speed: 2,
    width: 8,
    trailLength: 0.4,
    pulseCount: 4,
    showEndpoints: false,
  })

  assert.equal(dataSource.entities.removeAllCount, 0)
  assert.equal(dataSource.entities.values.length, 10)
  assert.equal(firstArc.polyline.width.getValue(), 8)

  effect.update({ mode: 'hub-spoke' })
  assert.equal(dataSource.entities.removeAllCount, 1)
  assert.equal(dataSource.entities.values.length, 5)

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

function toDegrees(cartesians) {
  return cartesians.map((position) => {
    const cartographic = Cartographic.fromCartesian(position)
    return {
      longitude: Math.round(CesiumMath.toDegrees(cartographic.longitude) * 1000) / 1000,
      latitude: Math.round(CesiumMath.toDegrees(cartographic.latitude) * 1000) / 1000,
      height: Math.round(cartographic.height),
    }
  })
}

function getPropertyValue(value) {
  return typeof value?.getValue === 'function' ? value.getValue() : value
}

function createMockViewer() {
  return {
    scene: {
      requestRenderCount: 0,
      requestRender() {
        this.requestRenderCount += 1
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
