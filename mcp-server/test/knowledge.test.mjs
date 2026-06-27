import test from 'node:test'
import assert from 'node:assert/strict'

import {
  generateIntegrationNotes,
  getEffectSchema,
  getUsageExample,
  listEffects,
} from '../dist/index.js'

test('listEffects reads the radar scan manifest', async () => {
  const effects = await listEffects()

  assert.equal(effects.length, 13)
  assert.equal(effects[0].id, 'radar-scan')
  assert.equal(effects[1].id, 'ripple-spread')
  assert.equal(effects[2].id, 'scene-weather')
  assert.equal(effects[3].id, 'post-process')
  assert.equal(effects[4].id, 'polyline-flow')
  assert.equal(effects[5].id, 'fly-line')
  assert.equal(effects[6].id, 'pipe-flow')
  assert.equal(effects[7].id, 'water-surface')
  assert.equal(effects[8].id, 'light-wall')
  assert.equal(effects[9].id, 'scan-cone')
  assert.equal(effects[10].id, 'shield-dome')
  assert.equal(effects[11].id, 'temperature-field')
  assert.equal(effects[12].id, 'fire-billboard')
  assert.equal(effects[0].packageName, '@ztgk/geo-effect-kit')
})

test('getEffectSchema returns agent-readable parameter schema', async () => {
  const schema = await getEffectSchema('radar-scan')

  assert.equal(schema.id, 'radar-scan')
  assert.equal(schema.options.properties.center.required, true)
  assert.equal(schema.options.properties.radiusMeters.required, true)
  assert.equal(schema.options.properties.type.default, 'classic')
  assert.equal(schema.options.properties.scanDurationMs.default, 3600)
})

test('getEffectSchema returns ripple spread parameter schema', async () => {
  const schema = await getEffectSchema('ripple-spread')

  assert.equal(schema.id, 'ripple-spread')
  assert.equal(schema.importName, 'createRippleSpreadEffect')
  assert.equal(schema.options.properties.center.required, true)
  assert.equal(schema.options.properties.radiusMeters.required, true)
  assert.equal(schema.options.properties.type.default, 'water')
  assert.equal(schema.options.properties.ringCount.default, 4)
  assert.equal(schema.options.properties.durationMs.default, 3200)
})

test('getUsageExample returns the minimal TypeScript integration snippet', async () => {
  const example = await getUsageExample('radar-scan', 'minimal')

  assert.match(example.code, /createRadarScanEffect/)
  assert.match(example.code, /radiusMeters/)
  assert.equal(example.language, 'ts')
})

test('getUsageExample returns the ripple spread minimal snippet', async () => {
  const example = await getUsageExample('ripple-spread', 'minimal')

  assert.match(example.code, /createRippleSpreadEffect/)
  assert.match(example.code, /ringCount/)
  assert.equal(example.language, 'ts')
})

test('getEffectSchema returns route flow and 3D volume schemas', async () => {
  const weather = await getEffectSchema('scene-weather')
  const postProcess = await getEffectSchema('post-process')
  const flow = await getEffectSchema('polyline-flow')
  const flyLine = await getEffectSchema('fly-line')
  const pipe = await getEffectSchema('pipe-flow')
  const water = await getEffectSchema('water-surface')
  const wall = await getEffectSchema('light-wall')
  const cone = await getEffectSchema('scan-cone')
  const dome = await getEffectSchema('shield-dome')

  assert.equal(weather.importName, 'createSceneWeatherEffect')
  assert.equal(weather.options.properties.type.default, 'rain')
  assert.deepEqual(weather.options.properties.type.enum, ['rain', 'snow', 'fog', 'lightning'])
  assert.equal(postProcess.importName, 'createPostProcessEffect')
  assert.equal(postProcess.options.properties.type.default, 'bloom')
  assert.deepEqual(postProcess.options.properties.type.enum, ['bloom', 'night-vision', 'black-white', 'brightness', 'mosaic', 'depth-of-field'])
  assert.equal(flow.importName, 'createPolylineFlowEffect')
  assert.equal(flow.options.properties.type.default, 'dispatch')
  assert.equal(flow.options.properties.cornerRadius.default, 0)
  assert.equal(flyLine.importName, 'createFlyLineEffect')
  assert.equal(flyLine.options.properties.mode.default, 'single-arc')
  assert.deepEqual(flyLine.options.properties.mode.enum, ['single-arc', 'hub-spoke', 'bidirectional'])
  assert.equal(flyLine.options.properties.arcHeight.default, 38000)
  assert.equal(pipe.importName, 'createPipeFlowEffect')
  assert.equal(pipe.options.properties.pipeOpacity.default, 0.32)
  assert.equal(pipe.options.properties.waterOpacity.default, 0.86)
  assert.equal(pipe.options.properties.bubbleDensity.default, 6)
  assert.equal(water.importName, 'createWaterSurfaceEffect')
  assert.equal(water.options.properties.type.default, 'river')
  assert.equal(water.options.properties.waveStrength.default, 0.48)
  assert.equal(water.options.properties.distortionScale.default, 18)
  assert.equal(water.options.properties.reflectivity.default, 0.58)
  assert.equal(water.options.properties.refractionStrength.default, 0.42)
  assert.equal(water.options.properties.fresnelPower.default, 4)
  assert.equal(wall.importName, 'createLightWallEffect')
  assert.equal(wall.options.properties.height.default, 3200)
  assert.equal(cone.importName, 'createScanConeEffect')
  assert.equal(cone.options.properties.aperture.default, 34)
  assert.equal(dome.importName, 'createShieldDomeEffect')
  assert.equal(dome.options.properties.gridDensity.default, 14)
})

test('getEffectSchema returns FireHotspot-compatible temperature field schema', async () => {
  const field = await getEffectSchema('temperature-field')

  assert.equal(field.importName, 'createTemperatureFieldEffect')
  assert.equal(field.options.properties.polygons.required, true)
  assert.equal(field.options.properties.stops.description.includes('FireHotspot'), true)
  assert.equal(field.options.properties.opacity.default, 0.76)
  assert.equal(field.options.properties.contourLines.default, true)
})

test('getEffectSchema returns gif fire billboard schema', async () => {
  const billboard = await getEffectSchema('fire-billboard')

  assert.equal(billboard.importName, 'createFireBillboardEffect')
  assert.equal(billboard.options.properties.points.required, true)
  assert.equal(billboard.options.properties.points.description.includes('longitude'), true)
  assert.equal(billboard.options.properties.points.description.includes('gif'), true)
  assert.equal(billboard.options.properties.scale.default, 1)
  assert.equal('width' in billboard.options.properties, false)
  assert.equal('height' in billboard.options.properties, false)
  assert.equal(billboard.options.properties.frameIntervalMs.default, 80)
})

test('getUsageExample returns new effect snippets', async () => {
  const weather = await getUsageExample('scene-weather', 'minimal')
  const postProcess = await getUsageExample('post-process', 'minimal')
  const flow = await getUsageExample('polyline-flow', 'minimal')
  const flyLine = await getUsageExample('fly-line', 'minimal')
  const pipe = await getUsageExample('pipe-flow', 'minimal')
  const water = await getUsageExample('water-surface', 'minimal')
  const wall = await getUsageExample('light-wall', 'minimal')
  const cone = await getUsageExample('scan-cone', 'minimal')
  const dome = await getUsageExample('shield-dome', 'minimal')

  assert.match(weather.code, /createSceneWeatherEffect/)
  assert.match(weather.code, /windDirection/)
  assert.match(postProcess.code, /createPostProcessEffect/)
  assert.match(postProcess.code, /night-vision/)
  assert.match(flow.code, /createPolylineFlowEffect/)
  assert.match(flow.code, /cornerRadius/)
  assert.match(flyLine.code, /createFlyLineEffect/)
  assert.match(flyLine.code, /bidirectional/)
  assert.match(flyLine.code, /arcHeight/)
  assert.match(pipe.code, /createPipeFlowEffect/)
  assert.match(pipe.code, /bubbleDensity/)
  assert.match(water.code, /createWaterSurfaceEffect/)
  assert.match(water.code, /waveStrength/)
  assert.match(wall.code, /createLightWallEffect/)
  assert.match(cone.code, /createScanConeEffect/)
  assert.match(dome.code, /createShieldDomeEffect/)
})

test('getUsageExample returns the temperature field FireHotspot snippet', async () => {
  const example = await getUsageExample('temperature-field', 'fireHotspot')

  assert.match(example.code, /createTemperatureFieldEffect/)
  assert.match(example.code, /riskSurface\.polygons/)
  assert.match(example.code, /riskSurface\.riskField\.stops/)
})

test('getUsageExample returns the fire billboard gif snippet', async () => {
  const example = await getUsageExample('fire-billboard', 'minimal')

  assert.match(example.code, /createFireBillboardEffect/)
  assert.match(example.code, /longitude/)
  assert.match(example.code, /latitude/)
  assert.match(example.code, /gif/)
  assert.match(example.code, /https:\/\/upload\.wikimedia\.org/)
  assert.doesNotMatch(example.code, /Animated-flame\.gif/)
  assert.doesNotMatch(example.code, /dog\.gif/)
  assert.match(example.code, /scale/)
  assert.doesNotMatch(example.code, /width:/)
  assert.doesNotMatch(example.code, /height:/)
})

test('generateIntegrationNotes produces FireHotspot-specific migration guidance', async () => {
  const notes = await generateIntegrationNotes('radar-scan', 'FireHotspot')

  assert.match(notes, /FirePredictionSurfaceLayer/)
  assert.match(notes, /GeoRadarScanMaterial/)
  assert.match(notes, /destroy/)
})

test('generateIntegrationNotes produces FireHotspot temperature-field migration guidance', async () => {
  const notes = await generateIntegrationNotes('temperature-field', 'FireHotspot')

  assert.match(notes, /FirePredictionSurfaceLayer/)
  assert.match(notes, /ImageMaterialProperty/)
  assert.match(notes, /createTemperatureFieldEffect/)
})
