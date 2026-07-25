# Creative Artstyle Skills

按站点能力分组。每个能力一个入口 SKILL，方法类 skill 放在它归属的能力下，跨能力通用的放 `_shared/`。

```text
.agents/skills/
├── poster/                     # 01 Zine Poster 能力入口
├── card/                       # 02 Visual Card 能力入口
├── motion/                     # 03 Motion Clip 能力入口
│   └── pov-video-formula/      # POV 6 格公式
├── web/                        # 04 Web / HTML 能力入口
│   ├── particle-text-engine/   # 文字→3D 点云粒子艺术
│   └── scrollytelling-map/     # d3 场景化叙事地图
├── deck/                       # 05 Deck / PPT 能力入口
└── _shared/                    # 跨能力通用方法
    ├── content-quality-gate/       # 生成前兴趣判断
    ├── content-interaction-quadrant/ # 四象限选题
    ├── editorial-visual-system/    # 编辑部视觉规范
    └── generation-failure-recovery/ # 失败分类降级
```

## 吸收来源

| skill | 来源 |
|---|---|
| content-quality-gate / content-interaction-quadrant / pov-video-formula / generation-failure-recovery | shanyue_内容生成 |
| editorial-visual-system | Studio_ArtStyle + 小红书卡片 session |
| particle-text-engine / scrollytelling-map | 漂亮前端交互 |

## 与 app 的对应

- 每个能力 SKILL 描述该能力在站点里的模型、控件、prompt 编译器和输出画框。
- `editorial-visual-system` → `src/styles.css`（色彩角色、纸张底、状态语法）。
- `pov-video-formula` → Motion 的 6 格输入（`src/capabilities.ts` motionStoryFields）。
- `generation-failure-recovery` → `src/App.tsx` 的 `classifyFailure`。
- `particle-text-engine` / `scrollytelling-map` → Web 能力可选的前端艺术技法。
