# post-process 后处理特效

`post-process` 用一个 Cesium `PostProcessStage` 提供 Mars3D 风格的屏幕后处理能力，包括泛光、夜视、黑白、亮度调节、马赛克和景深感。它不改变业务图层，只改变最终画面。

## 最小接入

```ts
import { createPostProcessEffect } from '@ztgkzhaohao/geo-effect-kit'

const postProcess = createPostProcessEffect(viewer, {
  type: 'night-vision',
  strength: 0.82,
  brightness: 1.4,
  contrast: 1.2,
  saturation: 0.6,
})
```

## 类型建议

- `bloom`：泛光增强，适合科技大屏和夜景。
- `night-vision`：夜视模式，适合安防、巡检和弱光场景。
- `black-white`：黑白模式，适合历史回放或低干扰分析。
- `brightness`：亮度、对比度、饱和度调整。
- `mosaic`：像素化效果，适合演示或隐私遮罩表达。
- `depth-of-field`：中心清晰、边缘柔化的景深感。

## 生命周期

实例支持 `update`、`show`、`hide`、`flyTo`、`destroy`、`isVisible`、`isDestroyed`、`getOptions`。`update()` 会复用同一个后处理 stage，只更新 uniform。

