# React 接入

React 页面中建议把 Cesium `Viewer` 和效果实例都放在 `useEffect` 生命周期里管理。

```tsx
import { useEffect, useRef } from 'react'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { Viewer, type Viewer as CesiumViewer } from 'cesium'
import { createFlyLineEffect, type FlyLineEffectInstance } from '@ztgkzhaohao/geo-effect-kit'

export function CesiumMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<CesiumViewer | null>(null)
  const effectRef = useRef<FlyLineEffectInstance | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const viewer = new Viewer(containerRef.current)
    viewerRef.current = viewer

    effectRef.current = createFlyLineEffect(viewer, {
      lines: [
        {
          from: { longitude: 116.285, latitude: 39.87 },
          to: { longitude: 116.391, latitude: 39.907 },
        },
      ],
      mode: 'single-arc',
      color: '#5ee8ff',
    })

    effectRef.current.flyTo()

    return () => {
      effectRef.current?.destroy()
      effectRef.current = null
      viewer.destroy()
      viewerRef.current = null
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
```

如果业务参数变化，优先调用 `effect.update(nextOptions)`，不要反复创建新实例。只有几何结构发生大变化或页面卸载时才销毁。
