# 飞线动画设计

## 目标

在 `@ztgk/geo-effect-kit` 中新增独立的 `fly-line` Cesium 动效，用同一个 API 支持三种形态：单向抛物线、多源汇聚、双向流转。效果保持框架无关，只接收已有 `Viewer`，并沿用当前 SDK 的 `update`、`show`、`hide`、`flyTo`、`destroy` 生命周期。

## API

新增 `createFlyLineEffect(viewer, options)`。

核心参数：

- `lines`: 飞线连接列表，每条包含 `from` 和 `to`，坐标为 WGS84，经纬度加可选高度。
- `mode`: `'single-arc' | 'hub-spoke' | 'bidirectional'`。三种模式都可由同一组 `lines` 驱动，`bidirectional` 会为每条连接自动渲染反向飞线。
- `color`, `speed`, `width`, `arcHeight`, `trailLength`, `pulseCount`, `glowPower`, `taperPower`, `showEndpoints`, `visible`。

默认值偏向大屏链路视觉：青色主色、适中的高空弧度、3 个移动光点、显示端点。

## 渲染方式

飞线由 Cesium entity polyline 组成：每条连接一条半透明基础弧线，加若干 `CallbackProperty` 动态尾迹。弧线通过二次贝塞尔在经纬度和高度维度采样，控制点高度为端点最大高度加 `arcHeight`。这种方式不依赖自定义 shader，和已有 `PolylineFlowEffect` 的实体生命周期保持一致。

## Demo 和知识层

`apps/demo` 新增 `fly-line` tab，使用下拉框切换三种模式。右侧 Usage 生成可复制的 `createFlyLineEffect` 示例。`knowledge/effects`、`knowledge/docs`、MCP 索引同步新增 `fly-line`，方便智能体查询。

## 验证

先补核心测试，覆盖默认值、参数裁剪、三种模式、弧线高度、反向扩展、生命周期和 demo 暴露。最后运行 `pnpm test`、`pnpm typecheck`、`pnpm build`。
