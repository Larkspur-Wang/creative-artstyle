---
name: card
description: >
  Visual Card 能力。横版 3:2 有设计感的内容卡：社交、品牌、产品或语录卡。
  当用户要做小红书封面、品牌视觉卡、产品卡、语录卡时使用。模型 GPT Image 2。
---

# Card / Visual Card

站点第 02 个能力。横版 3:2，编辑级排版的内容卡。

## 生成方式

- 模型：GPT Image 2，尺寸 `1536x1024`。
- 控件：卡片用途（生活方式 / 品牌 / 产品 / 语录）× 强调色 × 一句短句。
- prompt 编译器：`src/capabilities.ts` 的 `compileCardPrompt`。
- 强调色 = 钴蓝 `#3f6ad8`（`--cap-accent`）。

## 硬约束

- 一个清晰焦点隐喻 + 大量留白 + 编辑级字体层级（衬线 + 等宽）。
- 纸张底 + 受控孔版颗粒 + 恰好一个强调色。
- 只保留一句可读短句，其余不堆文字。
- 禁止：通用社交模板、拥挤排版、stock-photo 套路、logo、CTA 按钮、渐变、长段文字。

## 依赖

- 生成前：`_shared/content-quality-gate`。
- 视觉规范：`_shared/editorial-visual-system`（尤其是"卡片封面当主角"和色彩角色）。
- 找方向：`_shared/content-interaction-quadrant`。
- 失败处理：`_shared/generation-failure-recovery`。

## example

`public/examples/card/make-room-for-air.png`（GPT Image 2 实际生成）。
