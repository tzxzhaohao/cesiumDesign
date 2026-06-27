import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildLightWallMaterialSource,
  createLightWallEffect,
  normalizeLightWallOptions,
  shouldRebuildLightWall,
} from '../dist/index.js'

globalThis.HTMLCanvasElement ??= class HTMLCanvasElement {}
globalThis.HTMLImageElement ??= class HTMLImageElement {}
globalThis.ImageBitmap ??= class ImageBitmap {}
globalThis.OffscreenCanvas ??= class OffscreenCanvas {}

const boundary = [
  { longitude: 116.32, latitude: 39.9 },
  { longitude: 116.42, latitude: 39.9 },
  { longitude: 116.43, latitude: 39.97 },
  { longitude: 116.31, latitude: 39.96 },
]

test('normalizeLightWallOptions fills security-wall defaults', () => {
  const options = normalizeLightWallOptions({
    positions: boundary,
  })

  assert.deepEqual(options.positions, [...boundary, boundary[0]])
  assert.equal(options.type, 'security')
  assert.equal(options.color, '#27f5ff')
  assert.equal(options.height, 3200)
  assert.equal(options.speed, 1)
  assert.equal(options.opacity, 0.72)
  assert.equal(options.scanLineCount, 4)
  assert.equal(options.breathing, true)
  assert.equal(options.outline, true)
  assert.equal(options.visible, true)
})

test('normalizeLightWallOptions clamps unsafe values and unsupported type', () => {
  const options = normalizeLightWallOptions({
    positions: [boundary[0]],
    type: 'unknown',
    height: -20,
    speed: -1,
    opacity: 9,
    scanLineCount: -8,
  })

  assert.equal(options.positions.length, 2)
  assert.equal(options.type, 'security')
  assert.equal(options.height, 1)
  assert.equal(options.speed, 0.05)
  assert.equal(options.opacity, 1)
  assert.equal(options.scanLineCount, 1)
})

test('buildLightWallMaterialSource includes flowing wall style branches', () => {
  const source = buildLightWallMaterialSource()

  assert.match(source, /GeoLightWallMaterial/)
  assert.match(source, /wallType/)
  assert.match(source, /flowLine/)
  assert.match(source, /scanLine/)
  assert.match(source, /breath/)
  assert.match(source, /securityWall/)
  assert.match(source, /warningWall/)
  assert.match(source, /dataWall/)
  assert.match(source, /fenceWall/)
})

test('normalizeLightWallOptions accepts each light wall type', () => {
  assert.equal(normalizeLightWallOptions({ positions: boundary, type: 'security' }).type, 'security')
  assert.equal(normalizeLightWallOptions({ positions: boundary, type: 'warning' }).type, 'warning')
  assert.equal(normalizeLightWallOptions({ positions: boundary, type: 'data' }).type, 'data')
  assert.equal(normalizeLightWallOptions({ positions: boundary, type: 'fence' }).type, 'fence')
  assert.equal(normalizeLightWallOptions({ positions: boundary, type: 'pulse' }).type, 'pulse')
})

test('shouldRebuildLightWall only rebuilds entities for boundary or height changes', () => {
  const previous = normalizeLightWallOptions({ positions: boundary })
  const styleOnly = normalizeLightWallOptions({
    ...previous,
    color: '#ffbf3d',
    type: 'warning',
    speed: 2.4,
  })
  const heightChanged = normalizeLightWallOptions({
    ...previous,
    height: 5000,
  })
  const boundaryChanged = normalizeLightWallOptions({
    ...previous,
    positions: boundary.slice(0, 3),
  })

  assert.equal(shouldRebuildLightWall(previous, styleOnly), false)
  assert.equal(shouldRebuildLightWall(previous, heightChanged), true)
  assert.equal(shouldRebuildLightWall(previous, boundaryChanged), true)
})

test('LightWallEffect updates material without rebuilding wall geometry', () => {
  const viewer = createMockViewer()
  const effect = createLightWallEffect(viewer, {
    positions: boundary,
    height: 3600,
  })

  assert.equal(viewer.dataSources.addCount, 1)
  const dataSource = viewer.dataSources.sources[0]
  assert.equal(dataSource.entities.values.length, 2)
  assert.equal(viewer.scene.requestRenderCount, 1)

  const wall = dataSource.entities.values[0]
  effect.update({
    color: '#ffbf3d',
    type: 'warning',
    speed: 2,
    opacity: 0.48,
    scanLineCount: 8,
    breathing: false,
    outline: false,
  })

  assert.equal(dataSource.entities.values[0], wall)
  assert.equal(dataSource.entities.values.length, 1)
  assert.equal(wall.wall.material.uniforms.color.toCssHexString(), '#ffbf3d')
  assert.equal(wall.wall.material.uniforms.wallType, 2)
  assert.equal(wall.wall.material.uniforms.scanLineCount, 8)
  assert.equal(wall.wall.material.uniforms.breathing, 0)

  effect.update({ height: 4200 })
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
