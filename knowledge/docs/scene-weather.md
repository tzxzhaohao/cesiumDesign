# scene-weather 场景天气

`scene-weather` 用 Cesium `PostProcessStage` 在整个场景上渲染雨、雪、雾和闪电效果。它适合需要快速增加环境氛围的指挥大屏、应急推演、气象态势和项目展示页。

## 最小接入

```ts
import { createSceneWeatherEffect } from '@ztgkzhaohao/geo-effect-kit'

const weather = createSceneWeatherEffect(viewer, {
  type: 'rain',
  intensity: 0.55,
  speed: 1,
  windDirection: 115,
  color: '#d8f3ff',
})
```

## 类型建议

- `rain`：斜向雨线，适合强天气和应急场景。
- `snow`：缓慢雪点，适合冬季、寒潮和展示氛围。
- `fog`：低干扰雾化，适合能见度、山地和空气质量场景。
- `lightning`：闪电高亮，适合极端天气和告警展示。

## 生命周期

实例支持 `update`、`show`、`hide`、`flyTo`、`destroy`、`isVisible`、`isDestroyed`、`getOptions`。页面卸载或切换 viewer 时调用 `destroy()`，会移除后处理 stage 和内部渲染循环。

