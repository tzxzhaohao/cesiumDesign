import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildShieldDomeMaterialSource,
  createShieldDomeEffect,
  normalizeShieldDomeOptions,
  shouldRebuildShieldDome,
} from '../dist/index.js'

globalThis.HTMLCanvasElement ??= class HTMLCanvasElement {}
globalThis.HTMLImageElement ??= class HTMLImageElement {}
globalThis.ImageBitmap ??= class ImageBitmap {}
globalThis.OffscreenCanvas ??= class OffscreenCanvas {}

const center = { longitude: 116.391, latitude: 39.907 }

test('normalizeShieldDomeOptions fills hex shield defaults', () => {
  const options = normalizeShieldDomeOptions({
    center,
    radiusMeters: 8000,
  })

  assert.deepEqual(options.center, center)
  assert.equal(options.radiusMeters, 8000)
  assert.equal(options.type, 'hex')
  assert.equal(options.color, '#57f7ff')
  assert.equal(options.speed, 1)
  assert.equal(options.opacity, 0.56)
  assert.equal(options.gridDensity, 14)
  assert.equal(options.pulseStrength, 0.72)
  assert.equal(options.ring, true)
  assert.equal(options.visible, true)
})

test('normalizeShieldDomeOptions clamps unsafe values and unsupported type', () => {
  const options = normalizeShieldDomeOptions({
    center,
    radiusMeters: -1,
    type: 'unknown',
    speed: -2,
    opacity: 9,
    gridDensity: -2,
    pulseStrength: 9,
  })

  assert.equal(options.radiusMeters, 1)
  assert.equal(options.type, 'hex')
  assert.equal(options.speed, 0.05)
  assert.equal(options.opacity, 1)
  assert.equal(options.gridDensity, 2)
  assert.equal(options.pulseStrength, 1)
})

test('buildShieldDomeMaterialSource includes dome style branches', () => {
  const source = buildShieldDomeMaterialSource()

  assert.match(source, /GeoShieldDomeMaterial/)
  assert.match(source, /domeType/)
  assert.match(source, /gridLine/)
  assert.match(source, /scanLine/)
  assert.match(source, /energyPulse/)
  assert.match(source, /hexDome/)
  assert.match(source, /plasmaDome/)
  assert.match(source, /matrixDome/)
  assert.match(source, /aegisDome/)
  assert.match(source, /stormDome/)
})

test('normalizeShieldDomeOptions accepts each shield dome type', () => {
  assert.equal(normalizeShieldDomeOptions({ center, radiusMeters: 8000, type: 'hex' }).type, 'hex')
  assert.equal(normalizeShieldDomeOptions({ center, radiusMeters: 8000, type: 'plasma' }).type, 'plasma')
  assert.equal(normalizeShieldDomeOptions({ center, radiusMeters: 8000, type: 'matrix' }).type, 'matrix')
  assert.equal(normalizeShieldDomeOptions({ center, radiusMeters: 8000, type: 'aegis' }).type, 'aegis')
  assert.equal(normalizeShieldDomeOptions({ center, radiusMeters: 8000, type: 'storm' }).type, 'storm')
})

test('shouldRebuildShieldDome only rebuilds entities for dome geometry changes', () => {
  const previous = normalizeShieldDomeOptions({ center, radiusMeters: 8000 })
  const styleOnly = normalizeShieldDomeOptions({
    ...previous,
    color: '#b9ff4a',
    type: 'matrix',
    speed: 2,
  })
  const radiusChanged = normalizeShieldDomeOptions({
    ...previous,
    radiusMeters: 9000,
  })
  const centerChanged = normalizeShieldDomeOptions({
    ...previous,
    center: { longitude: 117, latitude: 39 },
  })

  assert.equal(shouldRebuildShieldDome(previous, styleOnly), false)
  assert.equal(shouldRebuildShieldDome(previous, radiusChanged), true)
  assert.equal(shouldRebuildShieldDome(previous, centerChanged), true)
})

test('ShieldDomeEffect updates material without rebuilding dome geometry', () => {
  const viewer = createMockViewer()
  const effect = createShieldDomeEffect(viewer, {
    center,
    radiusMeters: 8000,
  })

  assert.equal(viewer.dataSources.addCount, 1)
  const dataSource = viewer.dataSources.sources[0]
  assert.equal(dataSource.entities.values.length, 2)
  assert.equal(viewer.scene.requestRenderCount, 1)

  const dome = dataSource.entities.values[0]
  const ring = dataSource.entities.values[1]
  assert.equal(typeof ring.ellipse.material.getType, 'function')
  effect.update({
    color: '#b9ff4a',
    type: 'matrix',
    speed: 2,
    opacity: 0.42,
    gridDensity: 20,
    pulseStrength: 0.9,
    ring: false,
  })

  assert.equal(dataSource.entities.values[0], dome)
  assert.equal(dataSource.entities.values.length, 1)
  assert.equal(dome.ellipsoid.material.uniforms.color.toCssHexString(), '#b9ff4a')
  assert.equal(dome.ellipsoid.material.uniforms.domeType, 3)
  assert.equal(dome.ellipsoid.material.uniforms.gridDensity, 20)
  assert.equal(dome.ellipsoid.material.uniforms.pulseStrength, 0.9)

  effect.update({ ring: true, color: '#57f7ff' })
  const restoredRing = dataSource.entities.values[1]
  assert.equal(typeof restoredRing.ellipse.material.getType, 'function')

  effect.update({ radiusMeters: 9000 })
  assert.equal(dataSource.entities.removeAllCount, 1)
  assert.equal(dataSource.entities.values.length, 2)
  assert.equal(typeof dataSource.entities.values[1].ellipse.material.getType, 'function')

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
