# Vue 接入

Vue 页面中建议在 `onMounted` 创建 `Viewer` 和效果实例，在 `onBeforeUnmount` 中统一销毁。

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { Viewer } from 'cesium'
import { createRadarScanEffect, type RadarScanEffectInstance } from '@ztgkzhaohao/geo-effect-kit'

const containerRef = ref<HTMLDivElement | null>(null)

let viewer: Viewer | null = null
let radar: RadarScanEffectInstance | null = null

onMounted(() => {
  if (!containerRef.value) return

  viewer = new Viewer(containerRef.value)
  radar = createRadarScanEffect(viewer, {
    center: { longitude: 116.391, latitude: 39.907 },
    radiusMeters: 22000,
    color: '#36d6ff',
  })
  radar.flyTo()
})

onBeforeUnmount(() => {
  radar?.destroy()
  radar = null
  viewer?.destroy()
  viewer = null
})
</script>

<template>
  <div ref="containerRef" class="cesium-map" />
</template>

<style scoped>
.cesium-map {
  width: 100%;
  height: 100%;
}
</style>
```

如果参数来自 Vue 响应式状态，监听参数变化后调用 `radar?.update(nextOptions)`。
