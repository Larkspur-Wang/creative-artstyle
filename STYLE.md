# Creative Commons — Visual System

编辑部风格（independent editorial magazine × content production pipeline），吸收自 Studio_ArtStyle
风格库和小红书卡片设计原则。

## 色彩角色（不是"好看的颜色集合"）

| 角色 | 值 | 职责 |
|---|---|---|
| 纸张底 | `#f3f3ef` / `#fafaf7` | 大面积背景 |
| 墨黑 | `#1d1e1c` | 正文、标题、topbar |
| 辅助冷色 | `#dedfd9` / `#c6c8c2` | 分割线、面板、灰阶 |
| 能力强调色 | 每个能力一个（见下） | 只承担"当前能力 / 需要注意" |
| 风险色 | `#b83a2d` 系 | 只承担错误与失败分类 |

强调色按能力切换，通过 `--cap-accent` CSS 变量驱动：

- Zine Poster → 柠檬黄 `#e9d622`
- Visual Card → 钴蓝 `#3f6ad8`
- Motion Clip → 品红 `#d8567f`
- Web / HTML → 苔绿 `#4f9d69`
- Deck / PPT → 橙 `#d6863a`

## 原则（吸收自小红书卡片 session 的 9 条）

1. 先保证可读，再谈高级感：每个视图只回答一个问题。
2. 用"杂志编辑部"而不是"后台面板"的气质。
3. 每个能力 / 每种状态有自己的视觉语法，不是换个文字。
4. 把产出物当主角，操作信息放外围。
5. 强约束的视觉变化：固定骨架，只变强调色 / 输出框 / 纹理。
6. 受控印刷感（纸张颗粒点阵背景），不覆盖文字和状态。
7. 明确的色彩角色，强调色不与风险色混用。
8. 高级感交给字体、比例、留白（Georgia 衬线 + Courier 等宽）。
9. 错误"诚实地好看"：失败分类 + 原因，不用模糊的"处理中"掩盖。

## 参考库 ≠ 当前方向

- `references/`（参考库，只读，用于比较材质 / 构图 / 色彩）— 完整 Studio 风格快照放这里。
- `public/examples/<capability>/`（当前真正采用的产出示例）— 每个能力一个目录。
- 不要把整个参考库渲染进产品界面。

## Studio 风格库来源

- 来源 Space：`Studio_ArtStyle` `d95744b4-07f6-4836-8209-f1c6ece7658b`（Studio_Styles V1，33 个 active styles）
- 最相关的 4 个编辑部方向：`Minimalist` / `Three-Color Hardcut` / `Grainy Print` / `Blue-Black Print`
- 完整 33 个风格预览与 catalog 双文件索引存放在 `Product Hunt 小红书草稿台` Space 的
  `producthunt-cohub-xhs-work/style-reference/`（catalog.json 原始快照 + catalog.local.json 本地索引）。
