import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildRippleSpreadMaterialSource,
  createRippleSpreadEffect,
  normalizeRippleSpreadOptions,
  shouldRebuildRippleSpread,
} from '../dist/index.js'

globalThis.HTMLCanvasElement ??= class HTMLCanvasElement {}
globalThis.HTMLImageElement ??= class HTMLImageElement {}
globalThis.ImageBitmap ??= class ImageBitmap {}
globalThis.OffscreenCanvas ??= class OffscreenCanvas {}

test('normalizeRippleSpreadOptions fills stable water ripple defaults', () => {
  const options = normalizeRippleSpreadOptions({
    center: { longitude: 116.391, latitude: 39.907 },
    radiusMeters: 18_000,
  })

  assert.deepEqual(options.center, { longitude: 116.391, latitude: 39.907 })
  assert.equal(options.radiusMeters, 18_000)
  assert.equal(options.type, 'water')
  assert.equal(options.color, '#62e8ff')
  assert.equal(options.ringCount, 4)
  assert.equal(options.durationMs, 3200)
  assert.equal(options.opacity, 0.82)
  assert.equal(options.showCenter, false)
  assert.equal(options.visible, true)
})

test('normalizeRippleSpreadOptions clamps unsafe numeric values and unsupported type', () => {
  const options = normalizeRippleSpreadOptions({
    center: { longitude: 120, latitude: 30 },
    radiusMeters: -100,
    type: 'unknown',
    ringCount: -4,
    durationMs: 0,
    opacity: 12,
  })

  assert.equal(options.radiusMeters, 1)
  assert.equal(options.type, 'water')
  assert.equal(options.ringCount, 1)
  assert.equal(options.durationMs, 1)
  assert.equal(options.opacity, 1)
})

test('buildRippleSpreadMaterialSource exposes dedicated ripple style, count, and speed uniforms', () => {
  const source = buildRippleSpreadMaterialSource()

  assert.match(source, /GeoRippleSpreadMaterial/)
  assert.match(source, /rippleType/)
  assert.match(source, /ringCount/)
  assert.match(source, /durationMs/)
  assert.match(source, /waterRipple/)
  assert.match(source, /energyRipple/)
  assert.match(source, /softRipple/)
  assert.doesNotMatch(source, /scanTail/)
})

test('normalizeRippleSpreadOptions accepts each ripple type', () => {
  const base = {
    center: { longitude: 116, latitude: 39 },
    radiusMeters: 10_000,
  }

  assert.equal(normalizeRippleSpreadOptions({ ...base, type: 'water' }).type, 'water')
  assert.equal(normalizeRippleSpreadOptions({ ...base, type: 'energy' }).type, 'energy')
  assert.equal(normalizeRippleSpreadOptions({ ...base, type: 'soft' }).type, 'soft')
})

test('shouldRebuildRippleSpread only rebuilds primitive for geometry changes', () => {
  const previous = normalizeRippleSpreadOptions({
    center: { longitude: 116, latitude: 39 },
    radiusMeters: 10_000,
  })
  const styleOnly = normalizeRippleSpreadOptions({
    ...previous,
    type: 'energy',
    color: '#ff4fe2',
  })
  const radiusChanged = normalizeRippleSpreadOptions({
    ...previous,
    radiusMeters: 12_000,
  })
  const centerChanged = normalizeRippleSpreadOptions({
    ...previous,
    center: { longitude: 117, latitude: 39 },
  })

  assert.equal(shouldRebuildRippleSpread(previous, styleOnly), false)
  assert.equal(shouldRebuildRippleSpread(previous, radiusChanged), true)
  assert.equal(shouldRebuildRippleSpread(previous, centerChanged), true)
})

test('RippleSpreadEffect updates material uniforms without rebuilding primitive', () => {
  const viewer = createMockViewer()
  const effect = createRippleSpreadEffect(viewer, {
    center: { longitude: 116, latitude: 39 },
    radiusMeters: 10_000,
  })
  const primitive = viewer.scene.primitives.items[0]

  effect.update({
    type: 'energy',
    color: '#ff4fe2',
    opacity: 0.4,
    ringCount: 8,
    durationMs: 900,
  })

  assert.equal(viewer.scene.primitives.items[0], primitive)
  assert.equal(viewer.scene.primitives.removeCount, 0)
  assert.equal(primitive.appearance.material.uniforms.color.toCssHexString(), '#ff4fe2')
  assert.equal(primitive.appearance.material.uniforms.opacity, 0.4)
  assert.equal(primitive.appearance.material.uniforms.rippleType, 2)
  assert.equal(primitive.appearance.material.uniforms.ringCount, 8)
  assert.equal(primitive.appearance.material.uniforms.durationMs, 900)

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
