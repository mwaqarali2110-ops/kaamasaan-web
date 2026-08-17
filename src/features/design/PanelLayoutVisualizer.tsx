'use client';

import { useId } from 'react';
import type { PanelLayoutResult } from '@/utils/calculations';

/**
 * Web port of kaamasaan-mobile/src/components/solar-tools/PanelLayoutVisualizer.tsx.
 *
 * Mobile draws the array with absolutely-positioned Views and a hand-rolled
 * scale calculation. On web the same geometry is real SVG in feet units with a
 * viewBox, so it scales to any container without recomputing pixel sizes —
 * `calculatePanelLayoutScale` is therefore not needed here.
 *
 * The layout itself still comes from `calculatePanelLayout`, the ported and
 * tested engine; nothing about panel placement, count, or dimensions is
 * recomputed here — this file only changed *how it's drawn*, not what it
 * draws. Each panel cell is the customer's real product photo
 * (`/marketing/panels/solar-panel.png`, a cropped/keyed cutout with a genuine
 * transparent background) instead of a synthetic gradient, clipped to the
 * panel's rounded rect and framed with a thin aluminium-tone stroke for
 * definition against the roof. Spacing between rows/columns is `gapFt` from
 * the layout engine itself (1 inch by default, `DEFAULT_PANEL_GAP_INCHES` in
 * calculations.ts) — already a "minor" gap relative to panel size, so it's
 * used as-is rather than inventing a separate presentation-only value.
 *
 * Panels sit on a fixed-size reference rooftop (a plausible mid-size home
 * roof, not a per-customer measurement — this app doesn't collect an actual
 * roof size). Because the roof reference doesn't grow with panel count, a
 * large array naturally spills past its edges — exactly the "this needs more
 * roof than a typical one" cue the larger systems should give, driven by the
 * real numbers rather than staged.
 */
export const PanelLayoutVisualizer = ({
  layout,
  panelCount
}: {
  layout: PanelLayoutResult;
  panelCount: number;
}) => {
  const { columns, rows, panelWidth, panelHeight, gapFt, width, height } = layout;
  const uid = useId().replace(/:/g, '');

  // Reference rooftop: a generous fixed footprint (typical mid-size home,
  // flat-concrete style like the KaamAsaan brand photography). Centered under
  // the panel array; the array overflows it naturally once it needs more
  // space than this affords, which is the point.
  const roofWidth = 34;
  const roofHeight = 26;
  const margin = 4;

  const canvasWidth = Math.max(roofWidth, width) + margin * 2;
  const canvasHeight = Math.max(roofHeight, height) + margin * 2;
  const roofX = (canvasWidth - roofWidth) / 2;
  const roofY = (canvasHeight - roofHeight) / 2;
  const arrayX = (canvasWidth - width) / 2;
  const arrayY = (canvasHeight - height) / 2;
  const overflowing = width > roofWidth || height > roofHeight;

  const panelClipId = `panel-clip-${uid}`;
  const roofTextureId = `roof-texture-${uid}`;
  const panelShadowId = `panel-shadow-${uid}`;

  return (
    <svg
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${panelCount} panels arranged in ${rows} rows of up to ${columns} columns, occupying about ${Math.ceil(width)} by ${Math.ceil(height)} feet${overflowing ? ', extending beyond a typical rooftop footprint' : ''}`}
    >
      <defs>
        {/* Shared clip so every panel photo is cropped to the exact cell
            size/orientation the layout engine computed. */}
        <clipPath id={panelClipId}>
          <rect width={panelWidth} height={panelHeight} rx={0.08} />
        </clipPath>
        {/* Soft contact shadow under each panel for a lifted-off-the-roof feel. */}
        <filter id={panelShadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0.12" stdDeviation="0.1" floodColor="#0e2338" floodOpacity="0.35" />
        </filter>
        {/* Faint tile seams on the roof surface, matching the brand's flat
            concrete-roof photography rather than a flat placeholder fill. */}
        <pattern id={roofTextureId} width={roofWidth / 8} height={roofWidth / 8} patternUnits="userSpaceOnUse">
          <rect width={roofWidth / 8} height={roofWidth / 8} fill="#e7e2d6" />
          <path d={`M ${roofWidth / 8} 0 L 0 0 0 ${roofWidth / 8}`} fill="none" stroke="#d9d2c1" strokeWidth={0.04} />
        </pattern>
      </defs>

      {/* Reference rooftop — parapet wall + tiled surface. */}
      <rect
        x={roofX - 0.6}
        y={roofY - 0.6}
        width={roofWidth + 1.2}
        height={roofHeight + 1.2}
        rx={0.5}
        fill="#f4f1e8"
        stroke="#cfc7b2"
        strokeWidth={0.5}
      />
      <rect x={roofX} y={roofY} width={roofWidth} height={roofHeight} rx={0.3} fill={`url(#${roofTextureId})`} />
      {/* Rooftop utility box, for a lived-in feel — purely decorative. */}
      <rect x={roofX + roofWidth - 3.2} y={roofY + 0.8} width={2.2} height={1.6} rx={0.15} fill="#c7ccd1" stroke="#9aa1a8" strokeWidth={0.06} />

      {/* Panel array — real product photo per cell, spaced by the engine's gapFt. */}
      {Array.from({ length: rows }).flatMap((_, row) =>
        Array.from({ length: columns }).map((_, column) => {
          const index = row * columns + column;
          if (index >= panelCount) return null;
          const x = arrayX + column * (panelWidth + gapFt);
          const y = arrayY + row * (panelHeight + gapFt);
          return (
            <g key={`${row}-${column}`} transform={`translate(${x}, ${y})`} filter={`url(#${panelShadowId})`}>
              <image
                href="/marketing/panels/solar-panel.png"
                x={0}
                y={0}
                width={panelWidth}
                height={panelHeight}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${panelClipId})`}
              />
              {/* Thin frame line so panels read as distinct tiles against the roof and each other. */}
              <rect
                x={0.02}
                y={0.02}
                width={panelWidth - 0.04}
                height={panelHeight - 0.04}
                rx={0.08}
                fill="none"
                stroke="#7d8892"
                strokeWidth={0.05}
                opacity={0.6}
              />
            </g>
          );
        })
      )}

      {overflowing ? (
        <text
          x={canvasWidth / 2}
          y={canvasHeight - 0.6}
          textAnchor="middle"
          fontSize={1.05}
          fontWeight={800}
          fill="#B45309"
        >
          Needs more space than a typical rooftop
        </text>
      ) : null}
    </svg>
  );
};
