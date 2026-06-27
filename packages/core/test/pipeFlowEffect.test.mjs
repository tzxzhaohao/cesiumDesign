import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createPipeFlowEffect,
  normalizePipeFlowOptions,
  shouldRebuildPipeFlow,
} from '../dist/index.js'

globalThis.HTMLCanvasElement ??= class HTMLCanvasElement {}
globalThis.HTMLImageElement ??= class HTMLImageElement {}
globalThis.ImageBitmap ??= class ImageBitmap {}
globalThis.OffscreenCanvas ??= class OffscreenCanvas {}

const route = [
  { longitude: 116.285, latitude: 39.87 },
  { longitude: 116.335, latitude: 39.92 },
  { longitude: 116.394, latitude: 39.91 },
  { longitude: 116.452, latitude: 39.95 },
  { longitude: 116.505, latitude: 39.9 },
]

test('normalizePipeFlowOptions fills transparent water-pipe defaults', () => {
  const options = normalizePipeFlowOptions({
    positions: route,
  })

  assert.deepEqual(options.positions, route)
  assert.equal(options.color, '#45dfff')
  assert.equal(options.speed, 1)
  assert.equal(options.width, 12)
  assert.equal(options.pipeOpacity, 0.32)
  assert.equal(options.waterOpacity, 0.86)
  assert.equal(options.cornerRadius, 0.18)
  assert.equal(options.bubbleDensity, 6)
  assert.equal(options.clampToGround, true)
  assert.equal(options.visible, true)
})

test('normalizePipeFlowOptions clamps unsafe values', () => {
  const options = normalizePipeFlowOptions({
    positions: [route[0]],
    speed: -1,
    width: -10,
    pipeOpacity: 9,
    waterOpacity: -4,
    cornerRadius: 9,
    bubbleDensity: 99,
  })

  assert.equal(options.positions.length, 2)
  assert.deepEqual(options.positions[0], route[0])
  assert.deepEqual(options.positions[1], route[0])
  assert.equal(options.speed, 0.05)
  assert.equal(options.width, 1)
  assert.equal(options.pipeOpacity, 1)
  assert.equal(options.waterOpacity, 0)
  assert.equal(options.cornerRadius, 0.45)
  assert.equal(options.bubbleDensity, 16)
})

test('shouldRebuildPipeFlow only rebuilds for geometry-affecting changes', () => {
  const previous = normalizePipeFlowOptions({ positions: route })
  const styleOnly = normalizePipeFlowOptions({
    ...previous,
    color: '#ffffff',
    speed: 2.4,
    width: 18,
    pipeOpacity: 0.2,
    waterOpacity: 0.92,
  })
  const rounded = normalizePipeFlowOptions({ ...previous, cornerRadius: 0.3 })
  const bubbleChanged = normalizePipeFlowOptions({ ...previous, bubbleDensity: 10 })
  const routeChanged = normalizePipeFlowOptions({ ...previous, positions: route.slice(0, 4) })

  assert.equal(shouldRebuildPipeFlow(previous, styleOnly), false)
  assert.equal(shouldRebuildPipeFlow(previous, rounded), true)
  assert.equal(shouldRebuildPipeFlow(previous, bubbleChanged), true)
  assert.equal(shouldRebuildPipeFlow(previous, routeChanged), true)
})

test('PipeFlowEffect renders a transparent pipe, water core, pressure waves, and bubbles', () => {
  const viewer = createMockViewer()
  const effect = createPipeFlowEffect(viewer, {
    positions: route,
    width: 14,
    bubbleDensity: 4,
  })

  assert.equal(viewer.dataSources.addCount, 1)
  const dataSource = viewer.dataSources.sources[0]
  assert.equal(dataSource.entities.values.length, 9)
  assert.equal(viewer.scene.requestRenderCount, 1)

  const [pipeShell, pipeHighlight, waterCore] = dataSource.entities.values
  assert.equal(pipeShell.id, 'geo-effect-kit-pipe-flow-shell')
  assert.equal(pipeShell.polyline.width.getValue(), 28)
  assert.equal(pipeHighlight.id, 'geo-effect-kit-pipe-flow-highlight')
  assert.equal(pipeHighlight.polyline.width.getValue(), 16.8)
  assert.equal(waterCore.id, 'geo-effect-kit-pipe-flow-water-core')
  assert.equal(waterCore.polyline.width.getValue(), 11.2)

  effect.update({
    color: '#66ffdd',
    speed: 2,
    width: 18,
    pipeOpacity: 0.24,
    waterOpacity: 0.9,
  })
  assert.equal(dataSource.entities.values[0], pipeShell)
  assert.equal(pipeShell.polyline.width.getValue(), 36)
  assert.equal(waterCore.polyline.width.getValue(), 14.4)

  effect.update({ bubbleDensity: 7 })
  assert.equal(dataSource.entities.removeAllCount, 1)
  assert.equal(dataSource.entities.values.length, 12)

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
