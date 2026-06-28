import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildScanConeMaterialSource,
  createScanConeEffect,
  createScanConeMaterialProperty,
  normalizeScanConeOptions,
  shouldRebuildScanCone,
} from '../dist/index.js'

globalThis.HTMLCanvasElement ??= class HTMLCanvasElement {}
globalThis.HTMLImageElement ??= class HTMLImageElement {}
globalThis.ImageBitmap ??= class ImageBitmap {}
globalThis.OffscreenCanvas ??= class OffscreenCanvas {}

const center = { longitude: 116.391, latitude: 39.907 }

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
