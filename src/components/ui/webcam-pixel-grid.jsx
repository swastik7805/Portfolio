"use client";
import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

// Monochromatic scheme:
const BASE  = { r: 227, g: 220, b: 210 }; // rgba(227, 219, 219, 1)
const PIXEL = { r: 230, g: 225, b: 215 }; // rgba(230, 225, 215, 1) 

// Lerp between BASE and PIXEL by wave value 
function waveColor(v) {
  return {
    r: Math.round(BASE.r + (PIXEL.r - BASE.r) * v),
    g: Math.round(BASE.g + (PIXEL.g - BASE.g) * v),
    b: Math.round(BASE.b + (PIXEL.b - BASE.b) * v),
  };
}

export const PixelGrid = ({
  gridCols = 60,
  gridRows = 40,
  maxElevation ,
  elevationSmoothing = 0.08,
  backgroundColor = "#babaa8ff",
  gapRatio = 0.05,
  borderColor = "#b8b89eff",
  borderOpacity = 0.12,
  className,
}) => {
  const canvasRef   = useRef(null);
  const pixelsRef   = useRef([]);
  const rafRef      = useRef(0);
  const timeRef     = useRef(0);

  // Parse border color once
  const bRGB = React.useMemo(() => {
    const h = borderColor.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }, [borderColor]);

  // Init pixel grid
  useEffect(() => {
    pixelsRef.current = Array.from({ length: gridRows }, () =>
      Array.from({ length: gridCols }, () => ({
        r: BASE.r, g: BASE.g, b: BASE.b,
        targetElevation: 0,
        currentElevation: 0,
      }))
    );
  }, [gridCols, gridRows]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(draw); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx)    { rafRef.current = requestAnimationFrame(draw); return; }

    // Advance time — slow for smooth sweep
    timeRef.current += 0.007;
    const t = timeRef.current;

    const pixels = pixelsRef.current;

    //  Wave formula 
    // One primary diagonal wave sweeping top-left → bottom-right.
    // A soft secondary perpendicular ripple adds depth without hotspots.
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const px = pixels[row]?.[col];
        if (!px) continue;

        const nx = col / gridCols; // 0..1
        const ny = row / gridRows; // 0..1

        // Single diagonal plane wave: top-left → bottom-right
        const diag    = (nx + ny) * Math.PI * 1.8;
        const primary = Math.sin(diag - t * 0.9);   // -1..1, slow & smooth

        // Soft perpendicular ripple — very subtle, no corner bias
        const perp = Math.sin((nx - ny) * Math.PI * 0.9 + t * 0.4) * 0.15;

        // Wave value: 0 = trough (base color), 1 = crest (pixel color)
        const waveVal = (primary + perp) * 0.5 + 0.5;  // 0..1

        // Color: blend from BASE → PIXEL
        const c = waveColor(waveVal);
        px.r = c.r;
        px.g = c.g;
        px.b = c.b;

        // Elevation only at crest so raised tiles match the bright pixels
        const waveCrest = Math.max(0, primary + perp * 0.5);
        px.targetElevation = waveCrest * maxElevation;
        px.currentElevation +=
          (px.targetElevation - px.currentElevation) * elevationSmoothing;
      }
    }

    //  Render 
    const dpr  = window.devicePixelRatio || 1;
    const W    = canvas.clientWidth;
    const H    = canvas.clientHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, W, H);

    const cell  = Math.max(W / gridCols, H / gridRows);
    const gap   = cell * gapRatio;
    const ox    = (W - cell * gridCols) / 2;
    const oy    = (H - cell * gridRows) / 2;

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const px = pixels[row]?.[col];
        if (!px) continue;

        const x   = ox + col * cell;
        const y   = oy + row * cell;
        const elv = px.currentElevation;

        // Isometric-style lift (same for every cell — no corner bias)
        const dx = -elv * 1.0;
        const dy = -elv * 1.5;

        // Drop shadow
        if (elv > 0.4) {
          ctx.fillStyle = `rgba(30,30,30,${Math.min(0.28, elv * 0.018)})`;
          ctx.fillRect(
            x + gap / 2 + elv * 1.2,
            y + gap / 2 + elv * 1.6,
            cell - gap, cell - gap
          );
        }

        // Right-side face (darker)
        if (elv > 0.4) {
          ctx.fillStyle = `rgb(${Math.max(0, px.r - 50)},${Math.max(0, px.g - 50)},${Math.max(0, px.b - 50)})`;
          ctx.beginPath();
          ctx.moveTo(x + cell - gap / 2 + dx, y + gap / 2 + dy);
          ctx.lineTo(x + cell - gap / 2,       y + gap / 2);
          ctx.lineTo(x + cell - gap / 2,       y + cell - gap / 2);
          ctx.lineTo(x + cell - gap / 2 + dx,  y + cell - gap / 2 + dy);
          ctx.closePath();
          ctx.fill();

          // Bottom-side face (slightly less dark)
          ctx.fillStyle = `rgb(${Math.max(0, px.r - 30)},${Math.max(0, px.g - 30)},${Math.max(0, px.b - 30)})`;
          ctx.beginPath();
          ctx.moveTo(x + gap / 2 + dx,        y + cell - gap / 2 + dy);
          ctx.lineTo(x + gap / 2,              y + cell - gap / 2);
          ctx.lineTo(x + cell - gap / 2,       y + cell - gap / 2);
          ctx.lineTo(x + cell - gap / 2 + dx,  y + cell - gap / 2 + dy);
          ctx.closePath();
          ctx.fill();
        }

        // Top face — slightly brightened at crest
        const bright = 1 + elv * 0.025;
        ctx.fillStyle = `rgb(${Math.min(255, Math.round(px.r * bright))},${Math.min(255, Math.round(px.g * bright))},${Math.min(255, Math.round(px.b * bright))})`;
        ctx.fillRect(x + gap / 2 + dx, y + gap / 2 + dy, cell - gap, cell - gap);

        // Thin border
        ctx.strokeStyle = `rgba(${bRGB.r},${bRGB.g},${bRGB.b},${borderOpacity + elv * 0.005})`;
        ctx.lineWidth   = 0.5;
        ctx.strokeRect(x + gap / 2 + dx, y + gap / 2 + dy, cell - gap, cell - gap);
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [
    gridCols, gridRows, maxElevation, elevationSmoothing,
    backgroundColor, gapRatio, bRGB, borderOpacity,
  ]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ backgroundColor }}
      />
    </div>
  );
};

export default PixelGrid;
