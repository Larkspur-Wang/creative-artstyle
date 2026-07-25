export type LayoutId =
  | "center-fragment"
  | "lower-left-float"
  | "upper-right-block"
  | "dual-panel"
  | "irregular-cutout"
  | "type-led";

export type Recipe = {
  layout: LayoutId;
  anchor: string;
  typography: string;
  accent: string;
  texture: string;
  mood: string;
};

export type PosterBrief = Recipe & {
  theme: string;
  phrase: string;
};

export const layouts = [
  { id: "center-fragment" as const, label: "中央碎片" },
  { id: "lower-left-float" as const, label: "左下漂浮" },
  { id: "upper-right-block" as const, label: "右上色块" },
  { id: "dual-panel" as const, label: "双联画" },
  { id: "irregular-cutout" as const, label: "不规则裁片" },
  { id: "type-led" as const, label: "文字主导" },
];

export const anchors = [
  { id: "faded-photo", label: "褪色照片", prompt: "a tiny faded grayscale photograph" },
  { id: "torn-clipping", label: "撕纸剪贴", prompt: "a torn-paper clipping" },
  { id: "flat-silhouette", label: "平面剪影", prompt: "a flat printed silhouette" },
  { id: "printed-illustration", label: "旧书插图", prompt: "an old printed illustration specimen" },
  { id: "object-specimen", label: "物件标本", prompt: "an isolated object specimen" },
  { id: "texture-window", label: "纹理窗口", prompt: "a small abstract texture window" },
];

export const typographyModes = [
  { id: "edge-phrase", label: "贴边短句", prompt: "the phrase pressed lightly against the image edge" },
  { id: "archive", label: "档案微字", prompt: "archive microtext with a tiny date and weather notation" },
  { id: "floating", label: "字母漂浮", prompt: "fragmented floating letters around the cluster" },
  { id: "ghost", label: "灰色幽灵字", prompt: "low-contrast gray ghost text and one tiny caption" },
  { id: "letterpress", label: "活版标题", prompt: "a short headline used as an object in rough letterpress" },
  { id: "minimal", label: "近乎无字", prompt: "almost textless, with only one tiny caption" },
];

export const accents = [
  { id: "cobalt", label: "钴蓝", hex: "#1749e6", prompt: "fully saturated cobalt-blue risograph ink" },
  { id: "lemon", label: "柠檬黄", hex: "#f1d51a", prompt: "opaque lemon-yellow printed block" },
  { id: "tomato", label: "番茄红", hex: "#e43f2f", prompt: "clean tomato-red printed cutout" },
  { id: "pear", label: "梨绿", hex: "#82bd22", prompt: "vivid pear-green flat silhouette" },
  { id: "magenta", label: "洋红", hex: "#dc2d82", prompt: "saturated magenta-pink risograph ink" },
  { id: "orange", label: "橘色", hex: "#ef7b23", prompt: "opaque bright-orange paper cutout" },
];

export const textures = [
  { id: "xerox", label: "复印柔化", prompt: "xerox softness, light toner wear" },
  { id: "risograph", label: "孔版颗粒", prompt: "risograph grain and slight ink misregistration" },
  { id: "halftone", label: "半调网点", prompt: "halftone degradation and subtle scan noise" },
  { id: "letterpress", label: "活版渗墨", prompt: "letterpress ink bleed on absorbent paper" },
  { id: "fiber", label: "纸张纤维", prompt: "visible paper fibers, fine scan noise" },
  { id: "mottled", label: "陈旧斑驳", prompt: "aged paper mottling and faint print wear" },
];

export const moods = [
  { id: "quiet", label: "安静", phrase: "THE QUIET BETWEEN" },
  { id: "memory", label: "记忆", phrase: "A SOFT REMAINDER" },
  { id: "seaside", label: "海边", phrase: "TIDE, THEN STILL" },
  { id: "night", label: "夜晚", phrase: "AFTER THE LIGHT" },
  { id: "summer", label: "夏日", phrase: "A SLOW AFTERNOON" },
  { id: "solitude", label: "独处", phrase: "ONLY THIS MOMENT" },
  { id: "surreal", label: "轻微超现实", phrase: "NEAR, BUT ELSEWHERE" },
];

const layoutPrompts: Record<LayoutId, string> = {
  "center-fragment": "centered with a small fragment floating near the middle",
  "lower-left-float": "floating in the lower-left quadrant with a vast empty upper field",
  "upper-right-block": "held in the upper-right area with loose text drifting inward",
  "dual-panel": "formed as two small adjacent panels with a narrow uneven gap",
  "irregular-cutout": "carried by one irregular torn paper shape around the lower middle",
  "type-led": "organized around a small type-led cluster near the middle, with the image secondary",
};

function optionPrompt<T extends { id: string; prompt: string }>(items: T[], id: string) {
  return items.find((item) => item.id === id)?.prompt ?? items[0].prompt;
}

export function fallbackPhrase(mood: string) {
  return moods.find((item) => item.id === mood)?.phrase ?? moods[0].phrase;
}

export function compilePrompt(brief: PosterBrief) {
  const phrase = brief.phrase.trim() || fallbackPhrase(brief.mood);
  const anchor = optionPrompt(anchors, brief.anchor);
  const typography = optionPrompt(typographyModes, brief.typography);
  const accent = optionPrompt(accents, brief.accent);
  const texture = optionPrompt(textures, brief.texture);
  const mood = moods.find((item) => item.id === brief.mood)?.label ?? "安静";

  return `Tall vertical 3:5 phone poster, full-frame warm-gray aged matte paper, flat orthographic scanned-paper surface, no border and no mockup. Keep 78%-86% of the canvas as quiet plain paper. Build one compact visual cluster occupying about 12%-18% of the frame, ${layoutPrompts[brief.layout]}, never touching an edge.

Interpret the theme "${brief.theme.trim()}" as one concrete poetic visual metaphor using ${anchor}. Keep the subject isolated and small; render supporting imagery in soft grayscale with subdued contrast, softened or torn edges, and physical old-print imperfections. Do not illustrate a complete scene.

Use small serif, typewriter, or monospaced typography: ${typography}. Include exactly one short readable phrase: "${phrase}"; any other marks are semi-legible archive microtext only. Add ${accent} as the single unmistakable high-chroma anchor, occupying about 1.5%-2% of the whole canvas or 20%-30% of the cluster, solid enough to remain visible at thumbnail size. Apply ${texture}, restrained ink bleed, and a slight analog registration error without weakening the saturated color anchor.

The emotional temperature is ${mood}: quiet, poetic, nostalgic, sparse, diary-like, archival, and reminiscent of an independent Japanese or Korean art zine. Diffuse flat light, low-to-medium contrast, no hard shadow and no 3D depth. Avoid full-bleed scenes, commercial headline hierarchy, product advertising, logos, CTA, glossy mockups, clean digital UI white, cinematic lighting, depth of field, neon, cyberpunk, cute cartoons, anime, fashion editorial drama, dense scrapbooks, multiple accent colors, stock-photo realism, and long perfectly readable text blocks.`;
}

export function randomRecipe(current: Recipe): Recipe {
  const pickDifferent = <T extends { id: string }>(items: T[], value: string) => {
    const pool = items.filter((item) => item.id !== value);
    return pool[Math.floor(Math.random() * pool.length)]?.id ?? value;
  };

  return {
    layout: pickDifferent(layouts, current.layout) as LayoutId,
    anchor: pickDifferent(anchors, current.anchor),
    typography: pickDifferent(typographyModes, current.typography),
    accent: pickDifferent(accents, current.accent),
    texture: pickDifferent(textures, current.texture),
    mood: pickDifferent(moods, current.mood),
  };
}
