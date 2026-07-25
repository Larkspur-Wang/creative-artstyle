import { useEffect, useMemo, useRef, useState } from "react";
import { createCohubClient } from "@neta-art/cohub";
import ParticleField from "./ParticleField";
import {
  Archive,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Film,
  Image as ImageIcon,
  LayoutDashboard,
  Dices,
  LoaderCircle,
  Palette,
  Presentation,
  RotateCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import {
  accents,
  anchors,
  layouts,
  moods,
  randomRecipe,
  textures,
  typographyModes,
  type Recipe,
} from "./prompt";
import {
  capabilities,
  cardAccents,
  cardPurposes,
  compileCardPrompt,
  compileDeckPrompt,
  compileMotionPrompt,
  compilePosterPrompt,
  compileWebPrompt,
  deckArcs,
  emptyMotionStory,
  examplesByCapability,
  getCapability,
  motionRatios,
  motionStoryFields,
  starterBriefs,
  webKinds,
  type CapabilityId,
  type MotionStory,
} from "./capabilities";

const WORK_IDENTITY = {
  ownerUsername: "lark",
  spaceSlug: "beautiful-skills",
  workSlug: "creative-artstyle",
};

const isDevWork =
  location.pathname.startsWith("/dev/") || location.hostname.includes("dev");

const client = createCohubClient({
  env: isDevWork ? "dev" : "prod",
  work: {
    brokerOrigin: isDevWork ? "https://dev.cohub.run" : "https://cohub.run",
    ...WORK_IDENTITY,
  },
});

const iconFor: Record<CapabilityId, typeof Palette> = {
  poster: Palette,
  card: ImageIcon,
  motion: Film,
  web: Code2,
  deck: Presentation,
};

type Stage = "idle" | "authorizing" | "queued" | "running" | "archiving" | "done" | "error";
type FailureKind = "policy" | "timeout" | "channel" | "download" | "auth" | "unknown";
type Preview = {
  src: string;
  name: string;
  kind: string;
  output: "image" | "video" | "code";
  generated: boolean;
};

const initialRecipe: Recipe = {
  layout: "dual-panel",
  anchor: "faded-photo",
  typography: "archive",
  accent: "lemon",
  texture: "risograph",
  mood: "memory",
};

const stageLabel: Record<Stage, string> = {
  idle: "Ready to make",
  authorizing: "Requesting access",
  queued: "In the queue",
  running: "Making",
  archiving: "Saving to Space",
  done: "Saved to Space",
  error: "Needs attention",
};

// House voice for generated briefs: concrete scenes, not marketing register.
const COPY_SYSTEM_PROMPT = [
  "你是一个中文创作命题作者，为一个安静、克制的视觉工作室写创作命题。",
  "规则：",
  "1. brief 是一个具体的场景或瞬间，不是抽象概念。写看得见的东西：地点、时间、天气、一个动作。",
  "2. brief 控制在 8 到 20 个汉字，不要用标点结尾。",
  "3. 禁止营销腔和口号腔，不要“赋能”“沉浸式”“探索无限可能”这类词。",
  "4. 不要堆形容词，用事实让情绪自己出现。",
  "5. phrase 是印在画面上的一行字：英文全大写，2 到 5 个词，不要句号。",
  "6. phrase 不是 brief 的直译，它是另一个角度的旁白。",
  "好例子：brief=“雨天里快要打烊的旧书店”，phrase=“THE RAIN REMEMBERS”。",
  "坏例子：brief=“探索城市美学的无限可能”，抽象且是营销腔。",
].join("\n");

const copyTaskByCapability: Record<CapabilityId, string> = {
  poster: "写一个适合做成安静艺术海报的场景命题。",
  card: "写一个适合做成横版生活方式卡片的场景命题，偏日常与呼吸感。",
  motion: "写一个适合拍成 5 秒短片的场景命题，要有一个可见的动作或变化。",
  web: "写一个适合做成网页首页的项目命题，说清是给谁做的什么站点。",
  deck: "写一个适合做成演示文稿的主题命题，说清要向谁讲什么。",
};

// Failure classification absorbed from shanyue production daily-reports.
function classifyFailure(message: string): { kind: FailureKind; hint: string } {
  const m = message.toLowerCase();
  // Authorization popup issues hit visitors first: the SDK opens cohub.run/work-auth
  // in a 480x640 popup, so blockers and early closes are the common failure mode.
  if (m.includes("allow popups") || m.includes("failed to open authorization window")) {
    return { kind: "auth", hint: "浏览器拦下了授权弹窗。请允许本站弹窗（地址栏右侧图标）后重试。" };
  }
  if (m.includes("authorization window was closed")) {
    return { kind: "auth", hint: "授权窗口被关闭了。再点一次，在弹窗里完成登录并同意授权。" };
  }
  if (m.includes("did not respond in time")) {
    return { kind: "auth", hint: "授权窗口没有响应。检查网络后重试，或先在 cohub.run 登录再回来。" };
  }
  if (m.includes("no allowed scopes") || m.includes("broker mode")) {
    return { kind: "auth", hint: "这个页面需要从 Cohub 站内打开才能生成。请通过 Work 页面访问，不要直接打开资源链接。" };
  }
  if (m.includes("policy") || m.includes("sensitive") || m.includes("版权") || m.includes("copyright")) {
    return { kind: "policy", hint: "内容审核拦截。换一个说法，降低 IP 识别度，或改成不露正脸的表达。" };
  }
  if (m.includes("timeout") || m.includes("超时") || m.includes("504")) {
    return { kind: "timeout", hint: "服务端等待超时。任务可能仍在跑，稍后重试，不必反复重开。" };
  }
  if (m.includes("channel") || m.includes("渠道") || m.includes("not available") || m.includes("不可用")) {
    return { kind: "channel", hint: "模型通道暂时不可用。稍后重试或切换到备用模型。" };
  }
  if (m.includes("download") || m.includes("下载") || m.includes("媒体")) {
    return { kind: "download", hint: "生成成功但结果没取回。重试一次通常能拿到。" };
  }
  return { kind: "unknown", hint: message };
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="field compact-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function getMediaSource(block: unknown) {
  const source = (block as { source?: { type?: string; url?: string; mediaType?: string; data?: string } })?.source;
  if (!source) return null;
  if (source.type === "url" && source.url) return source.url;
  if (source.type === "base64" && source.mediaType && source.data) {
    return `data:${source.mediaType};base64,${source.data}`;
  }
  return null;
}

async function getSpaceId() {
  const context = await client.context();
  if (context?.space?.id) return context.space.id;
  const detail = await client.works.getBySlug(
    WORK_IDENTITY.ownerUsername,
    WORK_IDENTITY.spaceSlug,
    WORK_IDENTITY.workSlug,
  );
  return detail.work.spaceId;
}

async function resolveGenerationModel(preferred: string) {
  const catalog = await client.models.listMultimodal();
  const model = catalog.models.find((entry) => entry.model === preferred);
  if (!model) throw new Error(`${preferred} 当前不可用，请稍后重试。`);
  return model.model;
}

// Copy writing runs on a fast text model so the button stays responsive.
// Order is from measured latency + output quality against the real prompt:
// claude-sonnet-5 ~2s, deepseek-v4-flash 5-11s. Both gemini entries currently
// 502 on this endpoint ("abortSignal.addEventListener is not a function") and
// qwen3.7-plus returns empty content, so neither is listed.
const COPY_MODEL_PREFERENCE = [
  "claude-sonnet-5",
  "deepseek-v4-flash",
  "glm-5.2",
  "gpt-5.6-luna",
];

async function resolveCopyModel() {
  const catalog = await client.models.list();
  const entries = Object.values(catalog).flat();
  const ids = new Set(entries.map((entry) => entry.id));
  const preferred = COPY_MODEL_PREFERENCE.find((id) => ids.has(id));
  if (preferred) return preferred;
  const first = entries[0]?.id;
  if (!first) throw new Error("当前没有可用的文本模型。");
  return first;
}

/** Pull the first JSON object out of a model reply, tolerating code fences and prose. */
function parseCopyReply(raw: string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? raw).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(candidate.slice(start, end + 1)) as {
      brief?: unknown;
      phrase?: unknown;
    };
    const brief = typeof parsed.brief === "string" ? parsed.brief.trim() : "";
    const phrase = typeof parsed.phrase === "string" ? parsed.phrase.trim() : "";
    if (!brief) return null;
    return { brief, phrase };
  } catch {
    return null;
  }
}

async function waitForTurn(
  space: ReturnType<typeof client.space>,
  sessionId: string,
  turnId: string,
) {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const response = await space.session(sessionId).turns.get(turnId);
    const turn = response.turn;
    if (turn.status === "completed") return turn.assistantText ?? "";
    if (["failed", "cancelled"].includes(turn.status)) {
      throw new Error(turn.errorMessage || "Space Agent 没有完成这个任务。");
    }
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
  }
  throw new Error("Space Agent 等待超时，请稍后在 Space 中检查任务。");
}

function safeName(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "untitled"
  );
}

function App() {
  const [capId, setCapId] = useState<CapabilityId>("poster");
  const [brief, setBrief] = useState(starterBriefs.poster);
  const [phrase, setPhrase] = useState("THE RAIN REMEMBERS");
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [quality, setQuality] = useState("medium");
  // card
  const [cardPurpose, setCardPurpose] = useState(cardPurposes[0].id);
  const [cardAccent, setCardAccent] = useState(cardAccents[0].id);
  // motion
  const [story, setStory] = useState<MotionStory>(emptyMotionStory);
  const [videoRatio, setVideoRatio] = useState("16:9");
  // web / deck
  const [webKind, setWebKind] = useState(webKinds[0].id);
  const [webSections, setWebSections] = useState("");
  const [deckArc, setDeckArc] = useState(deckArcs[0].id);
  const [deckAudience, setDeckAudience] = useState("");
  const [deckSlides, setDeckSlides] = useState(8);

  const cap = getCapability(capId);
  const examples = examplesByCapability[capId];
  const [preview, setPreview] = useState<Preview>(() => {
    const first = examplesByCapability.poster[0];
    return { src: first.src, name: first.name, kind: first.kind, output: "image", generated: false };
  });
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");
  const [failure, setFailure] = useState<FailureKind | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [archivePath, setArchivePath] = useState("");
  const [copyBusy, setCopyBusy] = useState(false);
  const [copyError, setCopyError] = useState("");

  const generatedPrompt = useMemo(() => {
    switch (capId) {
      case "poster":
        return compilePosterPrompt(brief, phrase, recipe);
      case "card":
        return compileCardPrompt(brief, phrase, cardPurpose, cardAccent);
      case "motion":
        return compileMotionPrompt(brief, story, videoRatio);
      case "web":
        return compileWebPrompt(brief, webKind, webSections);
      case "deck":
        return compileDeckPrompt(brief, deckAudience, deckSlides, deckArc);
    }
  }, [capId, brief, phrase, recipe, cardPurpose, cardAccent, story, videoRatio, webKind, webSections, deckAudience, deckSlides, deckArc]);

  const chooseCapability = (next: CapabilityId) => {
    setCapId(next);
    setBrief(starterBriefs[next]);
    setError("");
    setFailure(null);
    setArchivePath("");
    setStage("idle");
    if (next === "poster") setPhrase("THE RAIN REMEMBERS");
    if (next === "card") setPhrase("MAKE ROOM FOR AIR");
    const ex = examplesByCapability[next][0];
    if (ex) {
      setPreview({
        src: ex.src,
        name: ex.name,
        kind: ex.kind,
        output: getCapability(next).output,
        generated: false,
      });
    } else {
      setPreview({ src: "", name: starterBriefs[next], kind: getCapability(next).label, output: "code", generated: false });
    }
  };

  const updateRecipe = (key: keyof Recipe, value: string) => setRecipe((c) => ({ ...c, [key]: value } as Recipe));
  const updateStory = (key: keyof MotionStory, value: string) => setStory((c) => ({ ...c, [key]: value }));

  /**
   * Ask a text model for a fresh brief (and short line where the capability uses one).
   * Runs on the backend via the space completion endpoint so the copy is genuinely
   * new each time instead of cycling a hardcoded list.
   */
  const writeCopy = async () => {
    if (copyBusy) return;
    setCopyBusy(true);
    setCopyError("");
    try {
      const approved = await client.auth.request({
        scopes: ["session.prompt.fullaccess"],
        reason: "用后端模型为你写一组新的创作命题。",
      });
      if (!approved) {
        setCopyError("需要授权才能让后端帮你写文案。");
        return;
      }
      const spaceId = await getSpaceId();
      if (!spaceId) throw new Error("无法识别当前 Works 空间。");
      const model = await resolveCopyModel();
      const wantsPhrase = capId === "poster" || capId === "card";
      const result = await client.space(spaceId).completion({
        model,
        temperature: 1,
        maxTokens: 400,
        thinkingLevel: "off",
        messages: [
          {
            role: "system",
            content: [{ type: "text", text: COPY_SYSTEM_PROMPT }],
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: [
                  copyTaskByCapability[capId],
                  `随机种子：${Math.random().toString(36).slice(2, 10)}（用它让结果与往次不同）。`,
                  `避开这个已有的命题：“${brief.trim() || "（空）"}”。`,
                  wantsPhrase
                    ? '返回 JSON：{"brief": "...", "phrase": "..."}'
                    : '返回 JSON：{"brief": "..."}',
                  "只输出 JSON，不要任何解释。",
                ].join("\n"),
              },
            ],
          },
        ],
      });
      const text = result.message.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("")
        .trim();
      const parsed = parseCopyReply(text);
      if (!parsed) throw new Error("模型返回的内容无法解析。再试一次。");
      setBrief(parsed.brief.slice(0, 280));
      if (wantsPhrase && parsed.phrase) setPhrase(parsed.phrase.slice(0, 48).toUpperCase());
    } catch (caught) {
      setCopyError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setCopyBusy(false);
    }
  };

  /** Remix everything: new copy from the model plus a new art direction. */
  const remixAll = async () => {
    setRecipe(randomRecipe(recipe));
    await writeCopy();
  };

  const reset = () => chooseCapability("poster");

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const archiveMedia = async (spaceId: string, url: string, extension: "png" | "mp4") => {
    const space = client.space(spaceId);
    const path = `generated-assets/${capId}/${Date.now()}-${safeName(brief)}.${extension}`;
    const result = await space.prompt({
      content: [
        {
          type: "text",
          text: `请使用你的工具完成归档，不要只给建议。下载这个已经生成的媒体文件：${url}\n将它保存到当前 Space 的 ${path}。同时在 generated-assets/manifest.json 追加一条 JSON 记录，包含 path、title、capability、createdAt。完成后只需在回复最后输出：ARCHIVED_PATH: ${path}`,
        },
      ],
      sessionId: null,
      intent: "followup",
    });
    if (result.mode !== "immediate") throw new Error("Space Agent 任务没有立即启动。");
    const reply = await waitForTurn(space, result.session.id, result.turn.id);
    return reply.match(/ARCHIVED_PATH:\s*([^\n]+)/i)?.[1]?.trim() || path;
  };

  const createProject = async (spaceId: string) => {
    const space = client.space(spaceId);
    const folder = `generated-projects/${capId}/${Date.now()}-${safeName(brief)}`;
    const deliverable = capId === "web" ? `${folder}/index.html` : `${folder}/deck.html`;
    const result = await space.prompt({
      content: [{ type: "text", text: `${generatedPrompt}\n\n输出到 ${deliverable}，并生成 ${folder}/README.md。完成后在回复最后输出：DELIVERABLE_PATH: ${deliverable}` }],
      sessionId: null,
      intent: "followup",
    });
    if (result.mode !== "immediate") throw new Error("Space Agent 任务没有立即启动。");
    const reply = await waitForTurn(space, result.session.id, result.turn.id);
    return reply.match(/DELIVERABLE_PATH:\s*([^\n]+)/i)?.[1]?.trim() || deliverable;
  };

  const generate = async () => {
    if (!brief.trim()) {
      setError("请先写一个 brief。");
      return;
    }
    setError("");
    setFailure(null);
    setArchivePath("");
    setStage("authorizing");

    try {
      const isMedia = capId === "poster" || capId === "card" || capId === "motion";
      const scopes = isMedia
        ? (["generation.create", "session.prompt.fullaccess"] as const)
        : (["session.prompt.fullaccess"] as const);
      const approved = await client.auth.request({
        scopes: [...scopes],
        reason: "在这个 Creative Artstyle 中生成内容，并把结果归档到当前 Space。",
      });
      if (!approved) {
        setStage("idle");
        setError("需要授权这个能力，以及将结果归档到 Space。");
        return;
      }

      const spaceId = await getSpaceId();
      if (!spaceId) throw new Error("无法识别当前 Works 空间。");

      if (capId === "web" || capId === "deck") {
        setStage("running");
        const path = await createProject(spaceId);
        setArchivePath(path);
        setPreview({ src: "", name: brief.trim(), kind: cap.label, output: "code", generated: true });
        setStage("done");
        return;
      }

      const model = await resolveGenerationModel(capId === "motion" ? "seedance-2-0-fast" : "gpt-image-2");
      setStage("queued");
      const result = await client.generations.createAndWait(
        {
          spaceId,
          model,
          content: [{ type: "text", text: generatedPrompt }],
          parameters:
            capId === "motion"
              ? { duration: 5, resolution: "720p", ratio: videoRatio, generate_audio: true, watermark: false }
              : { size: capId === "poster" ? "1024x1536" : "1536x1024", quality },
        },
        {
          timeoutMs: 30 * 60 * 1000,
          onPoll: (detail) => {
            const status = String(detail.run.status).toLowerCase();
            setStage(status.includes("queue") || status === "pending" ? "queued" : "running");
          },
        },
      );

      const media = result.output?.find((b) => b.type === (capId === "motion" ? "video" : "image"));
      const src = getMediaSource(media);
      if (!src) throw new Error("生成任务完成，但没有返回可预览的媒体。");

      // Show the result the moment it exists. Archiving goes through a Space Agent
      // turn that can take minutes, and blocking the preview on it made finished
      // generations look like failures.
      setPreview({
        src,
        name: brief.trim(),
        kind: cap.label,
        output: capId === "motion" ? "video" : "image",
        generated: true,
      });
      setStage("archiving");

      try {
        const savedPath = await archiveMedia(spaceId, src, capId === "motion" ? "mp4" : "png");
        setArchivePath(savedPath);
        setStage("done");
      } catch (archiveError) {
        // The media is already on screen, so a failed archive is a warning, not a loss.
        setStage("done");
        setError(
          `已生成并显示，但归档到 Space 失败：${
            archiveError instanceof Error ? archiveError.message : String(archiveError)
          }。右下可以直接下载。`,
        );
      }
    } catch (caught) {
      console.error(caught);
      const message = caught instanceof Error ? caught.message : "生成时发生未知错误。";
      const { kind, hint } = classifyFailure(message);
      setStage("error");
      setFailure(kind);
      setError(hint);
    }
  };

  const isGenerating = ["authorizing", "queued", "running", "archiving"].includes(stage);
  // The blocking overlay must not cover a finished image while it archives.
  const isBlocking = ["authorizing", "queued", "running"].includes(stage);

  // Image generation takes ~2-4 min and video longer. Without visible elapsed time
  // a static "Making" label reads as a hang, so surface the clock and an estimate.
  const [elapsed, setElapsed] = useState(0);
  const startedRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isGenerating) {
      startedRef.current = null;
      setElapsed(0);
      return;
    }
    if (startedRef.current === null) startedRef.current = Date.now();
    const id = window.setInterval(() => {
      if (startedRef.current !== null) {
        setElapsed(Math.floor((Date.now() - startedRef.current) / 1000));
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [isGenerating]);
  const etaSeconds = capId === "motion" ? 300 : capId === "web" || capId === "deck" ? 120 : 200;
  const clock = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  const selectedAccent = accents.find((a) => a.id === recipe.accent);

  return (
    <div className="app-shell" data-cap={capId}>
      <header className="topbar">
        <div className="brand-lockup">
          <div className="issue-mark" aria-hidden="true"><span>CC</span><span>{cap.index}</span></div>
          <div>
            <h1>Creative Artstyle</h1>
            <p>visual things, made together</p>
          </div>
        </div>
        <div className="topbar-meta">
          <span className="live-mark"><i /> Space connected</span>
          <a className="source-link" href="https://github.com/Larkspur-Wang/gc-minimal-zine-poster" target="_blank" rel="noreferrer">
            <span>源 Skill</span><ExternalLink size={14} strokeWidth={1.8} />
          </a>
        </div>
      </header>

      <div className="workspace-shell">
        <aside className="rail">
          <div className="rail-label">MAKE</div>
          {capabilities.map((item) => {
            const Icon = iconFor[item.id];
            return (
              <button
                key={item.id}
                type="button"
                className={`rail-button ${capId === item.id ? "active" : ""} tone-${item.tone}`}
                title={item.label}
                onClick={() => chooseCapability(item.id)}
              >
                <Icon size={18} />
                <span>{item.label.split(" ")[0]}</span>
              </button>
            );
          })}
          <div className="rail-spacer" />
          <div className="rail-label">SPACE</div>
          <button className="rail-button" type="button" title="Archive"><Archive size={18} /><span>Archive</span></button>
          <button className="rail-button" type="button" title="Projects"><LayoutDashboard size={18} /><span>Projects</span></button>
        </aside>

        <main className="main-workspace">
          <section className="hero-row">
            <div className="hero-art" aria-hidden="true">
              {capabilities.map((item) => (
                <img
                  key={item.id}
                  src={item.heroArt}
                  alt=""
                  className={capId === item.id ? "on" : ""}
                  loading={item.id === "poster" ? "eager" : "lazy"}
                />
              ))}
              <span className="hero-art-veil" />
            </div>
            <ParticleField accent={cap.accent} />
            <div className="hero-copy">
              <p className="kicker">A SMALL STUDIO FOR BIG IDEAS <span>↗</span></p>
              <h2>Make the thing<br /><em>you can see.</em></h2>
              <div className="hero-caps">
                {capabilities.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`hero-cap-chip ${capId === item.id ? "on" : ""}`}
                    style={{ ["--chip" as string]: item.accent }}
                    onClick={() => chooseCapability(item.id)}
                  >
                    <i />{item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="hero-note">
              <p>五种能力，各有各的做法。<br />选一个，给它一句话，剩下的交给它。</p>
              <span>{String(capabilities.length).padStart(2, "0")} capabilities / 01 space</span>
            </div>
          </section>

          <section className="capability-strip" aria-label="Capabilities">
            {capabilities.map((item) => {
              const Icon = iconFor[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`capability-card ${capId === item.id ? "selected" : ""} tone-${item.tone}`}
                  onClick={() => chooseCapability(item.id)}
                >
                  <div className="capability-top"><span>{item.index} / {item.family}</span><Icon size={17} strokeWidth={1.7} /></div>
                  <strong>{item.label}</strong>
                  <p>{item.tagline}</p>
                  <span className="capability-arrow"><ArrowUpRight size={14} /></span>
                </button>
              );
            })}
          </section>

          <section className="maker-grid">
            <div className="brief-panel">
              <div className="panel-title-row">
                <div><span className="section-index">{cap.index}</span><h3>{cap.label}</h3></div>
                <button className="icon-button" type="button" onClick={reset} title="重置"><RotateCcw size={16} /></button>
              </div>
              <p className="cap-description">{cap.description}</p>

              <div className="field brief-field">
                <div className="subhead-row brief-head">
                  <span id="brief-label">WHAT ARE WE MAKING?</span>
                  <button type="button" onClick={writeCopy} disabled={copyBusy} aria-busy={copyBusy}>
                    {copyBusy ? <LoaderCircle className="spin" size={14} /> : <Dices size={14} />}
                    {copyBusy ? "正在写" : "随机一个"}
                  </button>
                </div>
                <textarea
                  aria-labelledby="brief-label"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  rows={4}
                  maxLength={280}
                />
                <small>{brief.length} / 280</small>
                {copyError && <p className="copy-error" role="status">{copyError}</p>}
              </div>

              {(capId === "poster" || capId === "card") && (
                <label className="field">
                  <span>ONE SHORT LINE</span>
                  <input value={phrase} onChange={(e) => setPhrase(e.target.value)} maxLength={48} />
                </label>
              )}

              {/* POSTER controls */}
              {capId === "poster" && (
                <div className="poster-controls">
                  <div className="subhead-row"><span>ART DIRECTION</span><button type="button" onClick={remixAll} disabled={copyBusy} aria-busy={copyBusy}>{copyBusy ? <LoaderCircle className="spin" size={14} /> : <WandSparkles size={14} />} remix</button></div>
                  <div className="layout-grid compact-layout">
                    {layouts.map((l) => (
                      <button key={l.id} type="button" className={`layout-option ${recipe.layout === l.id ? "selected" : ""}`} onClick={() => updateRecipe("layout", l.id)} title={l.label}>
                        <span className={`layout-glyph glyph-${l.id}`} aria-hidden="true"><i /><b /></span>
                        <span>{l.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="select-grid">
                    <SelectField label="图像锚点" value={recipe.anchor} options={anchors} onChange={(v) => updateRecipe("anchor", v)} />
                    <SelectField label="文字系统" value={recipe.typography} options={typographyModes} onChange={(v) => updateRecipe("typography", v)} />
                    <SelectField label="印刷质感" value={recipe.texture} options={textures} onChange={(v) => updateRecipe("texture", v)} />
                    <SelectField label="情绪" value={recipe.mood} options={moods} onChange={(v) => updateRecipe("mood", v)} />
                  </div>
                  <fieldset className="field color-field">
                    <legend>ACCENT COLOR</legend>
                    <div className="swatches">
                      {accents.map((a) => (
                        <button key={a.id} type="button" className={recipe.accent === a.id ? "selected" : ""} onClick={() => updateRecipe("accent", a.id)} title={a.label}><span style={{ background: a.hex }} /></button>
                      ))}
                    </div>
                    <output>{selectedAccent?.label}</output>
                  </fieldset>
                </div>
              )}

              {/* CARD controls */}
              {capId === "card" && (
                <div className="poster-controls">
                  <div className="select-grid">
                    <SelectField label="卡片用途" value={cardPurpose} options={cardPurposes} onChange={setCardPurpose} />
                    <SelectField label="强调色" value={cardAccent} options={cardAccents} onChange={setCardAccent} />
                  </div>
                </div>
              )}

              {/* MOTION controls — 6-cell POV formula */}
              {capId === "motion" && (
                <div className="poster-controls">
                  <div className="subhead-row"><span>STORY / 6 格 POV 公式</span><span className="subhead-hint">留空则用 brief 直接生成</span></div>
                  <div className="story-grid">
                    {motionStoryFields.map((f) => (
                      <label key={f.key} className="story-cell">
                        <span>{f.label}<i>{f.hint}</i></span>
                        <input value={story[f.key]} onChange={(e) => updateStory(f.key, e.target.value)} placeholder={f.placeholder} />
                      </label>
                    ))}
                  </div>
                  <div className="select-grid one">
                    <SelectField label="画幅" value={videoRatio} options={motionRatios} onChange={setVideoRatio} />
                  </div>
                </div>
              )}

              {/* WEB controls */}
              {capId === "web" && (
                <div className="poster-controls">
                  <div className="select-grid one">
                    <SelectField label="产出类型" value={webKind} options={webKinds} onChange={setWebKind} />
                  </div>
                  <label className="field"><span>需要哪些板块（可选）</span><input value={webSections} onChange={(e) => setWebSections(e.target.value)} placeholder="首屏 / 作品网格 / 关于 / 联系" /></label>
                </div>
              )}

              {/* DECK controls */}
              {capId === "deck" && (
                <div className="poster-controls">
                  <div className="select-grid">
                    <SelectField label="叙事结构" value={deckArc} options={deckArcs} onChange={setDeckArc} />
                    <label className="field compact-field"><span>页数</span>
                      <select value={String(deckSlides)} onChange={(e) => setDeckSlides(Number(e.target.value))}>
                        {[6, 8, 10, 12, 16].map((n) => <option key={n} value={n}>{n} 页</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="field"><span>目标观众（可选）</span><input value={deckAudience} onChange={(e) => setDeckAudience(e.target.value)} placeholder="团队 / 投资人 / 客户" /></label>
                </div>
              )}

              <div className="make-footer">
                <div><span>OUTPUT</span><strong>{capId === "motion" ? `${videoRatio} / 720p` : cap.ratioLabel}</strong></div>
                {(capId === "poster" || capId === "card") && (
                  <label><span>QUALITY</span>
                    <select value={quality} onChange={(e) => setQuality(e.target.value)}><option value="medium">Standard</option><option value="high">High</option></select>
                  </label>
                )}
              </div>

              <button className="generate-button" type="button" onClick={generate} disabled={isGenerating}>
                {isGenerating ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}
                <span>{isGenerating ? stageLabel[stage] : cap.action}</span>
                <kbd>{cap.model}</kbd>
              </button>
              {error && <p className={`error-message ${failure ? `failure-${failure}` : ""}`}>{failure ? `[${failure}] ` : ""}{error}</p>}
              {archivePath && <div className="archive-confirm"><Check size={14} /><span>Archived to Space</span><code>{archivePath}</code></div>}
            </div>

            <div className={`output-panel frame-${cap.frame}`}>
              <div className="output-toolbar">
                <div><span className="status-dot" data-status={stage} /><span>{stageLabel[stage]}</span></div>
                <div className="toolbar-actions">
                  <button type="button" onClick={() => setShowPrompt((o) => !o)}><Code2 size={15} /><span>Prompt</span></button>
                  {preview.generated && preview.src && (
                    <a href={preview.src} download={`cc-${safeName(preview.name)}`}><Download size={15} /><span>Download</span></a>
                  )}
                </div>
              </div>

              <div className={`output-canvas out-${cap.frame}`}>
                {/* portrait / landscape image */}
                {(cap.frame === "portrait" || cap.frame === "landscape") && preview.output === "image" && preview.src && (
                  <div className={`media-frame ${cap.frame}`}><img src={preview.src} alt={preview.name} /></div>
                )}
                {/* video */}
                {cap.frame === "video" && (
                  preview.output === "video" && preview.src ? (
                    <div className="media-frame video"><video src={preview.src} controls autoPlay muted loop playsInline /></div>
                  ) : (
                    <div className="media-frame video placeholder"><Film size={30} /><span>短片将在这里播放</span></div>
                  )
                )}
                {/* browser chrome */}
                {cap.frame === "browser" && (
                  <div className="browser-frame">
                    <div className="browser-bar"><i /><i /><i /><span>localhost / index.html</span></div>
                    {preview.src && !preview.generated ? (
                      <div className="browser-shot"><img src={preview.src} alt={preview.name} /></div>
                    ) : (
                    <div className="browser-body">
                      <strong>{brief.trim() || "A quiet place for good work"}</strong>
                      <em>{webKinds.find((k) => k.id === webKind)?.label}</em>
                      <div className="browser-lines"><span /><span /><span /></div>
                      {archivePath && <code>{archivePath}</code>}
                    </div>
                    )}
                  </div>
                )}
                {/* slides */}
                {cap.frame === "slides" && (
                  preview.src && !preview.generated ? (
                    <div className="media-frame landscape"><img src={preview.src} alt={preview.name} /></div>
                  ) : (
                  <div className="slides-frame">
                    <div className="slide big"><span>01</span><strong>{brief.trim() || "标题页"}</strong><em>{deckArcs.find((a) => a.id === deckArc)?.label}</em></div>
                    <div className="slide-row">
                      <div className="slide"><span>02</span><i /><i /></div>
                      <div className="slide"><span>03</span><i /><i /></div>
                      <div className="slide"><span>··</span><b>{deckSlides}</b></div>
                    </div>
                    {archivePath && <code className="slides-path">{archivePath}</code>}
                  </div>
                  )
                )}

                <div className="output-stamp"><span>{preview.generated ? "GENERATED" : "EXAMPLE"}</span><strong>{cap.family}</strong></div>
                {stage === "archiving" && (
                  <div className="archiving-badge">
                    <LoaderCircle className="spin" size={13} />
                    <span>正在归档到 Space，图已可以下载</span>
                  </div>
                )}
                {isBlocking && (
                  <div className="generating-overlay">
                    <div className="scan-line" />
                    <LoaderCircle className="spin" size={23} />
                    <span>{stageLabel[stage]}</span>
                    <b className="gen-clock">{clock}</b>
                    <div className="gen-track"><i style={{ width: `${Math.min(96, (elapsed / etaSeconds) * 100)}%` }} /></div>
                    <em className="gen-eta">
                      {elapsed > etaSeconds
                        ? "比平时久一点，任务还在跑。不要关闭页面。"
                        : `通常需要 ${Math.round(etaSeconds / 60)} 分钟左右，请保持页面打开。`}
                    </em>
                  </div>
                )}
              </div>

              <div className="output-caption">
                <div><span className="section-index">{cap.index}</span><strong>{preview.name}</strong></div>
                <span>{cap.model} / {cap.ratioLabel}</span>
              </div>

              <div className={`prompt-drawer ${showPrompt ? "open" : ""}`}>
                <div className="prompt-heading"><span>WORKING PROMPT</span><button type="button" className="icon-button" onClick={copyPrompt} title="复制 Prompt">{copied ? <Check size={16} /> : <Copy size={16} />}</button></div>
                <p>{generatedPrompt}</p>
              </div>
            </div>
          </section>

          {examples.length > 0 && (
            <section className="archive-section">
              <div className="archive-heading">
                <div><span className="section-index">EX</span><h3>{cap.label} examples</h3></div>
                <span>{cap.family} / {String(examples.length).padStart(2, "0")}</span>
              </div>
              <div className={`filmstrip strip-${cap.frame}`}>
                {examples.map((ex, i) => (
                  <button
                    type="button"
                    key={ex.name}
                    className={preview.src === ex.src ? "active" : ""}
                    onClick={() => setPreview({ src: ex.src, name: ex.name, kind: ex.kind, output: cap.output, generated: false })}
                  >
                    {cap.output === "video" ? <video src={ex.src} muted loop playsInline /> : <img src={ex.src} alt={ex.name} loading="lazy" />}
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <strong>{ex.name}</strong>
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
