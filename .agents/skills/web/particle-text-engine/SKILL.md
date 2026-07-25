---
name: particle-text-engine
description: >
  把一句话/一个主题变成 3D 点云粒子艺术的生成引擎。当用户想要"文字变粒子、主题生成点云、
  可交互的粒子艺术、生成式艺术封面、有动效的 3D 视觉"时使用。核心是一个纯函数 generate(n) 返回
  N 个 [x,y,z] 点 + 一组调色板，前端用 canvas/three 渲染并做呼吸/旋转/形变动画。
  吸收自 漂亮前端交互 space 的 particle-works。可独立迁移，不依赖特定框架。
---

# Particle Text Engine

用一个纯函数把主题描述成 3D 点云，再交给渲染层做动效。生成逻辑与渲染解耦，是它可复用的关键。

## 生成契约

每个作品 = 一个 `generate(n)` 函数 + 一组 palette：

```js
// 返回 n 个 [x,y,z] 点，坐标大致落在 [-20,20] 立方体内
function generate(n){
  var pts=[];
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n;            // 0..1 沿结构参数
    // 用 t 把点分配到不同身体部位/结构段
    // 用极坐标 / 椭球 / 管状截面塑形
    pts.push([x,y,z]);
  }
  return pts;
}
```

palette 是 4-6 个 hex 色，渲染时按点的位置或索引取色。

## 塑形手法（从 dragon / dino / 天安门 等作品提炼）

- **分段**：用 `t` 把 n 个点切成结构段（身体/头/腿/装饰），每段一套参数方程。
- **椭球**：`x=sx*sin(a)*cos(u); y=sy*cos(a); z=sz*sin(a)*sin(u)`，塑头、躯干。
- **管状**：沿中心线 `cx,cy,cz` + 截面半径 `r`，塑蛇形/龙身/肢体。
- **确定性随机**：`sin(i*127.1+k*311.7)*43758.5 % 1` 做可复现噪声，避免每帧抖动。
- **jitter/wave**：小幅 `sin` 扰动让点云不死板，模拟呼吸。
- **建筑/图形**：用区间判断（`arch(x,y)`）挖空门洞、立柱、屋檐。

## 渲染与动效

- canvas2d 投影或 three.js Points 都可；点小、半透明、加辉光更高级。
- 动效：整体缓慢旋转 + 每点沿法线做 `sin` 呼吸 + 鼠标视差。
- 主题切换时在两组点云之间做 lerp 形变过渡，是最出彩的动效。
- palette 决定气质：限定 4-6 色、一个主色 + 一个高光，不要彩虹。

## 作为产品能力

- 输入：一句主题 → LLM 产出 `generate` 函数 + palette（gallery.json 存 theme/code/palette/author）。
- gallery 用 JSON 存档，每条含 id、theme、code 字符串、palette、author、createdAt。
- 用户可 remix：改 palette、改点数、在两个作品间过渡。

## 可迁移性

- 生成逻辑是纯 JS 字符串，不依赖任何框架，换渲染层即可复用。
- 不硬编码具体主题；主题→函数由 LLM 现场生成或从 gallery 取。
