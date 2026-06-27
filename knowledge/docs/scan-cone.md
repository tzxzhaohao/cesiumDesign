# scan-cone 锥形扫描

`scan-cone` 是一个旋转的立体扫描锥，可用于探照灯、雷达、摄像头覆盖、无人机探测范围和告警范围。

## 最小接入

```ts
import { createScanConeEffect } from '@ztgkzhaohao/geo-effect-kit'

const cone = createScanConeEffect(viewer, {
  center: { longitude: 116.391, latitude: 39.907 },
  type: 'searchlight',
  color: '#7cf7ff',
  radiusMeters: 2200,
  lengthMeters: 6200,
  speed: 1.2,
  aperture: 38,
})
```

## 类型建议

- `searchlight`：探照灯/巡检光锥。
- `radar`：雷达扫描锥。
- `camera`：摄像头视锥。
- `drone`：无人机或移动探测范围。
- `alarm`：高危告警锥。

## 生命周期

`center`、`radiusMeters`、`lengthMeters`、`aperture` 变化会重建锥体几何；类型、颜色、速度、透明度、heading 和 origin 点可直接更新。离开页面时调用 `destroy()`。
