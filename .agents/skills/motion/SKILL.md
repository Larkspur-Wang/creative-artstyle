---
name: motion
description: >
  Motion Clip 能力。有镜头、节奏和声音的短片。当用户要做 POV 短视频、世界生活切片、
  小怪反视角、氛围短片时使用。模型 Seedance 2.0 Fast。核心方法是 6 格 POV 公式。
---

# Motion / Motion Clip

站点第 03 个能力。5 秒短片，16:9 / 9:16 / 1:1。

## 生成方式

- 模型：Seedance 2.0 Fast，`duration=5 resolution=720p generate_audio=true`。
- 控件：6 格 POV 公式（视角 / 限制 / 规则 / 错位 / 后果 / 锚点）+ 画幅。
- prompt 编译器：`src/capabilities.ts` 的 `compileMotionPrompt`（6 格留空则用 brief 直接生成）。
- 强调色 = 品红 `#d8567f`（`--cap-accent`）。

## 核心方法

见 `motion/pov-video-formula`：一个有视角限制的角色，在有规则的世界里，撞上错位，产生可见后果。
多段视频遵守"确认 N 段就交付 N 段 + 拼合版"契约。

## 硬约束

- 一个清晰开场帧 + 一个有动机的运镜 + 克制色调 + filmic grain + 安静收尾。
- 世界 3 秒内给第一轮反馈，不要前 7 秒纯蓄力。
- 禁止：logo、字幕、UI、CTA。

## 依赖

- 生成前：`_shared/content-quality-gate`。
- 找方向：`_shared/content-interaction-quadrant`。
- 失败处理：`_shared/generation-failure-recovery`（policy 卡审只重试一次，换 Kling）。

## example

`public/examples/motion/city-4am.mp4`（Seedance 实际生成，雨后凌晨城市）。
