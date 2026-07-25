---
name: poster
description: >
  Zine Poster 能力。竖版 3:5 艺术海报：旧纸、大量留白、微小图像锚点、一处高饱和印刷色。
  当用户要做海报、zine、艺术印刷品、留白编辑风竖图时使用。模型 GPT Image 2。
---

# Poster / Zine Poster

站点第 01 个能力。竖版 3:5，独立杂志 zine 气质。

## 生成方式

- 模型：GPT Image 2，尺寸 `1024x1536`。
- 控件：构图（6 种 layout）× 图像锚点 × 文字系统 × 印刷质感 × 情绪 × 强调色。
- prompt 编译器：`src/prompt.ts` 的 `compilePrompt`，把 recipe 拼成一段有硬约束的英文 prompt。
- 强调色 = 柠檬黄 `#e9d622`（`--cap-accent`）。

## 硬约束（写进 prompt）

- 78%-86% 画布留白，视觉簇只占 12%-18%。
- 恰好一句短句可读，其余是半可读档案微字。
- 一处高饱和锚点色占 1.5%-2% 画布，缩略图也要可见。
- 受控印刷瑕疵：孔版颗粒、套色错位、渗墨。
- 禁止：满版场景、商业标题层级、logo、CTA、glossy mockup、赛博霓虹、动漫、时尚大片。

## 依赖

- 生成前：`_shared/content-quality-gate`（先证明观看回报）。
- 视觉规范：`_shared/editorial-visual-system`。
- 失败处理：`_shared/generation-failure-recovery`。

## example

`public/examples/poster/`：Rain Bookshop（GPT 生成）+ 6 张 zine 参考。
