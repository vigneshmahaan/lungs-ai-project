"use client";

import { useEffect, useMemo, useRef } from "react";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function MelSpectrogram({
  mel,
  title = "Mel-spectrogram (dB)",
}: {
  mel: number[][];
  title?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stats = useMemo(() => {
    let mn = Infinity;
    let mx = -Infinity;
    for (const row of mel) {
      for (const v of row) {
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
    }
    if (!Number.isFinite(mn) || !Number.isFinite(mx) || mn === mx) return { mn: -80, mx: 0 };
    return { mn, mx };
  }, [mel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const h = mel.length;
    const w = mel[0]?.length ?? 0;
    if (!h || !w) return;

    canvas.width = w;
    canvas.height = h;

    const img = ctx.createImageData(w, h);
    const range = stats.mx - stats.mn;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = mel[h - 1 - y][x]; // flip vertical for natural orientation
        const t = clamp01((v - stats.mn) / (range || 1));

        // Blue medical palette heatmap
        const r = Math.round(20 + 60 * t);
        const g = Math.round(60 + 140 * t);
        const b = Math.round(140 + 100 * t);

        const idx = (y * w + x) * 4;
        img.data[idx] = r;
        img.data[idx + 1] = g;
        img.data[idx + 2] = b;
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [mel, stats]);

  return (
    <div className="w-full">
      <div className="mb-2 text-sm font-medium text-slate-700">{title}</div>
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <canvas ref={canvasRef} className="h-48 w-full" />
      </div>
      <div className="mt-2 text-xs text-slate-500">
        Scale: {stats.mn.toFixed(1)} dB → {stats.mx.toFixed(1)} dB
      </div>
    </div>
  );
}

