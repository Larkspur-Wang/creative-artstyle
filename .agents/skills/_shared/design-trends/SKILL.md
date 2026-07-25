---
name: design-trends
description: >
  当前流行的编辑/艺术向视觉设计方向参考。当为站点、卡片、海报、落地页做视觉决策，或需要
  "现在流行什么风格"的方向时使用。这里只沉淀公认的设计运动与原则（不复制任何具体作品/图片），
  每条附上"怎么用在 Creative Artstyle"和"什么时候别用"。
---

# Design Trends Reference

只记录设计运动与可复用原则，不搬运任何具体作品。灵感来源要转成原则再用，不要像素级照搬别人的版面。

## 当前值得借的方向

| 方向 | 特征 | 用在哪 | 别用的时候 |
|---|---|---|---|
| Editorial / 杂志编辑部 | 大号衬线标题、大量留白、等宽小字、发丝线、01/02 序号 | 全站基调，已在用 | 信息密集的表单区 |
| Swiss grid 复兴 | 严格网格、左对齐、克制字号层级 | capability strip、maker grid | 需要情绪张力的 hero |
| Riso / print 质感 | 孔版颗粒、半调网点、套色错位、纸张噪点 | 背景、卡片纹理、海报 | 文字/状态区域之上 |
| Quiet luxury / 低饱和大地色 | 米白纸张、墨黑、单一克制强调色 | 色彩角色制度 | 需要高唤醒的 CTA |
| Bento grid | 大小不一的方块拼合，一屏讲多件事 | 未来的 dashboard / archive | 单一焦点的生成结果 |
| Kinetic type / 滚动动效 | 标题入场、滚动揭示、hover 反馈 | hero、capability 卡、section reveal | 降低可读性的过度动效 |
| Grain / noise overlay | 全局细颗粒叠加，去数字塑料感 | app-shell 背景层 | 覆盖正文和状态 |
| Oversized serif + tight tracking | 超大衬线、负字距、斜体强调 | hero 标题 | 正文 |

## 映射到 Creative Artstyle

- 已落地：editorial 基调、色彩角色、点阵纸张背景、粒子 hero、入场/hover 动效。
- 本次新增：全局 grain overlay（feTurbulence，低透明度，不盖文字）。
- 可继续：bento 化的 archive/projects 视图；scroll-reveal 用 IntersectionObserver 替代纯 CSS delay。

## 硬规则

- 灵感 → 原则 → 重做，永远不要照搬具体作品的版面、配图或配色到产品里。
- 一次只加一个能被说清楚的趋势，避免风格拼盘。
- 动效服务可读性；`prefers-reduced-motion` 必须尊重。
- 纹理是材质不是滤镜：统一密度和方向，不盖文字、状态、操作区。
