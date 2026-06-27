import test from 'node:test'
import assert from 'node:assert/strict'
import { Cartographic, Math as CesiumMath } from 'cesium'

import {
  buildPolylineFlowSegmentWeights,
  createPolylineFlowEffect,
  normalizePolylineFlowOptions,
  shouldRebuildPolylineFlow,
} from '../dist/index.js'

globalThis.HTMLCanvasElement ??= class HTMLCanvasElement {}
globalThis.HTMLImageElement ??= class HTMLImageElement {}
globalThis.ImageBitmap ??= class ImageBitmap {}
globalThis.OffscreenCanvas ??= class OffscreenCanvas {}

const route = [
  { longitude: 116.32, latitude: 39.91 },
  { longitude: 116.36, latitude: 39.94 },
  { longitude: 116.41, latitude: 39.92 },
  { longitude: 116.46, latitude: 39.96 },
]

test('normalizePolylineFlowOptions fills dispatch-route defaults', () => {
  const options = normalizePolylineFlowOptions({
    positions: route,
  })

  assert.deepEqual(options.positions, route)
  assert.equal(options.type, 'dispatch')
  assert.equal(options.color, '#33f7ff')
  assert.equal(options.speed, 1)
  assert.equal(options.width, 6)
  assert.equal(options.trailLength, 0.32)
  assert.equal(options.pulseCount, 3)
  assert.equal(options.cornerRadius, 0)
  assert.equal(options.glowPower, 0.22)
  assert.equal(options.taperPower, 0.72)
  assert.equal(options.clampToGround, true)
  assert.equal(options.visible, true)
})

test('normalizePolylineFlowOptions clamps unsafe values and unsupported type', () => {
  const options = normalizePolylineFlowOptions({
    positions: [route[0]],
    type: 'unknown',
    speed: -3,
    width: -9,
    trailLength: 9,
    pulseCount: 99,
    cornerRadius: 9,
    glowPower: 9,
    taperPower: -4,
  })

  assert.equal(options.positions.length, 2)
  assert.deepEqual(options.positions[0], route[0])
  assert.deepEqual(options.positions[1], route[0])
  assert.equal(options.type, 'dispatch')
  assert.equal(options.speed, 0.05)
  assert.equal(options.width, 1)
  assert.equal(options.trailLength, 0.95)
  assert.equal(options.pulseCount, 12)
  assert.equal(options.cornerRadius, 0.45)
  assert.equal(options.glowPower, 1)
  assert.equal(options.taperPower, 0)
})

test('buildPolylineFlowSegmentWeights exposes several animated trail profiles', () => {
  assert.deepEqual(buildPolylineFlowSegmentWeights(4, 'dispatch', 0), [1, 0.42, 0, 0.42])
  assert.deepEqual(buildPolylineFlowSegmentWeights(4, 'migration', 0.25), [0.63, 0.88, 0.38, 0.13])
  assert.deepEqual(buildPolylineFlowSegmentWeights(4, 'attack', 0.5), [0.02, 0.6, 0.6, 0.02])
  assert.deepEqual(buildPolylineFlowSegmentWeights(4, 'comet', 0.75), [0, 0.27, 0.85, 0.56])
})

test('normalizePolylineFlowOptions accepts each polyline flow type', () => {
  assert.equal(normalizePolylineFlowOptions({ positions: route, type: 'dispatch' }).type, 'dispatch')
  assert.equal(normalizePolylineFlowOptions({ positions: route, type: 'migration' }).type, 'migration')
  assert.equal(normalizePolylineFlowOptions({ positions: route, type: 'attack' }).type, 'attack')
  assert.equal(normalizePolylineFlowOptions({ positions: route, type: 'comet' }).type, 'comet')
  assert.equal(normalizePolylineFlowOptions({ positions: route, type: 'electric' }).type, 'electric')
})

test('shouldRebuildPolylineFlow only rebuilds entities for route geometry changes', () => {
  const previous = normalizePolylineFlowOptions({ positions: route })
  const styleOnly = normalizePolylineFlowOptions({
    ...previous,
    color: '#ff315a',
    type: 'attack',
    speed: 2.8,
  })
  const routeChanged = normalizePolylineFlowOptions({
    ...previous,
    positions: [...route, { longitude: 116.5, latitude: 39.98 }],
  })

  assert.equal(shouldRebuildPolylineFlow(previous, styleOnly), false)
  assert.equal(shouldRebuildPolylineFlow(previous, routeChanged), true)
})

test('PolylineFlowEffect updates trail entities without rebuilding route geometry', () => {
  const viewer = createMockViewer()
  const effect = createPolylineFlowEffect(viewer, {
    positions: route,
    pulseCount: 4,
  })

  assert.equal(viewer.dataSources.addCount, 1)
  const dataSource = viewer.dataSources.sources[0]
  assert.equal(dataSource.entities.values.length, 5)
  assert.equal(viewer.scene.requestRenderCount, 1)

  const baseRoute = dataSource.entities.values[0]
  effect.update({
    type: 'attack',
    color: '#ff315a',
    speed: 2,
    width: 9,
    trailLength: 0.5,
    pulseCount: 6,
  })

  assert.equal(dataSource.entities.values[0], baseRoute)
  assert.equal(dataSource.entities.values.length, 7)
  assert.equal(baseRoute.polyline.width.getValue(), 9)

  effect.update({ positions: route.slice(0, 3) })
  assert.equal(dataSource.entities.removeAllCount, 1)
  assert.equal(dataSource.entities.values.length, 7)

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

test('PolylineFlowEffect does not wrap an open route trail from the end back to the start', () => {
  const originalPerformance = globalThis.performance
  globalThis.performance = { now: () => 0 }

  try {
    const viewer = createMockViewer()
    createPolylineFlowEffect(viewer, {
      positions: [
        { longitude: 0, latitude: 0 },
        { longitude: 0, latitude: 1 },
        { longitude: 1, latitude: 1 },
      ],
      trailLength: 0.5,
      pulseCount: 1,
      clampToGround: false,
    })

    const dataSource = viewer.dataSources.sources[0]
    const trail = dataSource.entities.values[1]
    const cartesianTrail = trail.polyline.positions.getValue()
    const degreesTrail = cartesianTrail.map((position) => {
      const cartographic = Cartographic.fromCartesian(position)
      return {
        longitude: CesiumMath.toDegrees(cartographic.longitude),
        latitude: CesiumMath.toDegrees(cartographic.latitude),
      }
    })

    assert.ok(degreesTrail.every((position) => position.longitude < 0.001))
    assert.ok(degreesTrail.every((position) => position.latitude < 0.001))
  } finally {
    globalThis.performance = originalPerformance
  }
})

test('PolylineFlowEffect preserves route vertices when a trail crosses a corner', () => {
  const originalPerformance = globalThis.performance
  globalThis.performance = { now: () => (0.7 / 0.22) * 1000 }

  try {
    const viewer = createMockViewer()
    createPolylineFlowEffect(viewer, {
      positions: [
        { longitude: 0, latitude: 0 },
        { longitude: 1, latitude: 0 },
        { longitude: 1, latitude: 1 },
      ],
      speed: 1,
      trailLength: 0.5,
      pulseCount: 1,
      clampToGround: false,
    })

    const dataSource = viewer.dataSources.sources[0]
    const trail = dataSource.entities.values[1]
    const cartesianTrail = trail.polyline.positions.getValue()
    const degreesTrail = cartesianTrail.map((position) => {
      const cartographic = Cartographic.fromCartesian(position)
      return {
        longitude: CesiumMath.toDegrees(cartographic.longitude),
        latitude: CesiumMath.toDegrees(cartographic.latitude),
      }
    })

    assert.ok(
      degreesTrail.some(
        (position) => Math.abs(position.longitude - 1) < 0.001 && Math.abs(position.latitude) < 0.001,
      ),
    )
  } finally {
    globalThis.performance = originalPerformance
  }
})

test('PolylineFlowEffect can round route corners for base and trail geometry', () => {
  const originalPerformance = globalThis.performance
  globalThis.performance = { now: () => (0.7 / 0.22) * 1000 }

  try {
    const viewer = createMockViewer()
    createPolylineFlowEffect(viewer, {
      positions: [
        { longitude: 0, latitude: 0 },
        { longitude: 1, latitude: 0 },
        { longitude: 1, latitude: 1 },
      ],
      speed: 1,
      trailLength: 0.7,
      pulseCount: 1,
      cornerRadius: 0.25,
      clampToGround: false,
    })

    const dataSource = viewer.dataSources.sources[0]
    const baseRoute = dataSource.entities.values[0]
    const roundedRoute = toDegrees(baseRoute.polyline.positions.getValue())
    const trail = dataSource.entities.values[1]
    const roundedTrail = toDegrees(trail.polyline.positions.getValue())

    assert.ok(roundedRoute.length > 3)
    assert.deepEqual(roundedRoute[0], { longitude: 0, latitude: 0 })
    assert.deepEqual(roundedRoute.at(-1), { longitude: 1, latitude: 1 })
    assert.ok(
      roundedRoute.every(
        (position) => !(Math.abs(position.longitude - 1) < 0.001 && Math.abs(position.latitude) < 0.001),
      ),
    )
    assert.ok(
      roundedTrail.every(
        (position) => !(Math.abs(position.longitude - 1) < 0.001 && Math.abs(position.latitude) < 0.001),
      ),
    )
  } finally {
    globalThis.performance = originalPerformance
  }
})

function toDegrees(cartesians) {
  return cartesians.map((position) => {
    const cartographic = Cartographic.fromCartesian(position)
    return {
      longitude: Math.round(CesiumMath.toDegrees(cartographic.longitude) * 1000) / 1000,
      latitude: Math.round(CesiumMath.toDegrees(cartographic.latitude) * 1000) / 1000,
    }
  })
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
