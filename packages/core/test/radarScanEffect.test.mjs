import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildRadarScanMaterialSource,
  createRadarScanEffect,
  normalizeRadarScanOptions,
  shouldRebuildRadarScan,
} from '../dist/index.js'

globalThis.HTMLCanvasElement ??= class HTMLCanvasElement {}
globalThis.HTMLImageElement ??= class HTMLImageElement {}
globalThis.ImageBitmap ??= class ImageBitmap {}
globalThis.OffscreenCanvas ??= class OffscreenCanvas {}

test('normalizeRadarScanOptions fills stable radar scan defaults', () => {
  const options = normalizeRadarScanOptions({
    center: { longitude: 116.391, latitude: 39.907 },
    radiusMeters: 18_000,
  })

  assert.deepEqual(options.center, { longitude: 116.391, latitude: 39.907 })
  assert.equal(options.radiusMeters, 18_000)
  assert.equal(options.type, 'classic')
  assert.equal(options.color, '#36d6ff')
  assert.equal(options.scanDurationMs, 3600)
  assert.equal(options.opacity, 0.85)
  assert.equal(options.rings, true)
  assert.equal(options.showCenter, false)
  assert.equal(options.visible, true)
})

test('normalizeRadarScanOptions clamps unsafe numeric values', () => {
  const options = normalizeRadarScanOptions({
    center: { longitude: 120, latitude: 30 },
    radiusMeters: -100,
    type: 'unknown',
    scanDurationMs: 0,
    opacity: 12,
  })

  assert.equal(options.radiusMeters, 1)
  assert.equal(options.type, 'classic')
  assert.equal(options.scanDurationMs, 1)
  assert.equal(options.opacity, 1)
})

test('buildRadarScanMaterialSource exposes radar-only style uniforms without ripple spread code', () => {
  const source = buildRadarScanMaterialSource({ scanDurationMs: 7200 })

  assert.match(source, /GeoRadarScanMaterial/)
  assert.match(source, /radarType/)
  assert.match(source, /sectorScan/)
  assert.match(source, /pulseScan/)
  assert.match(source, /gridScan/)
  assert.match(source, /scanDurationMs/)
  assert.doesNotMatch(source, /effectType/)
  assert.doesNotMatch(source, /ringCount/)
  assert.doesNotMatch(source, /rippleDurationMs/)
  assert.doesNotMatch(source, /waterRipple/)
  assert.doesNotMatch(source, /energyRipple/)
  assert.doesNotMatch(source, /hybridRipple/)
  assert.match(source, /czm_frameNumber/)
  assert.match(source, /ringsEnabled/)
  assert.match(source, /scanTail/)
})

test('normalizeRadarScanOptions accepts each radar scan type', () => {
  const base = {
    center: { longitude: 116, latitude: 39 },
    radiusMeters: 10_000,
  }

  assert.equal(normalizeRadarScanOptions({ ...base, type: 'classic' }).type, 'classic')
  assert.equal(normalizeRadarScanOptions({ ...base, type: 'sector' }).type, 'sector')
  assert.equal(normalizeRadarScanOptions({ ...base, type: 'pulse' }).type, 'pulse')
  assert.equal(normalizeRadarScanOptions({ ...base, type: 'grid' }).type, 'grid')
})

test('shouldRebuildRadarScan only rebuilds primitive for geometry changes', () => {
  const previous = normalizeRadarScanOptions({
    center: { longitude: 116, latitude: 39 },
    radiusMeters: 10_000,
  })
  const colorOnly = normalizeRadarScanOptions({
    ...previous,
    color: '#ff5635',
  })
  const radiusChanged = normalizeRadarScanOptions({
    ...previous,
    radiusMeters: 12_000,
  })
  const centerChanged = normalizeRadarScanOptions({
    ...previous,
    center: { longitude: 117, latitude: 39 },
  })

  assert.equal(shouldRebuildRadarScan(previous, colorOnly), false)
  assert.equal(shouldRebuildRadarScan(previous, radiusChanged), true)
  assert.equal(shouldRebuildRadarScan(previous, centerChanged), true)
})

test('RadarScanEffect updates, hides, shows, flies, and destroys through the viewer adapter', () => {
  const viewer = createMockViewer()
  const effect = createRadarScanEffect(viewer, {
    center: { longitude: 116, latitude: 39 },
    radiusMeters: 10_000,
  })

  assert.equal(viewer.scene.primitives.items.length, 1)
  assert.equal(viewer.scene.requestRenderCount, 1)

  effect.update({ color: '#ff5635', type: 'sector', scanDurationMs: 1800 })
  assert.equal(viewer.scene.primitives.items.length, 1)
  assert.equal(viewer.scene.requestRenderCount, 2)
  assert.equal(viewer.scene.primitives.items[0]?.appearance.material.uniforms.color.toCssHexString(), '#ff5635')
  assert.equal(viewer.scene.primitives.items[0]?.appearance.material.uniforms.radarType, 2)
  assert.equal(viewer.scene.primitives.items[0]?.appearance.material.uniforms.scanDurationMs, 1800)

  effect.update({ radiusMeters: 14_000 })
  assert.equal(viewer.scene.primitives.removeCount, 1)
  assert.equal(viewer.scene.primitives.items.length, 1)

  effect.hide()
  assert.equal(effect.isVisible(), false)
  assert.equal(viewer.scene.primitives.items[0]?.show, false)

  effect.show()
  assert.equal(effect.isVisible(), true)
  assert.equal(viewer.scene.primitives.items[0]?.show, true)

  effect.flyTo()
  assert.equal(viewer.camera.flyToBoundingSphereCount, 1)

  effect.destroy()
  effect.destroy()
  assert.equal(effect.isDestroyed(), true)
  assert.equal(viewer.scene.primitives.removeCount, 2)
  assert.equal(viewer.dataSources.removeCount, 1)
})

test('RadarScanEffect applies non-geometric material updates without rebuilding primitive', () => {
  const viewer = createMockViewer()
  const effect = createRadarScanEffect(viewer, {
    center: { longitude: 116, latitude: 39 },
    radiusMeters: 10_000,
    type: 'classic',
    color: '#36d6ff',
    scanDurationMs: 3600,
    rings: true,
  })
  const primitive = viewer.scene.primitives.items[0]

  effect.update({
    color: '#ff5635',
    type: 'grid',
    opacity: 0.4,
    rings: false,
    scanDurationMs: 1200,
  })

  assert.equal(viewer.scene.primitives.items[0], primitive)
  assert.equal(viewer.scene.primitives.removeCount, 0)
  assert.equal(primitive.appearance.material.uniforms.color.toCssHexString(), '#ff5635')
  assert.equal(primitive.appearance.material.uniforms.radarType, 4)
  assert.equal(primitive.appearance.material.uniforms.opacity, 0.4)
  assert.equal(primitive.appearance.material.uniforms.ringsEnabled, 0)
  assert.equal(primitive.appearance.material.uniforms.scanDurationMs, 1200)
  assert.equal(primitive.appearance.material.uniforms.effectType, undefined)
  assert.equal(primitive.appearance.material.uniforms.ringCount, undefined)
  assert.equal(primitive.appearance.material.uniforms.rippleDurationMs, undefined)
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
      flyToBoundingSphereCount: 0,
      flyToBoundingSphere() {
        this.flyToBoundingSphereCount += 1
      },
    },
  }
}
