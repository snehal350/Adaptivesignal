import { useEffect, useRef } from "react";
import type { Intersection } from "../lib/traffic";

const W = 320;
const H = 260;
const MAX_QUEUE_DISPLAY = 12;

interface Props {
  env: Intersection | null;
}

export function IntersectionCanvas({ env }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);
    const cx = W / 2;
    const cy = H / 2;
    const roadW = 56;

    ctx.fillStyle = "#232842";
    ctx.fillRect(cx - roadW / 2, 0, roadW, H);
    ctx.fillRect(0, cy - roadW / 2, W, roadW);

    if (!env) return;

    const nsGreen = env.phase === 0;
    const drawLight = (x: number, y: number, on: boolean) => {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = on ? "#48bb78" : "#f56565";
      ctx.fill();
    };
    drawLight(cx - roadW / 2 - 14, cy - roadW / 2 - 14, nsGreen);
    drawLight(cx + roadW / 2 + 14, cy + roadW / 2 + 14, nsGreen);
    drawLight(cx + roadW / 2 + 14, cy - roadW / 2 - 14, !nsGreen);
    drawLight(cx - roadW / 2 - 14, cy + roadW / 2 + 14, !nsGreen);

    ctx.fillStyle = "#4fd1c5";
    const drawQueue = (dir: "N" | "E" | "S" | "W", n: number) => {
      const count = Math.min(n, MAX_QUEUE_DISPLAY);
      for (let i = 0; i < count; i++) {
        let x = 0,
          y = 0;
        if (dir === "N") {
          x = cx - 13;
          y = cy - roadW / 2 - 18 - i * 13;
        }
        if (dir === "S") {
          x = cx + 13;
          y = cy + roadW / 2 + 18 + i * 13;
        }
        if (dir === "E") {
          x = cx + roadW / 2 + 18 + i * 13;
          y = cy - 13;
        }
        if (dir === "W") {
          x = cx - roadW / 2 - 18 - i * 13;
          y = cy + 13;
        }
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawQueue("N", env.q.N);
    drawQueue("S", env.q.S);
    drawQueue("E", env.q.E);
    drawQueue("W", env.q.W);

    ctx.fillStyle = "#9aa0c3";
    ctx.font = "11px sans-serif";
    ctx.fillText("N", cx - 4, 14);
    ctx.fillText("S", cx - 4, H - 6);
    ctx.fillText("W", 6, cy - 8);
    ctx.fillText("E", W - 14, cy - 8);
  }, [env, env?.phase, env?.q.N, env?.q.E, env?.q.S, env?.q.W]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full h-auto rounded-lg bg-[#12162a]"
    />
  );
}
