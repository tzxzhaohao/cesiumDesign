import test from 'node:test'
import assert from 'node:assert/strict'

import {
  MATERIAL_POLYLINE_IMAGE_PRESET_VALUES,
  MATERIAL_POLYLINE_STYLE_VALUES,
  createMaterialPolylineEffect,
  buildMaterialPolylineMaterialSource,
  normalizeMaterialPolylineOptions,
  shouldRebuildMaterialPolyline,
} from '../dist/index.js'

globalThis.HTMLCanvasElement ??= class HTMLCanvasElement {}
globalThis.HTMLImageElement ??= class HTMLImageElement {}
globalThis.ImageBitmap ??= class ImageBitmap {}
globalThis.OffscreenCanvas ??= class OffscreenCanvas {}

const route = [
  { longitude: 117.169646, latitude: 31.769171 },
  { longitude: 117.194579, latitude: 31.806466 },
  { longitude: 117.238152, latitude: 31.812394 },
]

test('normalizeMaterialPolylineOptions fills stable material polyline defaults', () => {
  const options = normalizeMaterialPolylineOptions({ positions: route })

  assert.deepEqual(options.positions, route)
  assert.equal(options.style, 'flow')
  assert.equal(options.color, '#33f7ff')
  assert.equal(options.secondaryColor, '#ffffff')
  assert.equal(options.backgroundColor, 'rgba(0, 64, 255, 0.35)')
  assert.equal(options.width, 8)
  assert.equal(options.outlineWidth, 2)
  assert.equal(options.speed, 1)
  assert.deepEqual(options.repeat, { x: 4, y: 1 })
  assert.equal(options.imagePreset, 'pulse')
  assert.equal(typeof options.image, 'string')
  assert.equal(options.arcHeight, 0)
  assert.equal(options.arcSamples, 48)
  assert.equal(options.cornerRadius, 0)
  assert.equal(options.clampToGround, true)
  assert.equal(options.visible, true)
})

test('normalizeMaterialPolylineOptions accepts each style and image preset', () => {
  assert.deepEqual(
    MATERIAL_POLYLINE_STYLE_VALUES.map((style) => normalizeMaterialPolylineOptions({ positions: route, style }).style),
    MATERIAL_POLYLINE_STYLE_VALUES,
  )
  assert.deepEqual(
    MATERIAL_POLYLINE_IMAGE_PRESET_VALUES.map(
      (imagePreset) => normalizeMaterialPolylineOptions({ positions: route, imagePreset }).imagePreset,
    ),
    MATERIAL_POLYLINE_IMAGE_PRESET_VALUES,
  )
})

test('normalizeMaterialPolylineOptions prefers custom image over preset and clamps unsafe values', () => {
  const customImage = 'data:image/png;base64,custom'
  const options = normalizeMaterialPolylineOptions({
    positions: [route[0]],
    style: 'unknown',
    imagePreset: 'small-arrow',
    image: customImage,
    width: -8,
    outlineWidth: -2,
    speed: -1,
    repeat: { x: -10, y: 999 },
    arcHeight: -120,
    arcSamples: 999,
    cornerRadius: 3,
  })

  assert.equal(options.positions.length, 2)
  assert.deepEqual(options.positions[0], route[0])
  assert.deepEqual(options.positions[1], route[0])
  assert.equal(options.style, 'flow')
  assert.equal(options.imagePreset, 'small-arrow')
  assert.equal(options.image, customImage)
  assert.equal(options.width, 1)
  assert.equal(options.outlineWidth, 0)
  assert.equal(options.speed, 0.05)
  assert.deepEqual(options.repeat, { x: 1, y: 16 })
  assert.equal(options.arcHeight, 0)
  assert.equal(options.arcSamples, 128)
  assert.equal(options.cornerRadius, 0.45)
})

test('shouldRebuildMaterialPolyline only rebuilds for geometry changes', () => {
  const previous = normalizeMaterialPolylineOptions({ positions: route })
  const styleOnly = normalizeMaterialPolylineOptions({
    ...previous,
    style: 'navigation',
    color: '#ff315a',
    speed: 2.5,
    image: 'https://example.com/custom-line.png',
  })
  const geometryChanged = normalizeMaterialPolylineOptions({
    ...previous,
    arcHeight: 20000,
  })

  assert.equal(shouldRebuildMaterialPolyline(previous, styleOnly), false)
  assert.equal(shouldRebuildMaterialPolyline(previous, geometryChanged), true)
})

test('material polyline flow shader preserves image texture color and alpha', () => {
  const source = buildMaterialPolylineMaterialSource()

  assert.match(source, /vec3 imageColor = textureColor\.rgb;/)
  assert.match(source, /float textureAlpha = textureColor\.a;/)
  assert.doesNotMatch(source, /textureTint = mix\(color\.rgb, textureColor\.rgb \* color\.rgb/)
  assert.doesNotMatch(source, /patternAlpha = max\(max\(textureColor\.a \* \(flowEnabled \+ flowColorEnabled\)/)
})

test('MaterialPolylineEffect updates style in place and rebuilds for route geometry', () => {
  const viewer = createMockViewer()
  const effect = createMaterialPolylineEffect(viewer, {
    positions: route,
    style: 'flow',
    imagePreset: 'arrow-blue',
  })

  assert.equal(viewer.dataSources.addCount, 1)
  const dataSource = viewer.dataSources.sources[0]
  assert.equal(dataSource.entities.values.length, 1)
  assert.equal(viewer.scene.requestRenderCount, 1)

  const routeEntity = dataSource.entities.values[0]
  const material = routeEntity.polyline.material
  assert.equal(material.uniforms.image, normalizeMaterialPolylineOptions({ positions: route, imagePreset: 'arrow-blue' }).image)

  effect.update({
    style: 'navigation',
    color: '#ff315a',
    speed: 2,
    width: 12,
    image: 'https://example.com/custom-arrow.png',
  })

  assert.equal(dataSource.entities.values[0], routeEntity)
  assert.equal(dataSource.entities.removeAllCount, 0)
  assert.equal(routeEntity.polyline.width.getValue(), 12)
  assert.equal(material.uniforms.image, 'https://example.com/custom-arrow.png')

  effect.update({ imagePreset: 'gradient' })
  assert.equal(dataSource.entities.values[0], routeEntity)
  assert.equal(material.uniforms.image, normalizeMaterialPolylineOptions({ positions: route, imagePreset: 'gradient' }).image)

  effect.update({ positions: route.slice(0, 2) })
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
