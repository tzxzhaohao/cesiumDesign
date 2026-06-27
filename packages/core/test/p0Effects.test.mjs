import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildPostProcessSource,
  buildSceneWeatherPostProcessSource,
  buildWaterSurfaceMaterialSource,
  createPostProcessEffect,
  createSceneWeatherEffect,
  createWaterSurfaceEffect,
  normalizePostProcessOptions,
  normalizeSceneWeatherOptions,
  normalizeWaterSurfaceOptions,
  shouldRebuildWaterSurface,
} from '../dist/index.js'

globalThis.HTMLCanvasElement ??= class HTMLCanvasElement {}
globalThis.HTMLImageElement ??= class HTMLImageElement {}
globalThis.ImageBitmap ??= class ImageBitmap {}
globalThis.OffscreenCanvas ??= class OffscreenCanvas {}

test('normalizeSceneWeatherOptions fills stable weather defaults and clamps unsafe values', () => {
  const defaults = normalizeSceneWeatherOptions({})
  assert.equal(defaults.type, 'rain')
  assert.equal(defaults.intensity, 0.55)
  assert.equal(defaults.speed, 1)
  assert.equal(defaults.windDirection, 115)
  assert.equal(defaults.color, '#d8f3ff')
  assert.equal(defaults.visible, true)

  const clamped = normalizeSceneWeatherOptions({
    type: 'unknown',
    intensity: 9,
    speed: 0,
    windDirection: Number.NaN,
    color: '',
  })
  assert.equal(clamped.type, 'rain')
  assert.equal(clamped.intensity, 1)
  assert.equal(clamped.speed, 0.05)
  assert.equal(clamped.windDirection, 115)
  assert.equal(clamped.color, '#d8f3ff')
})

test('SceneWeatherEffect manages a post-process stage through the viewer adapter', () => {
  const viewer = createMockViewer()
  const effect = createSceneWeatherEffect(viewer, {
    type: 'snow',
    intensity: 0.72,
    speed: 1.4,
  })

  assert.equal(viewer.scene.postProcessStages.items.length, 1)
  assert.equal(viewer.scene.postProcessStages.items[0]?.name, 'geo-effect-kit-scene-weather')
  assert.equal(viewer.scene.postProcessStages.items[0]?.uniforms.weatherType, 2)
  assert.equal(viewer.scene.requestRenderCount, 1)

  effect.update({ type: 'fog', intensity: 0.42, speed: 0.8, windDirection: 270, color: '#cce8ff' })
  assert.equal(viewer.scene.postProcessStages.items.length, 1)
  assert.equal(viewer.scene.postProcessStages.items[0]?.uniforms.weatherType, 3)
  assert.equal(viewer.scene.postProcessStages.items[0]?.uniforms.intensity, 0.42)
  assert.equal(viewer.scene.postProcessStages.items[0]?.uniforms.speed, 0.8)
  assert.equal(viewer.scene.postProcessStages.items[0]?.uniforms.windDirection, 270)
  assert.equal(viewer.scene.postProcessStages.items[0]?.uniforms.color.toCssHexString(), '#cce8ff')

  effect.hide()
  assert.equal(effect.isVisible(), false)
  assert.equal(viewer.scene.postProcessStages.items[0]?.enabled, false)

  effect.show()
  assert.equal(effect.isVisible(), true)
  assert.equal(viewer.scene.postProcessStages.items[0]?.enabled, true)

  effect.destroy()
  effect.destroy()
  assert.equal(effect.isDestroyed(), true)
  assert.equal(viewer.scene.postProcessStages.removeCount, 1)
})

test('scene weather post-process source declares all Cesium uniforms it reads', () => {
  const source = buildSceneWeatherPostProcessSource()

  assert.match(source, /uniform float weatherType;/)
  assert.match(source, /uniform float intensity;/)
  assert.match(source, /uniform float speed;/)
  assert.match(source, /uniform float windDirection;/)
  assert.match(source, /uniform vec4 color;/)
})

test('normalizePostProcessOptions supports Mars3D-like color effect modes', () => {
  const defaults = normalizePostProcessOptions({})
  assert.equal(defaults.type, 'bloom')
  assert.equal(defaults.strength, 0.65)
  assert.equal(defaults.visible, true)

  const nightVision = normalizePostProcessOptions({
    type: 'night-vision',
    strength: 0.82,
    brightness: 1.6,
    contrast: 1.2,
    saturation: 0.5,
  })
  assert.equal(nightVision.type, 'night-vision')
  assert.equal(nightVision.strength, 0.82)
  assert.equal(nightVision.brightness, 1.6)
  assert.equal(nightVision.contrast, 1.2)
  assert.equal(nightVision.saturation, 0.5)
})

test('PostProcessEffect updates a reusable post-process stage without rebuilding', () => {
  const viewer = createMockViewer()
  const effect = createPostProcessEffect(viewer, {
    type: 'bloom',
    strength: 0.7,
  })
  const stage = viewer.scene.postProcessStages.items[0]

  effect.update({ type: 'black-white', strength: 0.9, brightness: 0.92, contrast: 1.4, saturation: 0 })

  assert.equal(viewer.scene.postProcessStages.items[0], stage)
  assert.equal(viewer.scene.postProcessStages.removeCount, 0)
  assert.equal(stage.uniforms.effectType, 3)
  assert.equal(stage.uniforms.strength, 0.9)
  assert.equal(stage.uniforms.brightness, 0.92)
  assert.equal(stage.uniforms.contrast, 1.4)
  assert.equal(stage.uniforms.saturation, 0)

  effect.destroy()
  assert.equal(viewer.scene.postProcessStages.removeCount, 1)
})

test('post-process source declares all Cesium uniforms it reads', () => {
  const source = buildPostProcessSource()

  assert.match(source, /uniform float effectType;/)
  assert.match(source, /uniform float strength;/)
  assert.match(source, /uniform float brightness;/)
  assert.match(source, /uniform float contrast;/)
  assert.match(source, /uniform float saturation;/)
})

test('normalizeWaterSurfaceOptions fills water material defaults and detects geometry rebuilds', () => {
  const previous = normalizeWaterSurfaceOptions({
    polygon: [
      { longitude: 116.36, latitude: 39.89 },
      { longitude: 116.44, latitude: 39.89 },
      { longitude: 116.44, latitude: 39.94 },
    ],
  })
  const colorOnly = normalizeWaterSurfaceOptions({
    ...previous,
    color: '#38d5ff',
  })
  const heightChanged = normalizeWaterSurfaceOptions({
    ...previous,
    height: 320,
  })

  assert.equal(previous.type, 'river')
  assert.equal(previous.waveStrength, 0.48)
  assert.equal(previous.reflectionStrength, 0.36)
  assert.equal(previous.distortionScale, 18)
  assert.equal(previous.reflectivity, 0.58)
  assert.equal(previous.refractionStrength, 0.42)
  assert.equal(previous.fresnelPower, 4)
  assert.equal(previous.polygon.length, 4)
  assert.equal(shouldRebuildWaterSurface(previous, colorOnly), false)
  assert.equal(shouldRebuildWaterSurface(previous, heightChanged), true)

  const clamped = normalizeWaterSurfaceOptions({
    ...previous,
    distortionScale: -10,
    reflectivity: 8,
    refractionStrength: -3,
    fresnelPower: 30,
  })
  assert.equal(clamped.distortionScale, 0)
  assert.equal(clamped.reflectivity, 1)
  assert.equal(clamped.refractionStrength, 0)
  assert.equal(clamped.fresnelPower, 12)
})

test('buildWaterSurfaceMaterialSource exposes Three.js-style reflection and refraction shader code', () => {
  const source = buildWaterSurfaceMaterialSource()

  assert.match(source, /GeoWaterSurfaceMaterial/)
  assert.match(source, /waveStrength/)
  assert.match(source, /reflectionStrength/)
  assert.match(source, /distortionScale/)
  assert.match(source, /reflectivity/)
  assert.match(source, /refractionStrength/)
  assert.match(source, /fresnelPower/)
  assert.match(source, /surfaceNormal/)
  assert.match(source, /fresnel/)
  assert.match(source, /reflectionColor/)
  assert.match(source, /refractionColor/)
  assert.match(source, /flowDirection/)
  assert.match(source, /czm_frameNumber/)
  assert.match(source, /riverEnabled/)
  assert.match(source, /lakeEnabled/)
  assert.match(source, /floodEnabled/)
  assert.doesNotMatch(source, /fract\(dot\(moving,\s*flow\)/)
  assert.doesNotMatch(source, /riverFlow \* riverEnabled/)
})

test('WaterSurfaceEffect renders an animated polygon material and updates uniforms in place', () => {
  const viewer = createMockViewer()
  const effect = createWaterSurfaceEffect(viewer, {
    polygon: [
      { longitude: 116.36, latitude: 39.89 },
      { longitude: 116.44, latitude: 39.89 },
      { longitude: 116.44, latitude: 39.94 },
    ],
    type: 'lake',
    color: '#3de7ff',
  })
  const entity = viewer.dataSources.sources[0]?.entities.values[0]

  assert.equal(viewer.dataSources.addCount, 1)
  assert.equal(viewer.scene.requestRenderCount, 1)
  assert.equal(entity?.polygon.material.uniforms.waterType, 2)

  effect.update({
    type: 'flood',
    color: '#4fc3ff',
    waveStrength: 0.8,
    reflectionStrength: 0.62,
    distortionScale: 24,
    reflectivity: 0.74,
    refractionStrength: 0.55,
    fresnelPower: 6,
    flowDirection: 180,
  })
  assert.equal(viewer.dataSources.sources[0]?.entities.values[0], entity)
  assert.equal(entity?.polygon.material.uniforms.waterType, 3)
  assert.equal(entity?.polygon.material.uniforms.color.toCssHexString(), '#4fc3ff')
  assert.equal(entity?.polygon.material.uniforms.waveStrength, 0.8)
  assert.equal(entity?.polygon.material.uniforms.reflectionStrength, 0.62)
  assert.equal(entity?.polygon.material.uniforms.distortionScale, 24)
  assert.equal(entity?.polygon.material.uniforms.reflectivity, 0.74)
  assert.equal(entity?.polygon.material.uniforms.refractionStrength, 0.55)
  assert.equal(entity?.polygon.material.uniforms.fresnelPower, 6)
  assert.equal(entity?.polygon.material.uniforms.flowDirection, 180)

  effect.hide()
  assert.equal(effect.isVisible(), false)
  assert.equal(viewer.dataSources.sources[0]?.show, false)

  effect.show()
  assert.equal(effect.isVisible(), true)
  assert.equal(viewer.dataSources.sources[0]?.show, true)

  effect.flyTo()
  assert.equal(viewer.camera.flyToBoundingSphereCount, 1)

  effect.destroy()
  assert.equal(effect.isDestroyed(), true)
  assert.equal(viewer.dataSources.removeCount, 1)
})

function createMockViewer() {
  return {
    scene: {
      requestRenderCount: 0,
      primitives: {
        items: [],
        add(primitive) {
          this.items.push(primitive)
          return primitive
        },
        remove(primitive) {
          this.items = this.items.filter((item) => item !== primitive)
          return true
        },
      },
      postProcessStages: {
        items: [],
        removeCount: 0,
        add(stage) {
          this.items.push(stage)
          return stage
        },
        remove(stage) {
          this.removeCount += 1
          this.items = this.items.filter((item) => item !== stage)
          return true
        },
      },
      requestRender() {
        this.requestRenderCount += 1
      },
    },
    dataSources: {
      sources: [],
      addCount: 0,
      removeCount: 0,
      add(dataSource) {
        this.addCount += 1
        this.sources.push(dataSource)
        return dataSource
      },
      remove(dataSource) {
        this.removeCount += 1
        this.sources = this.sources.filter((source) => source !== dataSource)
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
