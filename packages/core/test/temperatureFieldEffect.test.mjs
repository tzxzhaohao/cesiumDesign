import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildTemperatureFieldMaterialSource,
  createTemperatureFieldEffect,
  normalizeTemperatureFieldOptions,
  shouldRebuildTemperatureField,
} from '../dist/index.js'

globalThis.HTMLCanvasElement ??= class HTMLCanvasElement {}
globalThis.HTMLImageElement ??= class HTMLImageElement {}
globalThis.ImageBitmap ??= class ImageBitmap {}
globalThis.OffscreenCanvas ??= class OffscreenCanvas {}

const fireHotspotPolygon = {
  outer: [
    [116.1, 39.72],
    [116.74, 39.76],
    [116.69, 40.14],
    [116.18, 40.08],
  ],
  holes: [],
}

const fireHotspotStops = [
  { value: 0, color: '#57c7ff', label: '低风险' },
  { value: 20, color: '#6ddb73', label: '较低' },
  { value: 40, color: '#ffd047', label: '中风险' },
  { value: 60, color: '#ff8a2d', label: '较高' },
  { value: 80, color: '#ff3e2f', label: '高风险' },
]

const fireHotspotSamples = [
  { longitude: 116.22, latitude: 39.82, value: 18, type: 'low' },
  { longitude: 116.36, latitude: 39.94, value: 48, type: 'warm' },
  { longitude: 116.58, latitude: 40.04, value: 86, type: 'critical' },
]

test('normalizeTemperatureFieldOptions accepts FireHotspot risk-surface shaped polygons and stops', () => {
  const options = normalizeTemperatureFieldOptions({
    polygons: [fireHotspotPolygon],
    seed: 9528,
    opacity: 0.76,
    stops: fireHotspotStops,
    samples: fireHotspotSamples,
  })

  assert.equal(options.polygons.length, 1)
  assert.deepEqual(options.polygons[0]?.outer, fireHotspotPolygon.outer)
  assert.deepEqual(options.polygons[0]?.holes, [])
  assert.equal(options.seed, 9528)
  assert.equal(options.opacity, 0.76)
  assert.equal(options.visible, true)
  assert.equal(options.outline, true)
  assert.equal(options.contourLines, true)
  assert.equal(options.stops.length, 5)
  assert.equal(options.stops[4]?.color, '#ff3e2f')
  assert.equal(options.samples.length, 3)
  assert.deepEqual(options.samples[1], fireHotspotSamples[1])
  assert.equal(options.bounds?.west, 116.1)
  assert.equal(options.bounds?.south, 39.72)
  assert.equal(options.bounds?.east, 116.74)
  assert.equal(options.bounds?.north, 40.14)
})

test('normalizeTemperatureFieldOptions clamps unsafe values and keeps a stable five-color ramp', () => {
  const options = normalizeTemperatureFieldOptions({
    polygons: [fireHotspotPolygon],
    seed: Number.NaN,
    opacity: 8,
    contourStrength: -4,
    noiseStrength: 12,
    stops: [
      { value: 100, color: '#ff0000' },
      { value: 0, color: '#00ff00' },
    ],
  })

  assert.equal(options.seed, 0)
  assert.equal(options.opacity, 1)
  assert.equal(options.contourStrength, 0)
  assert.equal(options.noiseStrength, 1)
  assert.equal(options.stops.length, 5)
  assert.equal(options.stops[0]?.value, 0)
  assert.equal(options.stops[4]?.value, 100)
})

test('buildTemperatureFieldMaterialSource is static shader code without frame-time animation', () => {
  const source = buildTemperatureFieldMaterialSource()

  assert.match(source, /GeoTemperatureFieldMaterial/)
  assert.match(source, /temperatureRamp/)
  assert.match(source, /riskField/)
  assert.match(source, /sampleField/)
  assert.match(source, /sampleCount/)
  assert.match(source, /sample0/)
  assert.match(source, /sample15/)
  assert.match(source, /hasSamples/)
  assert.match(source, /randomTemperature/)
  assert.match(source, /sampleTemperature/)
  assert.match(source, /randomField/)
  assert.match(source, /hotSpot0/)
  assert.match(source, /randomCenter0/)
  assert.match(source, /randomCenter5/)
  assert.match(source, /contourStrength/)
  assert.match(source, /czm_material czm_getMaterial/)
  assert.doesNotMatch(source, /vec4\s+sample\b/)
  assert.doesNotMatch(source, /\bsample\.[xyzw]/)
  assert.doesNotMatch(source, /value\s*=\s*mix\(value,\s*sampleField/)
  assert.doesNotMatch(source, /value\s*\+=\s*hotSpot0/)
  assert.doesNotMatch(source, /float gradient/)
  assert.doesNotMatch(source, /czm_frameNumber/)
  assert.doesNotMatch(source, /requestAnimationFrame/)
})

test('shouldRebuildTemperatureField only rebuilds for geometry changes', () => {
  const previous = normalizeTemperatureFieldOptions({
    polygons: [fireHotspotPolygon],
    stops: fireHotspotStops,
    samples: fireHotspotSamples,
  })
  const colorOnly = normalizeTemperatureFieldOptions({
    ...previous,
    stops: fireHotspotStops.map((stop) => (stop.value === 80 ? { ...stop, color: '#ff5a32' } : stop)),
  })
  const opacityOnly = normalizeTemperatureFieldOptions({
    ...previous,
    opacity: 0.5,
  })
  const polygonChanged = normalizeTemperatureFieldOptions({
    ...previous,
    polygons: [
      {
        outer: [
          [116.1, 39.72],
          [116.8, 39.76],
          [116.69, 40.14],
        ],
        holes: [],
      },
    ],
  })
  const samplesChanged = normalizeTemperatureFieldOptions({
    ...previous,
    samples: [{ longitude: 116.5, latitude: 39.92, value: 72, type: 'hot' }],
  })

  assert.equal(shouldRebuildTemperatureField(previous, colorOnly), false)
  assert.equal(shouldRebuildTemperatureField(previous, opacityOnly), false)
  assert.equal(shouldRebuildTemperatureField(previous, samplesChanged), false)
  assert.equal(shouldRebuildTemperatureField(previous, polygonChanged), true)
})

test('TemperatureFieldEffect updates material uniforms, flies to bounds, hides, shows, and destroys', () => {
  const viewer = createMockViewer()
  const effect = createTemperatureFieldEffect(viewer, {
    polygons: [fireHotspotPolygon],
    seed: 9528,
    stops: fireHotspotStops,
    samples: fireHotspotSamples,
  })

  assert.equal(viewer.scene.primitives.items.length, 1)
  assert.equal(viewer.dataSources.addCount, 1)
  assert.equal(viewer.scene.requestRenderCount, 1)

  const primitive = viewer.scene.primitives.items[0]
  effect.update({ opacity: 0.42, contourStrength: 0.33, stops: fireHotspotStops })

  assert.equal(viewer.scene.primitives.items[0], primitive)
  assert.equal(viewer.scene.primitives.removeCount, 0)
  assert.equal(primitive.appearance.material.uniforms.opacity, 0.42)
  assert.equal(primitive.appearance.material.uniforms.contourStrength, 0.33)
  assert.equal(primitive.appearance.material.uniforms.sampleCount, 3)
  assert.equal(primitive.appearance.material.uniforms.sample2.z, 0.86)
  assert.equal(Math.round(primitive.appearance.material.uniforms.sample0.x * 100) / 100, 0.19)

  effect.hide()
  assert.equal(effect.isVisible(), false)
  assert.equal(viewer.scene.primitives.items[0]?.show, false)

  effect.show()
  assert.equal(effect.isVisible(), true)
  assert.equal(viewer.scene.primitives.items[0]?.show, true)

  effect.flyTo()
  assert.equal(viewer.camera.flyToCount, 1)

  effect.destroy()
  effect.destroy()
  assert.equal(effect.isDestroyed(), true)
  assert.equal(viewer.scene.primitives.removeCount, 1)
  assert.equal(viewer.dataSources.removeCount, 1)
})

function createMockViewer() {
  return {
    scene: {
      requestRenderCount: 0,
      primitives: {
        items: [],
        removeCount: 0,
        add(primitive) {
          this.items.push(primitive)
          return primitive
        },
        remove(primitive) {
          this.removeCount += 1
          this.items = this.items.filter((item) => item !== primitive)
          return true
        },
      },
      requestRender() {
        this.requestRenderCount += 1
      },
    },
    dataSources: {
      addCount: 0,
      removeCount: 0,
      add(dataSource) {
        this.addCount += 1
        return dataSource
      },
      remove() {
        this.removeCount += 1
        return true
      },
    },
    camera: {
      flyToCount: 0,
      flyTo() {
        this.flyToCount += 1
      },
    },
  }
}
