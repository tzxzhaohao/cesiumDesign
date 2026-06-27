import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
  createFireBillboardEffect,
  normalizeFireBillboardOptions,
  shouldRebuildFireBillboard,
} from '../dist/index.js'

globalThis.HTMLCanvasElement ??= class HTMLCanvasElement {}
globalThis.HTMLImageElement ??= class HTMLImageElement {}
globalThis.ImageBitmap ??= class ImageBitmap {}
globalThis.OffscreenCanvas ??= class OffscreenCanvas {}

const fireGif = 'data:image/gif;base64,R0lGODlhAQABAPAAAP8AAP///ywAAAAAAQABAAACAkQBADs='
const firePoints = [
  { id: 'fire-1', longitude: 116.391, latitude: 39.907, gif: fireGif },
  { id: 'fire-2', longitude: 116.452, latitude: 39.95, height: 120, gif: '/fire-warning.gif' },
]

test('normalizeFireBillboardOptions requires user-provided points with longitude latitude and gif', () => {
  const options = normalizeFireBillboardOptions({
    points: [firePoints[0]],
  })

  assert.deepEqual(options.points, [{ ...firePoints[0], height: 0 }])
  assert.equal(options.scale, 1)
  assert.equal('width' in options, false)
  assert.equal('height' in options, false)
  assert.equal(options.frameIntervalMs, 80)
  assert.equal(options.clampToGround, true)
  assert.equal(options.disableDepthTestDistance, Number.POSITIVE_INFINITY)
  assert.equal(options.visible, true)
})

test('normalizeFireBillboardOptions clamps unsafe style values and filters points without gif', () => {
  const options = normalizeFireBillboardOptions({
    points: [
      { longitude: Number.NaN, latitude: Number.NaN, gif: fireGif },
      { longitude: 116.4, latitude: 39.9, gif: '' },
      { longitude: 116.5, latitude: 40.1, height: -10, gif: '/custom.gif' },
    ],
    scale: 99,
    frameIntervalMs: 2,
    disableDepthTestDistance: -1,
  })

  assert.equal(options.points.length, 2)
  assert.deepEqual(options.points[0], { longitude: 0, latitude: 0, gif: fireGif, height: 0 })
  assert.deepEqual(options.points[1], { longitude: 116.5, latitude: 40.1, height: -10, gif: '/custom.gif' })
  assert.equal(options.scale, 8)
  assert.equal(options.frameIntervalMs, 16)
  assert.equal(options.disableDepthTestDistance, 0)
})

test('shouldRebuildFireBillboard only rebuilds billboards for point list or per-point gif changes', () => {
  const previous = normalizeFireBillboardOptions({ points: firePoints })
  const styleOnly = normalizeFireBillboardOptions({
    ...previous,
    scale: 1.8,
    frameIntervalMs: 120,
  })
  const gifChanged = normalizeFireBillboardOptions({
    ...previous,
    points: [{ ...firePoints[0], gif: '/next-fire.gif' }],
  })

  assert.equal(shouldRebuildFireBillboard(previous, styleOnly), false)
  assert.equal(shouldRebuildFireBillboard(previous, gifChanged), true)
})

test('FireBillboardEffect renders user gif billboards, updates, flies, hides, shows, and destroys', () => {
  const viewer = createMockViewer()
  const effect = createFireBillboardEffect(viewer, {
    points: firePoints,
    scale: 1.25,
  })

  assert.equal(viewer.dataSources.addCount, 1)
  const dataSource = viewer.dataSources.sources[0]
  assert.equal(dataSource.entities.values.length, 2)
  assert.equal(dataSource.entities.values[0].billboard.image.getValue(), fireGif)
  assert.equal(dataSource.entities.values[0].billboard.scale.getValue(), 1.25)
  assert.equal(dataSource.entities.values[0].billboard.width, undefined)
  assert.equal(dataSource.entities.values[0].billboard.height, undefined)
  assert.equal(viewer.scene.requestRenderCount, 1)

  const firstEntity = dataSource.entities.values[0]
  effect.update({ scale: 1.6, frameIntervalMs: 120 })

  assert.equal(dataSource.entities.values[0], firstEntity)
  assert.equal(dataSource.entities.values[0].billboard.scale.getValue(), 1.6)
  assert.equal(dataSource.entities.values[0].billboard.width, undefined)
  assert.equal(dataSource.entities.values[0].billboard.height, undefined)
  assert.equal(dataSource.entities.removeAllCount, 0)

  effect.update({ points: [firePoints[0]] })
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

test('FireBillboardEffect animates ready GIF points without waiting for a slow remote GIF', async () => {
  const gifBytes = await readFile(new URL('../../../apps/demo/public/fire-red-billboard.gif', import.meta.url))
  const restoreBrowserApis = installMockGifBrowserApis(gifBytes)
  const viewer = createMockViewer()
  const effect = createFireBillboardEffect(viewer, {
    points: [
      { id: 'ready-fire', longitude: 116.391, latitude: 39.907, gif: '/ready-fire.gif' },
      { id: 'slow-fire', longitude: 116.452, latitude: 39.95, gif: '/slow-fire.gif' },
    ],
    frameIntervalMs: 16,
  })

  try {
    const dataSource = viewer.dataSources.sources[0]
    await sleep(80)

    assert.match(dataSource.entities.values[0].billboard.image.getValue(), /^data:image\/png;frame=/)
    assert.equal(dataSource.entities.values[1].billboard.image.getValue(), '/slow-fire.gif')
    assert.ok(viewer.scene.requestRenderCount > 1)
  } finally {
    effect.destroy()
    restoreBrowserApis()
  }
})

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function installMockGifBrowserApis(gifBytes) {
  const previousFetch = globalThis.fetch
  const previousDocument = globalThis.document
  let frameId = 0

  globalThis.fetch = (url) => {
    if (url === '/slow-fire.gif') return new Promise(() => undefined)

    return Promise.resolve({
      ok: true,
      arrayBuffer: () => Promise.resolve(gifBytes.buffer.slice(gifBytes.byteOffset, gifBytes.byteOffset + gifBytes.byteLength)),
    })
  }

  globalThis.document = {
    createElement(tagName) {
      assert.equal(tagName, 'canvas')
      return {
        width: 0,
        height: 0,
        getContext() {
          return {
            createImageData(width, height) {
              return { data: new Uint8ClampedArray(width * height * 4) }
            },
            putImageData() {},
            clearRect() {},
            drawImage() {},
            getImageData(_left, _top, width, height) {
              return { data: new Uint8ClampedArray(width * height * 4) }
            },
          }
        },
        toDataURL() {
          frameId += 1
          return `data:image/png;frame=${frameId}`
        },
      }
    },
  }

  return () => {
    globalThis.fetch = previousFetch
    globalThis.document = previousDocument
  }
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
