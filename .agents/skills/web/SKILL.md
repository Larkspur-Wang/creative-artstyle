---
name: web
description: >
  Web / HTML 能力。从一句 brief 创建可运行的响应式网页、落地页或互动原型。
  当用户要做落地页、作品集、微站点、互动原型时使用。由 Space Agent 直接创建可交付文件。
  两个前端艺术技法附在这里：particle-text-engine 与 scrollytelling-map。
---

# Web / HTML

站点第 04 个能力。真正可运行的网页，不只是方案。

## 生成方式

- 由 Space Agent 用访客授权的 `session.prompt.fullaccess` 直接创建文件。
- 控件：产出类型（落地页 / 作品集 / 互动原型 / 微站点）× 板块。
- prompt 编译器：`src/capabilities.ts` 的 `compileWebPrompt`。
- 产物写入：`generated-projects/web/<项目>/index.html`（+ README.md）。
- 强调色 = 苔绿 `#4f9d69`（`--cap-accent`）。

## 视觉方向

安静、编辑感、当代；纸张底 + 墨黑 + 一个克制强调色；good typography；明显但不喧哗的动效。

## 两个可选艺术技法

- `web/particle-text-engine`：文字/主题 → 3D 点云粒子艺术，做 hero 背景或生成式封面。
- `web/scrollytelling-map`：d3 + topojson 场景化叙事地图，做数据故事或滚动叙事页。

## 依赖

- 生成前：`_shared/content-quality-gate`。
- 视觉规范：`_shared/editorial-visual-system`。
- 安全：网页若含表单/接口，缺少鉴权要显式提示，不要静默上线无鉴权服务。
