import { compilePrompt, type Recipe } from "./prompt";

export type CapabilityId = "poster" | "card" | "motion" | "web" | "deck";

export type FrameKind = "portrait" | "landscape" | "video" | "browser" | "slides";

export type OutputKind = "image" | "video" | "code";

export type CapabilityMeta = {
  id: CapabilityId;
  index: string;
  label: string;
  family: string;
  tagline: string;
  description: string;
  model: string;
  action: string;
  tone: string;
  accent: string;
  frame: FrameKind;
  output: OutputKind;
  ratioLabel: string;
};

// The editorial palette absorbed from the Studio style-reference direction:
// paper base, ink black, cool blue-gray, one accent color role per capability.
export const capabilities: CapabilityMeta[] = [
  {
    id: "poster",
    index: "01",
    label: "Zine Poster",
    family: "VISUAL",
    tagline: "留白纸张与一处高饱和色",
    description: "旧纸、大量留白、微小锚点，一处不容错过的高饱和印刷色。竖版 3:5。",
    model: "GPT Image 2",
    action: "生成海报",
    tone: "yellow",
    accent: "#e9d622",
    frame: "portrait",
    output: "image",
    ratioLabel: "1024 × 1536",
  },
  {
    id: "card",
    index: "02",
    label: "Visual Card",
    family: "VISUAL",
    tagline: "有设计感的横版内容卡",
    description: "社交、品牌、产品或语录卡。清晰焦点、克制强调色、编辑级排版。横版 3:2。",
    model: "GPT Image 2",
    action: "生成卡片",
    tone: "blue",
    accent: "#3f6ad8",
    frame: "landscape",
    output: "image",
    ratioLabel: "1536 × 1024",
  },
  {
    id: "motion",
    index: "03",
    label: "Motion Clip",
    family: "MOTION",
    tagline: "有镜头、节奏和声音的短片",
    description: "用 6 格 POV 公式把一个想法写成短片：视角、限制、规则、错位、后果、锚点。",
    model: "Seedance 2.0 Fast",
    action: "生成短片",
    tone: "pink",
    accent: "#d8567f",
    frame: "video",
    output: "video",
    ratioLabel: "5s / 720p",
  },
  {
    id: "web",
    index: "04",
    label: "Web / HTML",
    family: "BUILD",
    tagline: "可运行的网页与落地页",
    description: "从一句 brief 创建真正可运行的响应式网页、落地页或互动原型，由 Space Agent 交付。",
    model: "Space Agent",
    action: "创建网页",
    tone: "green",
    accent: "#4f9d69",
    frame: "browser",
    output: "code",
    ratioLabel: "HTML / 响应式",
  },
  {
    id: "deck",
    index: "05",
    label: "Deck / PPT",
    family: "BUILD",
    tagline: "可编辑的演示与视觉叙事",
    description: "把观点整理成有章节、层级和视觉叙事的演示文稿，由 Space Agent 交付可编辑文件。",
    model: "Space Agent",
    action: "创建 Deck",
    tone: "orange",
    accent: "#d6863a",
    frame: "slides",
    output: "code",
    ratioLabel: "16:9 / 多页",
  },
];

export function getCapability(id: CapabilityId) {
  return capabilities.find((item) => item.id === id) ?? capabilities[0];
}

// ---- Card ----
export const cardPurposes = [
  { id: "lifestyle", label: "生活方式", prompt: "a calm lifestyle concept card" },
  { id: "brand", label: "品牌视觉", prompt: "a refined brand statement card" },
  { id: "product", label: "产品卡", prompt: "a minimal product highlight card" },
  { id: "quote", label: "语录卡", prompt: "an editorial quote card" },
];

export const cardAccents = [
  { id: "vermilion", label: "朱砂", hex: "#d8492f" },
  { id: "cobalt", label: "钴蓝", hex: "#3f6ad8" },
  { id: "ink", label: "墨黑", hex: "#26282b" },
  { id: "moss", label: "苔绿", hex: "#4f9d69" },
];

export function compileCardPrompt(brief: string, line: string, purpose: string, accent: string) {
  const p = cardPurposes.find((x) => x.id === purpose) ?? cardPurposes[0];
  const a = cardAccents.find((x) => x.id === accent) ?? cardAccents[0];
  return `Editorial visual card, landscape 3:2. Build ${p.prompt} about "${brief.trim()}". Use one clear focal metaphor, generous negative space, a refined serif + mono type hierarchy on a warm paper ground, subtle risograph grain, and exactly one restrained accent in ${a.label} (${a.hex}). Include only this short readable line: "${(line || "A SMALL PAUSE").trim()}". Keep it premium and art-directed. Avoid generic social templates, crowded layouts, stock-photo cliches, logos, CTA buttons, gradients, and long text.`;
}

// ---- Motion: the 6-cell POV formula absorbed from pov-video-workflows ----
export type MotionStory = {
  viewpoint: string;
  limit: string;
  rule: string;
  mismatch: string;
  consequence: string;
  anchor: string;
};

export const motionStoryFields: { key: keyof MotionStory; label: string; hint: string; placeholder: string }[] = [
  { key: "viewpoint", label: "视角身份", hint: "谁在看", placeholder: "凌晨的城市清洁工" },
  { key: "limit", label: "视角限制", hint: "只能看到 / 不知道什么", placeholder: "只看得到自己脚下那条街" },
  { key: "rule", label: "世界规则", hint: "这个世界怎么运转", placeholder: "城市在天亮前必须被重置干净" },
  { key: "mismatch", label: "错位事件", hint: "预期和现实哪里撞上", placeholder: "以为是普通一天，霓虹却开始倒放" },
  { key: "consequence", label: "可见后果", hint: "画面最终证明什么", placeholder: "街道被光重新点亮" },
  { key: "anchor", label: "识别锚点", hint: "一秒认出的道具 / 地点", placeholder: "积水倒影、蒸汽格栅、旧霓虹招牌" },
];

export const emptyMotionStory: MotionStory = {
  viewpoint: "",
  limit: "",
  rule: "",
  mismatch: "",
  consequence: "",
  anchor: "",
};

export const motionRatios = [
  { id: "16:9", label: "横版 16:9" },
  { id: "9:16", label: "竖版 9:16" },
  { id: "1:1", label: "方形 1:1" },
];

export function compileMotionPrompt(brief: string, story: MotionStory, ratio: string) {
  const filled = Object.values(story).some((v) => v.trim());
  if (!filled) {
    return `Short atmospheric cinematic clip, ${ratio}. ${brief.trim()}. Establish a clear opening frame, one elegant camera movement, a restrained color script, tactile filmic grain, and a quiet ending beat. Art-directed and emotionally precise, never a stock clip. No logos, subtitles, UI, or CTA.`;
  }
  return [
    `Short cinematic POV clip, ${ratio}, filmic grain, art-directed and emotionally precise.`,
    story.viewpoint && `Viewpoint: ${story.viewpoint.trim()}.`,
    story.limit && `They can only perceive: ${story.limit.trim()}.`,
    story.rule && `World rule: ${story.rule.trim()}.`,
    story.mismatch && `The mismatch: ${story.mismatch.trim()}.`,
    story.consequence && `Visible consequence by the end: ${story.consequence.trim()}.`,
    story.anchor && `Recognition anchors kept in frame: ${story.anchor.trim()}.`,
    brief.trim() && `Overall brief: ${brief.trim()}.`,
    `One clear opening frame, one motivated camera move, restrained color, quiet ending beat. No logos, subtitles, UI, or CTA.`,
  ]
    .filter(Boolean)
    .join(" ");
}

// ---- Web ----
export const webKinds = [
  { id: "landing", label: "落地页" },
  { id: "portfolio", label: "作品集" },
  { id: "prototype", label: "互动原型" },
  { id: "microsite", label: "微站点" },
];

export function compileWebPrompt(brief: string, kind: string, sections: string) {
  const k = webKinds.find((x) => x.id === kind) ?? webKinds[0];
  return [
    `你是 Creative Artstyle 的制作 Agent。请使用工具直接创建最终可运行文件，不要只回复方案。`,
    `需求：${brief.trim()}`,
    `产出类型：${k.label}（响应式 HTML，单文件优先，内联 CSS，无需构建即可打开）。`,
    sections.trim() && `需要包含的板块：${sections.trim()}。`,
    `视觉方向：安静、编辑感、当代、纸张底 + 墨黑 + 一个克制强调色，good typography，明显但不喧哗的动效。`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ---- Deck ----
export const deckArcs = [
  { id: "pitch", label: "提案 / Pitch" },
  { id: "story", label: "叙事 / Story" },
  { id: "report", label: "汇报 / Report" },
  { id: "teach", label: "讲解 / Teach" },
];

export function compileDeckPrompt(brief: string, audience: string, slides: number, arc: string) {
  const a = deckArcs.find((x) => x.id === arc) ?? deckArcs[0];
  return [
    `你是 Creative Artstyle 的制作 Agent。请使用工具直接创建最终可编辑演示文稿，不要只回复方案。`,
    `主题：${brief.trim()}`,
    audience.trim() && `目标观众：${audience.trim()}。`,
    `叙事结构：${a.label}，约 ${slides} 页，有清晰章节、层级和视觉叙事。`,
    `视觉方向：16:9，编辑感排版，纸张底 + 墨黑 + 一个克制强调色，每页只承载一个核心信息。`,
  ]
    .filter(Boolean)
    .join("\n");
}

// Poster reuses the rich recipe compiler from prompt.ts
export function compilePosterPrompt(brief: string, phrase: string, recipe: Recipe) {
  return compilePrompt({ theme: brief, phrase, ...recipe });
}

export const starterBriefs: Record<CapabilityId, string> = {
  poster: "雨天里快要打烊的旧书店",
  card: "慢下来，给自己留一点空气的生活方式",
  motion: "雨后的城市在凌晨四点慢慢恢复呼吸",
  web: "给独立设计师的安静作品集首页",
  deck: "向团队介绍一个关于城市夜间生活的文化项目",
};

export const examplesByCapability: Record<CapabilityId, { name: string; src: string; kind: string }[]> = {
  poster: [
    { name: "Rain Bookshop", src: "./examples/poster/generated-rain-bookshop.png", kind: "GPT" },
    { name: "Yellow Step", src: "./examples/poster/yellow-step.jpeg", kind: "ZINE" },
    { name: "Moon Tide", src: "./examples/poster/moon-tide.jpeg", kind: "ZINE" },
    { name: "Night Door", src: "./examples/poster/night-door.jpeg", kind: "ZINE" },
    { name: "Pause Map", src: "./examples/poster/pause-map.jpeg", kind: "ZINE" },
    { name: "Shore Pause", src: "./examples/poster/shore-pause.jpeg", kind: "ZINE" },
  ],
  card: [{ name: "Make Room For Air", src: "./examples/card/make-room-for-air.png", kind: "GPT" }],
  motion: [{ name: "City, 4AM", src: "./examples/motion/city-4am.mp4", kind: "SEEDANCE" }],
  web: [],
  deck: [],
};
