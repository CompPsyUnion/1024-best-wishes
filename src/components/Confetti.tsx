import { useEffect, useRef } from "react";

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  shape: "rect" | "dot";
  wobble: number;
  wobbleSpeed: number;
  born: number;
  life: number; // ms; -1 = until it falls off-screen
  gravity: number;
  drag: number;
}

const GOLD = ["#f7d447", "#ffe28a", "#fff3bf", "#ecebe4", "#d4a017"];
const SPARK = ["#ff6b6b", "#43d17c", "#6ab7ff"];

const pick = (arr: string[]): string => arr[(Math.random() * arr.length) | 0];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Celebration layer: opening confetti cannons + a volley of fireworks. */
export default function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const canvas = ref.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pieces: Piece[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const color = () => (Math.random() < 0.12 ? pick(SPARK) : pick(GOLD));

    const confettiBurst = (
      x: number,
      y: number,
      angle: number,
      spread: number,
      count: number,
      pMin: number,
      pMax: number,
    ) => {
      for (let i = 0; i < count; i++) {
        const a = angle + rand(-spread, spread);
        const sp = rand(pMin, pMax);
        pieces.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          rot: rand(0, Math.PI * 2),
          vr: rand(-0.25, 0.25),
          w: rand(6, 11),
          h: rand(8, 14),
          color: color(),
          shape: "rect",
          wobble: rand(0, Math.PI * 2),
          wobbleSpeed: rand(0.08, 0.2),
          born: performance.now(),
          life: -1,
          gravity: 0.22,
          drag: 0.985,
        });
      }
    };

    const firework = (x: number, y: number) => {
      const n = 42;
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + rand(-0.06, 0.06);
        const sp = rand(2.2, 6);
        pieces.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          rot: 0,
          vr: 0,
          w: rand(2, 3.5),
          h: rand(2, 3.5),
          color: color(),
          shape: "dot",
          wobble: rand(0, Math.PI * 2),
          wobbleSpeed: rand(0.05, 0.15),
          born: performance.now(),
          life: rand(1400, 2400),
          gravity: 0.05,
          drag: 0.96,
        });
      }
    };

    // Opening volley.
    confettiBurst(10, h * 0.88, -Math.PI / 3, 0.45, 60, 8, 15);
    confettiBurst(w - 10, h * 0.88, (-Math.PI * 2) / 3, 0.45, 60, 8, 15);
    confettiBurst(w / 2, h + 10, -Math.PI / 2, 0.3, 50, 12, 18);

    let fireworksLeft = 7;
    let nextFirework = performance.now() + 600;
    let last = performance.now();

    const loop = (t: number) => {
      const dt = Math.min((t - last) / 16.7, 2.2);
      last = t;
      ctx.clearRect(0, 0, w, h);

      if (fireworksLeft > 0 && t >= nextFirework) {
        firework(rand(w * 0.15, w * 0.85), rand(h * 0.12, h * 0.45));
        fireworksLeft--;
        nextFirework = t + rand(1300, 2100);
      }

      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        p.vx *= Math.pow(p.drag, dt);
        p.vy = p.vy * Math.pow(p.drag, dt) + p.gravity * dt;
        p.wobble += p.wobbleSpeed * dt;
        p.rot += p.vr * dt;
        p.x += p.vx * dt + (p.shape === "rect" ? Math.sin(p.wobble) * 0.6 : 0);
        p.y += p.vy * dt;

        let alpha = 1;
        if (p.life > 0) {
          alpha = Math.max(0, 1 - (t - p.born) / p.life);
        }
        if (alpha <= 0 || p.y > h + 30) {
          pieces.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        if (p.shape === "dot") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, Math.abs(Math.cos(p.wobble)) * 0.8 + 0.2);
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;

      if (fireworksLeft > 0 || pieces.length > 0) {
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="confetti-canvas" ref={ref} aria-hidden="true" />;
}
