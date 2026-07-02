# material-polyline 材质线

`material-polyline` 用于实现 Mars3D 风格的线材质合集：普通实线、描边线、箭头线、虚线、双色虚线、动态流光、三段虚线、交叉纹理线和导航箭头线。它比 `polyline-flow` 更偏“材质展示”和“业务线型自定义”，适合巡检路线、警戒线、导航线、管控范围边界和专题图线路。

## 最小接入

```ts
import { createMaterialPolylineEffect } from '@ztgkzhaohao/geo-effect-kit'

const materialLine = createMaterialPolylineEffect(viewer, {
  positions: [
    { longitude: 116.285, latitude: 39.87 },
    { longitude: 116.394, latitude: 39.91 },
    { longitude: 116.505, latitude: 39.9 },
  ],
  style: 'navigation',
  color: '#33f7ff',
  width: 10,
  speed: 1.2,
  repeat: { x: 4, y: 1 },
  image: 'https://example.com/textures/navigation-line.png',
  cornerRadius: 0.14,
})

materialLine.flyTo()
materialLine.destroy()
```

## 样式建议

- `solid`：普通业务线、低干扰参考线。
- `outline`：行政边界、警戒边界、重点线路。
- `arrow`：方向明确的调度路线。
- `dash`：规划中、临时、待确认路线。
- `dual-dash`：双色巡检线、双状态路线。
- `flow`：默认动态贴图流光线。
- `flow-color`：更强调颜色过渡的动态流光。
- `three-dash`：三段节奏感虚线，适合告警和专题路线。
- `cross`：交叉纹理线，适合工程、管线、封控类视觉。
- `navigation`：导航箭头和方向感更强的线路。

## 图片素材

`imagePreset` 提供内置贴图：`pulse`、`gradual`、`arrow-blue`、`rainbow`、`arrow-repeat`、`dovetail`、`yellow-flow`、`transparent-flow`、`interval`、`small-arrow`、`gradient`。

如果业务方有自己的图片素材，直接传 `image`。`image` 的优先级高于 `imagePreset`，支持 URL 字符串、`data:` URL、`HTMLImageElement`、`HTMLCanvasElement`、`ImageBitmap` 和 `OffscreenCanvas`。

```ts
materialLine.update({
  style: 'cross',
  image: canvasTexture,
  repeat: { x: 6, y: 1 },
})
```

## 生命周期

`positions`、`arcHeight`、`arcSamples`、`cornerRadius`、`clampToGround` 变化会重建路线实体；`style`、`color`、`secondaryColor`、`backgroundColor`、`speed`、`repeat`、`imagePreset` 和 `image` 会尽量原地更新材质。页面卸载、路由切换或图层关闭时必须调用 `destroy()`。

## 集成建议

如果只需要流动路线动画，优先用 `polyline-flow`。如果要做 Mars3D 示例里那种多种线型展示，或者要让用户上传/配置自己的线贴图，使用 `material-polyline`。业务表单中可以保存 `style`、`imagePreset`、`image` URL、`color`、`width` 和 `repeat`，进入地图页后直接恢复为 `createMaterialPolylineEffect` 参数。
