# Creative Commons Skills

从其他 space 吸收、并整理成可独立迁移的 skill。每个 skill 自包含，不依赖特定 IP、模型或绝对路径。

| skill | 作用 | 吸收来源 |
|---|---|---|
| content-quality-gate | 生成前的兴趣成立性判断 | shanyue_内容生成 |
| content-interaction-quadrant | 四象限选题 / 找内容方向 | shanyue_内容生成（内容地图 + 欧美内容生成器） |
| pov-video-formula | POV 短视频 6 格公式 + 多段交付契约 | shanyue_内容生成（pov-video-workflows） |
| generation-failure-recovery | 生成失败分类与降级 | shanyue_内容生成 生产日报 |
| editorial-visual-system | 编辑部风格 UI / 卡片视觉系统 | Studio_ArtStyle + 小红书卡片 session |
| particle-text-engine | 文字/主题 → 3D 点云粒子艺术 | 漂亮前端交互（particle-works） |
| scrollytelling-map | d3 场景化叙事地图 / 数据故事 | 漂亮前端交互（world-anime-map） |

## 与 app 的关系

- `editorial-visual-system` 已落进 `src/styles.css`（色彩角色、纸张底、状态视觉语法）。
- `pov-video-formula` 的 6 格已落进 Motion 能力的输入（`src/capabilities.ts` 的 motionStoryFields）。
- `generation-failure-recovery` 的分类已落进 `src/App.tsx` 的 `classifyFailure`。
- `content-quality-gate` 与 `content-interaction-quadrant` 目前是方法文档，尚未做成 UI（下一步可做 Explore/Idea Lab 入口）。
