import { useEffect, useRef } from "react";

const GLYPHS = "01{}<>/*#$&%=~^?!πΣλΞ1024CPU";

/** Subtle gold "code rain" behind everything. */
export default function Background() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const fontSize = 14;
    const columnWidth = fontSize * 1.8;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    interface Column {
      y: number;
      speed: number;
      chars: string[];
    }

    const makeColumn = (): Column => ({
      y: Math.random() * -30,
      speed: 0.04 + Math.random() * 0.09,
      chars: Array.from(
        { length: 40 },
        () => GLYPHS[(Math.random() * GLYPHS.length) | 0],
      ),
    });

    let columns: Column[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Array.from(
        { length: Math.ceil(w / columnWidth) + 1 },
        makeColumn,
      );
    };
    resize();
    window.addEventListener("resize", resize);

    const font = () =>
      `${fontSize}px "JetBrains Mono", ui-monospace, Menlo, monospace`;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Static scatter: no motion, just atmosphere.
      ctx.font = font();
      for (let i = 0; i < 70; i++) {
        ctx.fillStyle = `rgba(247, 212, 71, ${0.03 + Math.random() * 0.05})`;
        ctx.fillText(
          GLYPHS[(Math.random() * GLYPHS.length) | 0],
          Math.random() * w,
          Math.random() * h,
        );
      }
      return () => window.removeEventListener("resize", resize);
    }

    const drawFrame = () => {
      ctx.fillStyle = "rgba(11, 12, 17, 0.55)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = font();
      for (let c = 0; c < columns.length; c++) {
        const col = columns[c];
        const x = c * columnWidth;
        for (let k = 0; k < 5; k++) {
          const row = Math.floor(col.y) - k;
          if (row < 0 || row * fontSize > h) {
            continue;
          }
          const alpha = 0.16 * (1 - k / 5) + 0.015;
          ctx.fillStyle = `rgba(247, 212, 71, ${alpha})`;
          const ch = col.chars[((row % 40) + 40) % 40];
          ctx.fillText(ch, x, row * fontSize);
        }
      }
    };

    const tick = (t: number) => {
      if (t - last > 90) {
        last = t;
        for (const col of columns) {
          col.y += col.speed * 2.2;
          if (col.y * fontSize > h + fontSize * 8) {
            col.y = -Math.random() * 10;
            col.speed = 0.04 + Math.random() * 0.09;
          }
          if (Math.random() < 0.03) {
            col.chars[(Math.random() * 40) | 0] =
              GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
        }
        drawFrame();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="bg-canvas" ref={ref} aria-hidden="true" />;
}
