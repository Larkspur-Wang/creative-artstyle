---
name: deck
description: >
  Deck / PPT 能力。可编辑的演示文稿与视觉叙事。当用户要做提案、汇报、讲解或叙事型 deck 时使用。
  由 Space Agent 直接创建可交付的 HTML 演示文件。
---

# Deck / PPT

站点第 05 个能力。16:9 多页演示，有章节、层级和视觉叙事。

## 生成方式

- 由 Space Agent 用访客授权的 `session.prompt.fullaccess` 直接创建文件。
- 控件：叙事结构（提案 / 叙事 / 汇报 / 讲解）× 页数 × 目标观众。
- prompt 编译器：`src/capabilities.ts` 的 `compileDeckPrompt`。
- 产物写入：`generated-projects/deck/<项目>/deck.html`（+ README.md）。
- 强调色 = 橙 `#d6863a`（`--cap-accent`）。

## 硬约束

- 16:9，编辑感排版，纸张底 + 墨黑 + 一个克制强调色。
- 每页只承载一个核心信息，标题页 + 内容页有清晰层级。
- 叙事结构决定页序：提案（问题→方案→证据→行动）、叙事（起承转合）、汇报（结论先行）、讲解（概念→演示→小结）。

## 依赖

- 生成前：`_shared/content-quality-gate`（先证明每页的观看回报）。
- 视觉规范：`_shared/editorial-visual-system`。
- 找角度：`_shared/content-interaction-quadrant`。
