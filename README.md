# Creative Artstyle

一个共享创意工作台。五种能力，每一种都有**独立的生成方式、独立的控件、独立的输出画框和自己的
example**，不是同一套卡片换个名字。

发布为公开 Work：`lark / beautiful-skills / minimal-zine-poster`
（slug 沿用历史，标题已是 Creative Artstyle）。

## 五种能力

| # | 能力 | 模型 | 输入 | 输出画框 | example |
|---|---|---|---|---|---|
| 01 | Zine Poster | GPT Image 2 | 构图 / 锚点 / 文字 / 质感 / 情绪 / 强调色 | 竖版 3:5 | 6 张 |
| 02 | Visual Card | GPT Image 2 | 用途 / 强调色 / 短句 | 横版 3:2 | 1 张（生成） |
| 03 | Motion Clip | Seedance 2.0 Fast | 6 格 POV 公式 + 画幅 | 视频 16:9 | 1 条（生成） |
| 04 | Web / HTML | Space Agent | 产出类型 / 板块 | 浏览器画框 | 运行时产出 |
| 05 | Deck / PPT | Space Agent | 叙事结构 / 页数 / 观众 | 幻灯片画框 | 运行时产出 |

切换能力时，控件、输出画框、example、强调色（`--cap-accent`）全部随之改变。

## 目录

```text
creative-artstyle/
├── src/
│   ├── App.tsx           # 能力分离的工作台
│   ├── capabilities.ts   # 每个能力的元数据 + prompt 编译器
│   ├── prompt.ts         # 海报的丰富 recipe 编译器
│   └── styles.css        # 编辑部视觉系统 + 每个画框的样式与动效
├── public/examples/
│   ├── poster/  card/  motion/  web/  deck/   # 各能力自己的 example
├── references/
│   └── style-reference/  # Studio 风格库快照（只读参考，不进产品界面）
├── STYLE.md              # 视觉系统与色彩角色规范
└── dist/                 # 构建产物（发布用）
```

## 吸收来源

- `shanyue_内容生成`：内容质量闸门思路、POV 6 格公式、失败分类与降级。
- `Product Hunt 小红书草稿台` + `Studio_ArtStyle`：编辑部视觉系统、色彩角色制度、参考库 ≠ 当前方向。
- 详见 `STYLE.md`。

## 吸收进来的具体机制

- **能力分离**：每个能力独立视图，解决"点哪个都是卡片"。
- **6 格 POV 公式**（Motion）：视角 / 限制 / 规则 / 错位 / 后果 / 锚点。
- **失败分类**：`policy / timeout / channel / download`，每类给出下一步提示，而不是只报红。
- **色彩角色**：强调色只承担"当前能力"，风险色只承担错误，不混用。
- **参考库分离**：`references/`（只读灵感）与 `public/examples/`（真实产出）分开。

## 开发

```bash
npm install
npm run dev      # 本地预览
npm run build    # 构建到 dist/
```

## 归档到 Space

图片 / 视频生成后，用访客授权的 `session.prompt.fullaccess` 调 Space Agent 下载并写入
`generated-assets/<capability>/`，同时更新 `generated-assets/manifest.json`。Web / Deck 由 Agent
直接在 `generated-projects/<capability>/` 下创建可交付文件。owner token 不进前端。
