# Studio Style Reference

这是 `Studio_ArtStyle` / `Studio_Styles` V1 的完整本地参考库，供小红书自动发布工作流的卡片设计、视觉探索和后续组件迭代使用。

- 来源 Space：`d95744b4-07f6-4836-8209-f1c6ece7658b`
- 来源版本：`Studio_Styles V1`
- 风格数量：33 个 active styles
- 目录快照：`catalog.json`
- 本地索引：`catalog.local.json`
- 预览图：`previews/<series>/<internal_id>.png`

## 目录结构

```text
style-reference/
├── README.md
├── catalog.json          # 来源目录快照，保留原始字段
├── catalog.local.json    # 增加 local_reference 的本地索引
├── style-notes.md
└── previews/
    ├── AN/               # 动漫，8 个
    ├── 3D/               # 3D，6 个
    ├── IL/               # 插画，5 个
    ├── SK/               # 素描，6 个
    ├── GR/               # 图形，5 个
    ├── PT/               # 绘画，2 个
    └── SP/               # 特殊，1 个
```

## 使用方式

- `catalog.json` 用于保留 Studio 风格库的原始风格描述、边界和公开预览地址。
- `catalog.local.json` 用于本地工具或设计页面直接定位预览图。
- `previews/` 只作为设计参考资产，不默认直接渲染到产品界面。
- 当前工作流的精选方向仍建议记录在 `style-notes.md`，不要把完整风格库误当成单一产品主题。

## 重要说明

这些预览图是风格参考，不是要求把所有风格拼接到同一套 UI 中。产品界面仍应保持一套稳定的卡片骨架；完整风格库用于比较材质、构图、色彩、媒介和视觉语气。

