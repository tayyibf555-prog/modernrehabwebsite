"use client";

import { useState } from "react";

export type View = "anterior" | "posterior";

export type Region = {
  id: string;
  label: string;
  shape:
    | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number }
    | { kind: "rect"; x: number; y: number; w: number; h: number; r?: number };
  view: View;
  labelAnchor: { x: number; y: number; align?: "start" | "middle" | "end" };
};

// Region targets are positioned on a 320 x 720 viewBox.
// Coordinates are tuned by eye for the silhouette below.
export const REGIONS: Region[] = [
  // Anterior
  { id: "head", label: "Head & jaw", view: "anterior",
    shape: { kind: "ellipse", cx: 160, cy: 70, rx: 38, ry: 46 },
    labelAnchor: { x: 222, y: 70, align: "start" } },
  { id: "neck-front", label: "Neck", view: "anterior",
    shape: { kind: "rect", x: 142, y: 116, w: 36, h: 24, r: 6 },
    labelAnchor: { x: 222, y: 128, align: "start" } },
  { id: "shoulder", label: "Shoulder", view: "anterior",
    shape: { kind: "ellipse", cx: 100, cy: 158, rx: 22, ry: 16 },
    labelAnchor: { x: 60, y: 158, align: "end" } },
  { id: "chest", label: "Chest", view: "anterior",
    shape: { kind: "rect", x: 124, y: 162, w: 72, h: 56, r: 14 },
    labelAnchor: { x: 222, y: 196, align: "start" } },
  { id: "elbow", label: "Elbow", view: "anterior",
    shape: { kind: "ellipse", cx: 70, cy: 246, rx: 18, ry: 18 },
    labelAnchor: { x: 38, y: 246, align: "end" } },
  { id: "wrist", label: "Wrist & hand", view: "anterior",
    shape: { kind: "ellipse", cx: 56, cy: 332, rx: 17, ry: 20 },
    labelAnchor: { x: 26, y: 332, align: "end" } },
  { id: "hip", label: "Hip", view: "anterior",
    shape: { kind: "rect", x: 116, y: 296, w: 88, h: 36, r: 18 },
    labelAnchor: { x: 222, y: 314, align: "start" } },
  { id: "knee", label: "Knee", view: "anterior",
    shape: { kind: "ellipse", cx: 138, cy: 478, rx: 18, ry: 22 },
    labelAnchor: { x: 50, y: 478, align: "end" } },
  { id: "ankle", label: "Ankle & foot", view: "anterior",
    shape: { kind: "ellipse", cx: 138, cy: 636, rx: 16, ry: 22 },
    labelAnchor: { x: 50, y: 636, align: "end" } },

  // Posterior
  { id: "head-back", label: "Headaches / base of skull", view: "posterior",
    shape: { kind: "ellipse", cx: 160, cy: 80, rx: 36, ry: 38 },
    labelAnchor: { x: 222, y: 80, align: "start" } },
  { id: "neck", label: "Neck (cervical)", view: "posterior",
    shape: { kind: "rect", x: 142, y: 118, w: 36, h: 28, r: 6 },
    labelAnchor: { x: 222, y: 132, align: "start" } },
  { id: "trap", label: "Upper traps", view: "posterior",
    shape: { kind: "rect", x: 110, y: 148, w: 100, h: 30, r: 14 },
    labelAnchor: { x: 222, y: 162, align: "start" } },
  { id: "upper-back", label: "Upper back (thoracic)", view: "posterior",
    shape: { kind: "rect", x: 122, y: 184, w: 76, h: 56, r: 8 },
    labelAnchor: { x: 222, y: 212, align: "start" } },
  { id: "lower-back", label: "Lower back (lumbar)", view: "posterior",
    shape: { kind: "rect", x: 124, y: 246, w: 72, h: 50, r: 8 },
    labelAnchor: { x: 222, y: 270, align: "start" } },
  { id: "glute", label: "Glutes / SI joint", view: "posterior",
    shape: { kind: "rect", x: 116, y: 304, w: 88, h: 50, r: 18 },
    labelAnchor: { x: 222, y: 328, align: "start" } },
  { id: "hamstring", label: "Hamstring", view: "posterior",
    shape: { kind: "rect", x: 124, y: 360, w: 32, h: 96, r: 10 },
    labelAnchor: { x: 60, y: 408, align: "end" } },
  { id: "knee-back", label: "Behind the knee", view: "posterior",
    shape: { kind: "ellipse", cx: 138, cy: 478, rx: 18, ry: 22 },
    labelAnchor: { x: 50, y: 478, align: "end" } },
  { id: "calf", label: "Calf / Achilles", view: "posterior",
    shape: { kind: "rect", x: 128, y: 510, w: 22, h: 100, r: 10 },
    labelAnchor: { x: 60, y: 560, align: "end" } },
];

export type RegionInfo = {
  caseCount: string;
  weeksTypical: string;
  approach: string;
  description: string;
};

export const REGION_DETAILS: Record<string, RegionInfo> = {
  head: {
    caseCount: "1–2 cases / week",
    weeksTypical: "4–8 weeks",
    approach: "Soft-tissue release · postural retraining · jaw work",
    description:
      "Tension headaches and jaw pain almost always trace back to the upper neck and shoulders. We treat the source, not the symptom.",
  },
  "head-back": {
    caseCount: "1–2 cases / week",
    weeksTypical: "4–8 weeks",
    approach: "Suboccipital release · upper-neck mobilisation · postural work",
    description:
      "Headaches that start at the base of the skull are typically driven by the cervical spine and upper traps. Two or three sessions and most clients feel different.",
  },
  neck: {
    caseCount: "3–4 cases / week",
    weeksTypical: "6–12 weeks",
    approach: "Manual mobilisation · trigger-point release · strength rehab",
    description:
      "Neck pain — including trapped nerves and the dreaded MRI showing 'wear and tear' — usually responds faster than people expect once the cause is identified.",
  },
  "neck-front": {
    caseCount: "1 case / week",
    weeksTypical: "4–6 weeks",
    approach: "Anterior-chain release · breathing work · postural retraining",
    description:
      "Pain at the front of the neck or under the jaw is often a tension pattern. Treatable, and usually quick.",
  },
  shoulder: {
    caseCount: "2–3 cases / week",
    weeksTypical: "8–12 weeks",
    approach: "Manual therapy · scapular control · loaded rehab",
    description:
      "Rotator-cuff pain, impingement, frozen shoulder. Most cases improve with a focused mix of hands-on work and progressive loading.",
  },
  chest: {
    caseCount: "<1 case / week",
    weeksTypical: "4–8 weeks",
    approach: "Rib mobilisation · postural retraining · breathing",
    description:
      "Chest-wall pain after a rib injury, surgery, or long-term postural patterns. We assess thoroughly to rule out other causes first.",
  },
  elbow: {
    caseCount: "1 case / week",
    weeksTypical: "6–10 weeks",
    approach: "Tendon-loading programmes · manual therapy · grip retraining",
    description:
      "Tennis elbow, golfer's elbow, and stubborn tendinopathies that didn't respond to rest. We use evidence-based loading to actually rebuild the tendon.",
  },
  wrist: {
    caseCount: "<1 case / week",
    weeksTypical: "4–8 weeks",
    approach: "Mobilisation · soft-tissue work · grip rehab",
    description:
      "Wrist and hand pain — from carpal tunnel patterns to post-fracture stiffness. We free up the joint and build back the strength.",
  },
  trap: {
    caseCount: "2 cases / week",
    weeksTypical: "4–8 weeks",
    approach: "Soft-tissue release · shoulder-blade control · breathing",
    description:
      "Upper-trap tension is usually a symptom of something else — desk posture, breathing patterns, weak mid-back. We treat the cause.",
  },
  "upper-back": {
    caseCount: "2 cases / week",
    weeksTypical: "6–10 weeks",
    approach: "Thoracic mobilisation · scapular work · loaded extension",
    description:
      "Mid-back pain is one of the most rewarding regions to treat — it almost always responds to the right mix of mobility and strength.",
  },
  "lower-back": {
    caseCount: "5–6 cases / week",
    weeksTypical: "8–16 weeks",
    approach: "Manual therapy · pain education · progressive loading rehab",
    description:
      "The most common reason people walk into the clinic. Most cases — including 'chronic' lumbar pain of 5+ years — respond well to a structured programme. This is what we treat most.",
  },
  glute: {
    caseCount: "2 cases / week",
    weeksTypical: "8–12 weeks",
    approach: "Manual therapy · neural mobilisation · loaded glute rehab",
    description:
      "Glute and SI-joint pain — including sciatica patterns and deep hip ache. We map the nerve and rebuild the hip.",
  },
  hip: {
    caseCount: "3 cases / week",
    weeksTypical: "8–12 weeks",
    approach: "Joint mobilisation · loaded hip rehab · gait retraining",
    description:
      "Anterior hip pain, FAI, deep groin ache, post-replacement stiffness. Most cases respond when we treat the joint and the surrounding muscle together.",
  },
  hamstring: {
    caseCount: "2 cases / week",
    weeksTypical: "6–10 weeks",
    approach: "Eccentric loading · running mechanics · soft-tissue work",
    description:
      "Stubborn hamstring strains and high-hamstring tendinopathy that keep recurring in runners and gym-goers. We rebuild it properly.",
  },
  knee: {
    caseCount: "2 cases / week",
    weeksTypical: "8–12 weeks",
    approach: "Manual therapy · loaded knee rehab · gait work",
    description:
      "Anterior knee pain, post-meniscectomy weakness, runner's knee. Most cases improve once we treat the hip, the foot, AND the knee.",
  },
  "knee-back": {
    caseCount: "1 case / week",
    weeksTypical: "6–10 weeks",
    approach: "Mobilisation · calf-hamstring loading · neural work",
    description:
      "Pain behind the knee can come from the calf, hamstring, or joint itself. We test, find the cause, and treat it.",
  },
  ankle: {
    caseCount: "1–2 cases / week",
    weeksTypical: "4–8 weeks",
    approach: "Joint mobilisation · balance · loaded calf rehab",
    description:
      "Ankle sprains that never quite recovered, plantar fasciitis, Achilles tendinopathy. We rebuild it from the ground up — literally.",
  },
  calf: {
    caseCount: "1 case / week",
    weeksTypical: "6–10 weeks",
    approach: "Eccentric loading · soft-tissue work · running mechanics",
    description:
      "Calf strains and Achilles pain that won't budge. The fix is almost always progressive loading done properly — not rest.",
  },
};

export const DEFAULT_REGION_INFO: RegionInfo = {
  caseCount: "Treated weekly",
  weeksTypical: "Varies by case",
  approach: "Assessment first. Plan built around what we find.",
  description:
    "Click any region on the body to see how often I treat it, typical recovery timeline, and the kind of plan I build for that area.",
};

export default function BodyMap({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [view, setView] = useState<View>("anterior");
  const regions = REGIONS.filter((r) => r.view === view);

  return (
    <div className="bodymap-canvas">
      <div className="bodymap-toggle" role="tablist" aria-label="Body view">
        <button
          type="button"
          role="tab"
          aria-selected={view === "anterior"}
          className={view === "anterior" ? "on" : ""}
          onClick={() => setView("anterior")}
        >
          Anterior
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "posterior"}
          className={view === "posterior" ? "on" : ""}
          onClick={() => setView("posterior")}
        >
          Posterior
        </button>
      </div>
      <span className="bodymap-cross">view · {view === "anterior" ? "front" : "back"}</span>

      <svg
        className="bodymap-svg"
        viewBox="0 0 320 720"
        role="img"
        aria-label="Anatomical body — tap a region to see how it's treated"
      >
        <defs>
          <filter id="bm-soft">
            <feGaussianBlur stdDeviation="0.4" />
          </filter>
        </defs>

        {/* Centre axis */}
        <line className="axis" x1="160" y1="20" x2="160" y2="700" />

        {/* Silhouette */}
        {view === "anterior" ? <AnteriorSilhouette /> : <PosteriorSilhouette />}

        {/* Region targets */}
        {regions.map((r) => {
          const isSel = selected === r.id;
          const baseProps = {
            className: `region ${isSel ? "selected" : ""}`,
            onClick: () => onSelect(r.id),
            "data-region": r.id,
            tabIndex: 0,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(r.id);
              }
            },
          } as const;
          const labelAnchor = r.labelAnchor.align ?? "start";
          return (
            <g key={r.id}>
              {r.shape.kind === "ellipse" ? (
                <ellipse
                  cx={r.shape.cx}
                  cy={r.shape.cy}
                  rx={r.shape.rx}
                  ry={r.shape.ry}
                  {...baseProps}
                />
              ) : (
                <rect
                  x={r.shape.x}
                  y={r.shape.y}
                  width={r.shape.w}
                  height={r.shape.h}
                  rx={r.shape.r ?? 4}
                  {...baseProps}
                />
              )}
              <text
                className="region-label"
                x={r.labelAnchor.x}
                y={r.labelAnchor.y}
                textAnchor={labelAnchor}
                dy="3"
              >
                {r.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------
   Silhouette paths — stylized anatomical, viewBox 320 x 720.
   ------------------------------------------------------------------- */
function AnteriorSilhouette() {
  return (
    <g className="silhouette-group">
      {/* Head */}
      <ellipse className="silhouette" cx="160" cy="68" rx="32" ry="40" />
      {/* Neck */}
      <path className="silhouette" d="M148 102 Q160 116 172 102 L172 124 Q160 130 148 124 Z" />
      {/* Torso */}
      <path
        className="silhouette"
        d="M110 140
           Q98 154 96 178
           L92 268
           Q98 286 116 296
           L204 296
           Q222 286 228 268
           L224 178
           Q222 154 210 140
           Q200 134 188 132
           L132 132
           Q120 134 110 140 Z"
      />
      {/* Hips/pelvis */}
      <path
        className="silhouette"
        d="M104 296 L216 296 L222 348 Q210 360 196 360 L124 360 Q110 360 98 348 Z"
      />
      {/* Left arm */}
      <path
        className="silhouette"
        d="M88 156 Q72 170 70 196 L66 248 Q62 268 64 292 L54 348 Q50 372 56 392 L62 422 L80 420 L86 392 Q88 372 90 348 L100 296 L102 248 L108 196 Q108 170 102 156 Z"
      />
      {/* Right arm */}
      <path
        className="silhouette"
        d="M232 156 Q248 170 250 196 L254 248 Q258 268 256 292 L266 348 Q270 372 264 392 L258 422 L240 420 L234 392 Q232 372 230 348 L220 296 L218 248 L212 196 Q212 170 218 156 Z"
      />
      {/* Left leg */}
      <path
        className="silhouette"
        d="M118 360 L120 460 Q116 488 122 520 L130 590 Q128 622 134 660 L150 660 L154 622 Q156 588 154 560 L156 488 Q158 460 156 432 L152 360 Z"
      />
      {/* Right leg */}
      <path
        className="silhouette"
        d="M168 360 L164 432 Q162 460 164 488 L166 560 Q164 588 166 622 L170 660 L186 660 Q192 622 190 590 L198 520 Q204 488 200 460 L202 360 Z"
      />
      {/* Feet */}
      <ellipse className="silhouette" cx="142" cy="676" rx="18" ry="14" />
      <ellipse className="silhouette" cx="178" cy="676" rx="18" ry="14" />
      {/* Collarbone hint */}
      <path
        d="M120 142 Q160 158 200 142"
        fill="none"
        stroke="oklch(0.20 0.005 60)"
        strokeWidth="1"
      />
      {/* Sternum hint */}
      <line x1="160" y1="158" x2="160" y2="240" stroke="oklch(0.20 0.005 60)" strokeWidth="0.8" />
    </g>
  );
}

function PosteriorSilhouette() {
  return (
    <g className="silhouette-group">
      {/* Head (back) */}
      <ellipse className="silhouette" cx="160" cy="72" rx="32" ry="42" />
      {/* Neck */}
      <path className="silhouette" d="M148 108 Q160 120 172 108 L172 130 Q160 136 148 130 Z" />
      {/* Torso */}
      <path
        className="silhouette"
        d="M108 144
           Q96 158 94 184
           L90 272
           Q98 290 116 300
           L204 300
           Q222 290 230 272
           L226 184
           Q224 158 212 144
           Q202 138 188 136
           L132 136
           Q118 138 108 144 Z"
      />
      {/* Hips/glutes */}
      <path
        className="silhouette"
        d="M102 300 L218 300 L226 360 Q212 374 196 374 L124 374 Q108 374 94 360 Z"
      />
      {/* Spinal column hint */}
      <line x1="160" y1="148" x2="160" y2="296" stroke="oklch(0.22 0.005 60)" strokeWidth="0.9" strokeDasharray="3 3" />
      {/* Shoulder blades hint */}
      <path d="M118 170 Q138 196 134 224" fill="none" stroke="oklch(0.22 0.005 60)" strokeWidth="0.8" />
      <path d="M202 170 Q182 196 186 224" fill="none" stroke="oklch(0.22 0.005 60)" strokeWidth="0.8" />
      {/* Left arm */}
      <path
        className="silhouette"
        d="M86 160 Q70 174 68 200 L64 252 Q60 272 62 296 L52 352 Q48 376 54 396 L60 424 L78 422 L84 396 Q86 376 88 352 L98 300 L100 252 L106 200 Q106 174 100 160 Z"
      />
      {/* Right arm */}
      <path
        className="silhouette"
        d="M234 160 Q250 174 252 200 L256 252 Q260 272 258 296 L268 352 Q272 376 266 396 L260 424 L242 422 L236 396 Q234 376 232 352 L222 300 L220 252 L214 200 Q214 174 220 160 Z"
      />
      {/* Left leg (back) */}
      <path
        className="silhouette"
        d="M118 374 L120 470 Q116 498 122 528 L130 596 Q128 626 134 664 L150 664 L154 626 Q156 596 154 564 L156 496 Q158 470 156 442 L152 374 Z"
      />
      {/* Right leg (back) */}
      <path
        className="silhouette"
        d="M168 374 L164 442 Q162 470 164 496 L166 564 Q164 596 166 626 L170 664 L186 664 Q192 626 190 596 L198 528 Q204 498 200 470 L202 374 Z"
      />
      {/* Feet */}
      <ellipse className="silhouette" cx="142" cy="680" rx="18" ry="14" />
      <ellipse className="silhouette" cx="178" cy="680" rx="18" ry="14" />
    </g>
  );
}
