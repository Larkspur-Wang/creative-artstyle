---
name: scrollytelling-map
description: >
  基于 d3 + topojson 的场景化叙事地图 / 数据故事。当用户想要"会讲故事的地图、镜头推近某个区域、
  分场景高亮、滚动驱动的数据可视化、带排行榜联动的世界图"时使用。核心是一组 Scene 配置驱动
  镜头 zoom + focus，配 canvas 头像/点位的确定性随机布局。吸收自 漂亮前端交互 的 world-anime-map。
---

# Scrollytelling Map

一组场景配置驱动镜头，把静态地图变成有节奏的叙事。地图只是载体，Scene 序列才是内容。

## 核心结构

```ts
type Scene = {
  key: string
  label: string
  focusKeys: string[]   // 这一幕高亮/聚焦哪些区域
  zoom: number          // 镜头推进程度
  caption: string       // 大标题：这一幕在讲什么
  subtitle: string      // 补充说明
}
const STORY: Scene[] = [ /* world → japan → china → ... */ ]
```

- 用 d3-geo + topojson-client 的 `feature()` 把 topojson 转成可画的地理要素。
- 切换 Scene 时对 projection 做 `zoom` + `focus` 过渡（d3.transition），镜头平滑推近。
- 每一幕联动其它 UI（排行榜换位、区域点亮、数字滚动）。

## 确定性布局（关键手法）

用 `mulberry32(seed)` 做可复现随机，把头像/点位撒进区域内，保证每次渲染位置一致、不闪烁：

```ts
function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296 } }
```

- 点位随机但确定 → 支持镜头推进时点位稳定。
- canvas 层画头像/点，SVG/d3 层画地理边界，两层叠加。

## 动效与节奏

- 镜头推进用缓动过渡，不要瞬切。
- 数字用 `formatHeat`（千万/万）滚动增长。
- 一次只讲一件事：每幕一个 caption，一个聚焦区域，一次排行榜变化。

## 可迁移性

- Scene 数组、mulberry32、formatHeat 都是纯函数，与具体数据无关。
- 把 anime 数据换成任意"区域 + 热度 + 条目"数据即可复用（销售地图、用户分布、赛事版图）。
- 不硬编码具体国家/IP；区域配置从数据生成。
