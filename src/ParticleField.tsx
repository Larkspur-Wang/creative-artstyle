import { useEffect, useRef } from "react";

// A lightweight drifting point-cloud field, distilled from the particle-text-engine
// skill: deterministic seeded points, slow rotation, gentle breathing, mouse parallax.
// Canvas 2D projection of a rotating 3D cloud. Respects prefers-reduced-motion.

type P = { x: number; y: number; z: number };

function seeded(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build a soft ribbon/wave cloud — abstract, editorial, not a literal object.
function buildCloud(n: number): P[] {
  const rnd = seeded(20260725);
  const pts: P[] = [];
  for (let i = 0; i < n; i += 1) {
    const t = i / n;
    const theta = t * Math.PI * 6;
    const band = Math.floor(rnd() * 3);
    const radius = 5.5 + band * 2.4 + rnd() * 0.8;
    const x = Math.cos(theta) * radius + (rnd() - 0.5) * 1.6;
    const y = (t - 0.5) * 15 + Math.sin(theta * 0.6) * 1.8 + (rnd() - 0.5) * 1.2;
    const z = Math.sin(theta) * radius + (rnd() - 0.5) * 1.6;
    pts.push({ x, y, z });
  }
  return pts;
}

export default function ParticleField({ accent }: { accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accentRef = useRef(accent);
  accentRef.current = accent;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cloud = buildCloud(reduced ? 260 : 520);
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    let angle = 0;
    const render = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      angle += reduced ? 0 : 0.0016;
      const cx = w / 2 + mouse.x * 26;
      const cy = h / 2 + mouse.y * 18;
      const scale = Math.min(w, h) / 34;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const ac = accentRef.current;

      for (let i = 0; i < cloud.length; i += 1) {
        const p = cloud[i];
        const breathe = 1 + Math.sin(time * 0.0006 + i * 0.05) * 0.04;
        const rx = p.x * cosA - p.z * sinA;
        const rz = p.x * sinA + p.z * cosA;
        const persp = 18 / (18 + rz);
        const sx = cx + rx * scale * persp * breathe;
        const sy = cy + p.y * scale * persp * breathe;
        const depth = (rz + 12) / 24;
        const size = Math.max(0.4, persp * 1.7);
        const alpha = 0.12 + depth * 0.5;
        // most points ink, a few carry the accent
        if (i % 9 === 0) {
          ctx.fillStyle = ac;
          ctx.globalAlpha = alpha * 0.9;
        } else {
          ctx.fillStyle = "#1d1e1c";
          ctx.globalAlpha = alpha * 0.55;
        }
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}
