/**
 * The eleven chapter pages' motion teasers — **static frames, not animations**.
 *
 * 03-content-spec gives a chapter page a "motion-concept teaser (static frame from §10
 * table)". The distinction is the whole point of this file and is easy to get wrong: a
 * chapter is not a small full page, and shipping eleven half-built animations would be
 * eleven promises the lab has not yet earned. What ships instead is a *still* — one
 * authored frame of the recipe the full page will get, drawn in the same stroke-first SVG
 * grammar as the six showpieces, captioned with the recipe's registry name and the
 * one-line motion concept from appendix §10.
 *
 * Consequences of "static", stated so nobody re-adds them later:
 *
 *   - No `framer-motion`, no `'use client'`, no `useStage`. These are server components
 *     and they render identically with JavaScript off and under reduced motion, which is
 *     the entire reduced-motion contract for a chapter page (00-LAW Ruling 7).
 *   - No interaction and no `data-recipe` attribute. `data-recipe` marks a *performing*
 *     recipe; the recipe gallery and the S3 walks key off it, and a still that claimed it
 *     would be lying to the tests as well as to the visitor. These carry
 *     `data-teaser-frame` instead.
 *   - **No amber.** None of the eleven is a constraint surface (00-LAW Ruling 2, team
 *     rule 3): the constraint belongs to Theory of Constraints' page and to step eleven of
 *     the run. The frames are drawn in `--line-strong`, `--flow` and the text tokens.
 *
 * Geometry is shared so the eleven read as one set: a 480×200 user space, 1.5-unit strokes
 * with `non-scaling-stroke` so the hairlines survive being scaled down to a column, mono
 * labels at eleven units, and one accent — `--flow` — spent on the single element the
 * concept is about.
 */

import type { ReactNode } from 'react';

const VB = { w: 480, h: 200 } as const;

const STROKE = 'var(--line-strong)';
const ACCENT = 'var(--flow)';

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      className="h-auto w-full"
      role="img"
      aria-label={label}
      data-teaser-frame="true"
    >
      {children}
    </svg>
  );
}

/** A mono caption inside the frame — the system voice, at the frame's own scale. */
function Tag({
  x,
  y,
  children,
  anchor = 'middle',
  tone = 'var(--faint)',
  size = 11,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: 'start' | 'middle' | 'end';
  tone?: string;
  size?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className="font-system"
      fontSize={size}
      letterSpacing="0.12em"
      fill={tone}
    >
      {children}
    </text>
  );
}

/* ------------------------------------------------- terrain · pestle: signals orbit */

function PestleFrame() {
  const letters = ['P', 'E', 'S', 'T', 'L', 'E'];
  const cx = 240;
  const cy = 96;
  const rx = 168;
  const ry = 62;
  return (
    <Frame label="Six external signals orbiting the company at the centre; one signal has come close enough to read.">
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={STROKE}
        strokeWidth={1.5}
        strokeDasharray="3 7"
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={cx - 46}
        y={cy - 22}
        width={92}
        height={44}
        rx={4}
        fill="var(--surface)"
        stroke={STROKE}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <Tag x={cx} y={cy + 4} tone="var(--muted)">
        COMPANY
      </Tag>
      {letters.map((letter, i) => {
        const angle = ((-90 + (360 / letters.length) * i) * Math.PI) / 180;
        const x = cx + rx * Math.cos(angle);
        const y = cy + ry * Math.sin(angle);
        const near = i === 2;
        return (
          <g key={`${letter}-${i}`}>
            <circle
              cx={x}
              cy={y}
              r={near ? 13 : 10}
              fill={near ? 'color-mix(in srgb, var(--flow-deep) 30%, var(--surface))' : 'var(--surface)'}
              stroke={near ? ACCENT : STROKE}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
            <Tag x={x} y={y + 4} tone={near ? 'var(--ink)' : 'var(--faint)'}>
              {letter}
            </Tag>
          </g>
        );
      })}
      <Tag x={cx} y={186} tone="var(--faint)">
        LIKELIHOOD · IMPACT · HORIZON
      </Tag>
    </Frame>
  );
}

/* ------------------------------------------- advantage · tows: cards cross to mint */

function TowsFrame() {
  const rows = [
    { from: 'S', to: 'O', mint: 'SO' },
    { from: 'W', to: 'T', mint: 'WT' },
  ];
  return (
    <Frame label="Two pairs of quadrant cards sliding toward each other; where a pair crosses, a stamped strategy option is minted.">
      {rows.map((row, i) => {
        const y = 54 + i * 76;
        return (
          <g key={row.mint}>
            <rect
              x={16}
              y={y - 20}
              width={92}
              height={40}
              rx={4}
              fill="var(--surface)"
              stroke={STROKE}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
            <Tag x={62} y={y + 4} tone="var(--muted)">
              {row.from}
            </Tag>
            <rect
              x={372}
              y={y - 20}
              width={92}
              height={40}
              rx={4}
              fill="var(--surface)"
              stroke={STROKE}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
            <Tag x={418} y={y + 4} tone="var(--muted)">
              {row.to}
            </Tag>
            <path
              d={`M 112 ${y} L 196 ${y}`}
              stroke={STROKE}
              strokeWidth={1.5}
              strokeDasharray="4 5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`M 284 ${y} L 368 ${y}`}
              stroke={STROKE}
              strokeWidth={1.5}
              strokeDasharray="4 5"
              vectorEffect="non-scaling-stroke"
            />
            <rect
              x={200}
              y={y - 22}
              width={80}
              height={44}
              rx={4}
              fill="color-mix(in srgb, var(--flow-deep) 22%, var(--surface))"
              stroke={ACCENT}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
            <Tag x={240} y={y + 4} tone="var(--ink)">
              {row.mint}
            </Tag>
          </g>
        );
      })}
      <Tag x={240} y={186} tone="var(--faint)">
        MOST PAIRINGS MINT NOTHING
      </Tag>
    </Frame>
  );
}

/* ---------------------------------------------- direction · ansoff: route traces */

function AnsoffFrame() {
  const cells = [
    { x: 96, y: 34, label: 'PENETRATION' },
    { x: 264, y: 34, label: 'DEVELOPMENT' },
    { x: 96, y: 100, label: 'PRODUCT' },
    { x: 264, y: 100, label: 'DIVERSIFY' },
  ];
  return (
    <Frame label="An Ansoff two-by-two with a route traced from market penetration through product development into diversification.">
      {cells.map((cell, i) => (
        <rect
          key={cell.label}
          x={cell.x}
          y={cell.y}
          width={120}
          height={56}
          rx={3}
          fill={i === 3 ? 'color-mix(in srgb, var(--flow-deep) 18%, var(--surface))' : 'var(--surface)'}
          stroke={i === 3 ? ACCENT : STROKE}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {cells.map((cell) => (
        <Tag key={`t-${cell.label}`} x={cell.x + 60} y={cell.y + 33} tone="var(--muted)" size={10}>
          {cell.label}
        </Tag>
      ))}
      <path
        d="M 156 62 L 324 62 L 324 128"
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={156} cy={62} r={5} fill={ACCENT} />
      <path d="M 318 120 L 324 132 L 330 120" fill="none" stroke={ACCENT} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <Tag x={26} y={66} anchor="start" tone="var(--faint)" size={10}>
        EXISTING
      </Tag>
      <Tag x={26} y={132} anchor="start" tone="var(--faint)" size={10}>
        NEW MARKET
      </Tag>
      <Tag x={240} y={186} tone="var(--faint)">
        EACH STEP OUT IS A STEP UP IN RISK
      </Tag>
    </Frame>
  );
}

/* -------------------------------- direction · three horizons: resources across time */

function ThreeHorizonsFrame() {
  const bands = [
    { label: 'H1', width: 300, y: 40 },
    { label: 'H2', width: 132, y: 82 },
    { label: 'H3', width: 44, y: 124 },
  ];
  return (
    <Frame label="Three horizon bands over a time axis, with the third horizon's allocation visibly the thinnest.">
      {bands.map((band, i) => (
        <g key={band.label}>
          <Tag x={30} y={band.y + 17} anchor="start" tone="var(--faint)">
            {band.label}
          </Tag>
          <rect
            x={62}
            y={band.y}
            width={366}
            height={26}
            rx={3}
            fill="none"
            stroke={STROKE}
            strokeWidth={1.5}
            strokeDasharray="3 6"
            vectorEffect="non-scaling-stroke"
          />
          <rect
            x={62}
            y={band.y}
            width={band.width}
            height={26}
            rx={3}
            fill={
              i === 2
                ? 'color-mix(in srgb, var(--flow-deep) 26%, var(--surface))'
                : 'color-mix(in srgb, var(--raised) 90%, transparent)'
            }
            stroke={i === 2 ? ACCENT : STROKE}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}
      <path d="M 62 164 L 428 164" stroke={STROKE} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <Tag x={62} y={182} anchor="start" tone="var(--faint)" size={10}>
        THIS QUARTER
      </Tag>
      <Tag x={428} y={182} anchor="end" tone="var(--faint)" size={10}>
        THREE YEARS
      </Tag>
    </Frame>
  );
}

/* ------------------------------------------ direction · blue ocean: curves redraw */

function BlueOceanFrame() {
  const factors = ['PRICE', 'FEATURES', 'ONBOARD', 'SUPPORT', 'BRAND', 'SPEED'];
  const industry = [86, 44, 132, 96, 52, 118];
  const proposed = [118, 128, 40, 62, 120, 74];
  const x = (i: number) => 52 + i * 76;
  const line = (values: number[]) => values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${v}`).join(' ');
  return (
    <Frame label="Two value curves across six competing factors: the industry curve dashed, the proposed curve redrawn through different peaks.">
      {factors.map((factor, i) => (
        <g key={factor}>
          <path
            d={`M ${x(i)} 26 L ${x(i)} 148`}
            stroke={STROKE}
            strokeWidth={1}
            opacity={0.4}
            vectorEffect="non-scaling-stroke"
          />
          <Tag x={x(i)} y={170} tone="var(--faint)" size={9}>
            {factor}
          </Tag>
        </g>
      ))}
      <path
        d={line(industry)}
        fill="none"
        stroke={STROKE}
        strokeWidth={1.5}
        strokeDasharray="5 5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={line(proposed)}
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.5}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {proposed.map((v, i) => (
        <circle key={factors[i]} cx={x(i)} cy={v} r={4} fill={ACCENT} />
      ))}
      <Tag x={240} y={190} tone="var(--faint)">
        ELIMINATE · REDUCE · RAISE · CREATE
      </Tag>
    </Frame>
  );
}

/* ------------------------------------ customer · jobs to be done: struggle timeline */

function JtbdFrame() {
  const stations = ['CIRCUMSTANCE', 'STRUGGLE', 'SEARCH', 'CHOICE', 'USE', 'OUTCOME'];
  const x = (i: number) => 46 + i * 78;
  return (
    <Frame label="A struggle timeline of six stations from circumstance to outcome, with the moment of choice marked.">
      <path d={`M 46 90 L 436 90`} stroke={STROKE} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      {stations.map((station, i) => {
        const hot = i === 3;
        return (
          <g key={station}>
            <circle
              cx={x(i)}
              cy={90}
              r={hot ? 9 : 6}
              fill={hot ? ACCENT : 'var(--surface)'}
              stroke={hot ? ACCENT : STROKE}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
            <Tag
              x={x(i)}
              y={i % 2 === 0 ? 68 : 122}
              tone={hot ? 'var(--ink)' : 'var(--faint)'}
              size={9}
            >
              {station}
            </Tag>
          </g>
        );
      })}
      <path
        d="M 280 100 L 280 140 L 436 140"
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.5}
        strokeDasharray="4 5"
        vectorEffect="non-scaling-stroke"
      />
      <Tag x={436} y={158} anchor="end" tone="var(--faint)" size={10}>
        “I HIRED A SPREADSHEET INSTEAD”
      </Tag>
    </Frame>
  );
}

/* ------------------------- customer · value proposition canvas: matches and gaps */

function VpcFrame() {
  const rows = [72, 100, 128];
  return (
    <Frame label="The value map facing the customer profile: two pairings connect, one pain has nothing pointing at it.">
      <rect
        x={30}
        y={44}
        width={132}
        height={112}
        rx={4}
        fill="var(--surface)"
        stroke={STROKE}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={384}
        cy={100}
        r={62}
        fill="var(--surface)"
        stroke={STROKE}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <Tag x={96} y={34} tone="var(--faint)" size={10}>
        WHAT WE BUILT
      </Tag>
      <Tag x={384} y={26} tone="var(--faint)" size={10}>
        WHAT THE JOB NEEDS
      </Tag>
      {rows.map((y, i) => {
        const matched = i < 2;
        return (
          <g key={y}>
            <circle cx={162} cy={y} r={4} fill={matched ? ACCENT : STROKE} />
            <circle cx={322} cy={y} r={4} fill={matched ? ACCENT : STROKE} />
            <path
              d={`M 162 ${y} L 322 ${y}`}
              stroke={matched ? ACCENT : STROKE}
              strokeWidth={1.5}
              strokeDasharray={matched ? undefined : '3 6'}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      })}
      <Tag x={240} y={172} tone="var(--faint)">
        THE UNMATCHED ROW IS THE FINDING
      </Tag>
    </Frame>
  );
}

/* ------------------------------------------------- customer · kano: curves react */

function KanoFrame() {
  return (
    <Frame label="Kano's three response curves over the same axis: a must-be that saturates, a linear performance line, and a delighter that climbs late.">
      <path d="M 52 156 L 428 156" stroke={STROKE} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <path d="M 52 156 L 52 34" stroke={STROKE} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <path
        d="M 52 152 C 140 148 190 96 428 92"
        fill="none"
        stroke={STROKE}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M 52 148 L 428 52"
        fill="none"
        stroke={STROKE}
        strokeWidth={1.5}
        strokeDasharray="5 5"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M 52 150 C 280 150 340 128 428 40"
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <Tag x={424} y={106} anchor="end" tone="var(--faint)" size={9}>
        MUST-BE
      </Tag>
      <Tag x={424} y={68} anchor="end" tone="var(--faint)" size={9}>
        PERFORMANCE
      </Tag>
      <Tag x={424} y={32} anchor="end" tone="var(--ink)" size={9}>
        DELIGHTER
      </Tag>
      <Tag x={52} y={176} anchor="start" tone="var(--faint)" size={9}>
        ABSENT
      </Tag>
      <Tag x={240} y={176} tone="var(--faint)" size={9}>
        HOW WELL IT IS DONE
      </Tag>
    </Frame>
  );
}

/* --------------------------------------- alignment · mckinsey 7s: tension network */

function SevenSFrame() {
  const labels = ['STRATEGY', 'STRUCTURE', 'SYSTEMS', 'VALUES', 'SKILLS', 'STYLE', 'STAFF'];
  const cx = 240;
  const cy = 90;
  const r = 58;
  const points = labels.map((label, i) => {
    const angle = ((-90 + (360 / labels.length) * i) * Math.PI) / 180;
    return { label, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), angle };
  });
  return (
    <Frame label="Seven organisational elements wired to each other; one link is drawn taut to show the tension between structure and staff.">
      {points.map((a, i) =>
        points.slice(i + 1).map((b) => {
          const taut =
            (a.label === 'STRUCTURE' && b.label === 'STAFF') ||
            (a.label === 'STAFF' && b.label === 'STRUCTURE');
          return (
            <path
              key={`${a.label}-${b.label}`}
              d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`}
              stroke={taut ? ACCENT : STROKE}
              strokeWidth={taut ? 1.5 : 1}
              opacity={taut ? 1 : 0.4}
              vectorEffect="non-scaling-stroke"
            />
          );
        }),
      )}
      {points.map((p) => {
        const taut = p.label === 'STRUCTURE' || p.label === 'STAFF';
        // Labels sit on the ray through their node, pushed out far enough to clear the
        // chord bundle and still land inside the frame at the bottom of the ring.
        const outward = 1 + 22 / r;
        return (
          <g key={p.label}>
            <circle
              cx={p.x}
              cy={p.y}
              r={7}
              fill={taut ? ACCENT : 'var(--surface)'}
              stroke={taut ? ACCENT : STROKE}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
            <Tag
              x={cx + (p.x - cx) * outward}
              y={cy + (p.y - cy) * outward + 4}
              tone={taut ? 'var(--ink)' : 'var(--faint)'}
              size={9}
            >
              {p.label}
            </Tag>
          </g>
        );
      })}
      <Tag x={240} y={194} tone="var(--faint)">
        PULL ONE, THE OTHERS MOVE
      </Tag>
    </Frame>
  );
}

/* ------------------------------------- alignment · balanced scorecard: causal arrows */

function ScorecardFrame() {
  const rows = [
    { label: 'LEARNING', y: 148 },
    { label: 'INTERNAL', y: 112 },
    { label: 'CUSTOMER', y: 76 },
    { label: 'FINANCIAL', y: 40 },
  ];
  return (
    <Frame label="Four scorecard perspectives stacked, with a causal chain rising from learning through internal and customer measures into the financial result.">
      {rows.map((row) => (
        <g key={row.label}>
          <rect
            x={96}
            y={row.y - 14}
            width={300}
            height={28}
            rx={3}
            fill="var(--surface)"
            stroke={STROKE}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          <Tag x={88} y={row.y + 4} anchor="end" tone="var(--faint)" size={9}>
            {row.label}
          </Tag>
        </g>
      ))}
      <path
        d="M 180 134 L 180 126 M 180 98 L 180 90 M 180 62 L 180 54"
        stroke={ACCENT}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      {[126, 90, 54].map((y) => (
        <path
          key={y}
          d={`M 174 ${y + 6} L 180 ${y - 2} L 186 ${y + 6}`}
          fill="none"
          stroke={ACCENT}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {[148, 112, 76, 40].map((y) => (
        <circle key={y} cx={180} cy={y} r={4} fill={ACCENT} />
      ))}
      <path
        d="M 300 148 L 300 40"
        stroke={STROKE}
        strokeWidth={1.5}
        strokeDasharray="3 6"
        vectorEffect="non-scaling-stroke"
      />
      <Tag x={300} y={30} tone="var(--faint)" size={9}>
        UNWRITTEN
      </Tag>
      <Tag x={240} y={186} tone="var(--faint)">
        A MEASURE NOBODY WRITES TO DECAYS
      </Tag>
    </Frame>
  );
}

/* -------------------------------------------------- alignment · okrs: the tree grows */

function OkrFrame() {
  const krs = [
    { x: 150, y: 108 },
    { x: 240, y: 108 },
    { x: 330, y: 108 },
  ];
  return (
    <Frame label="An objective branching into three key results, each with its own initiative beneath it.">
      <rect
        x={180}
        y={30}
        width={120}
        height={34}
        rx={4}
        fill="color-mix(in srgb, var(--flow-deep) 22%, var(--surface))"
        stroke={ACCENT}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <Tag x={240} y={51} tone="var(--ink)" size={10}>
        OBJECTIVE
      </Tag>
      {krs.map((kr) => (
        <g key={kr.x}>
          <path
            d={`M 240 64 C 240 88 ${kr.x} 80 ${kr.x} ${kr.y - 16}`}
            fill="none"
            stroke={STROKE}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          <rect
            x={kr.x - 44}
            y={kr.y - 16}
            width={88}
            height={30}
            rx={3}
            fill="var(--surface)"
            stroke={STROKE}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          <Tag x={kr.x} y={kr.y + 4} tone="var(--muted)" size={10}>
            KEY RESULT
          </Tag>
          <path
            d={`M ${kr.x} ${kr.y + 14} L ${kr.x} ${kr.y + 34}`}
            stroke={STROKE}
            strokeWidth={1.5}
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
          />
          <rect
            x={kr.x - 34}
            y={kr.y + 34}
            width={68}
            height={22}
            rx={3}
            fill="none"
            stroke={STROKE}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          <Tag x={kr.x} y={kr.y + 49} tone="var(--faint)" size={9}>
            WORK
          </Tag>
        </g>
      ))}
      <Tag x={240} y={190} tone="var(--faint)">
        BASELINE · TARGET · OWNER · CONFIDENCE
      </Tag>
    </Frame>
  );
}

/* ------------------------------------------------------------------ the register */

export interface ChapterTeaser {
  /** The one-line motion concept from appendix §10 — what the full recipe will do. */
  readonly concept: string;
  /** What this particular still is showing, in the teaching voice. */
  readonly caption: string;
  readonly frame: ReactNode;
}

/**
 * One still per chapter framework, keyed by registry id so a page cannot render a frame
 * that belongs to another framework. Declared with `satisfies` rather than annotated, so
 * each key stays a known property — an annotated `Record` would make every lookup
 * `| undefined` under `noUncheckedIndexedAccess` and push a non-null assertion into every
 * call site for no gain in safety.
 */
export const CHAPTER_TEASERS = {
  pestle: {
    concept: 'signals orbit the company, each carrying a likelihood, an impact and a horizon',
    caption:
      'Six external forces circle the business at their own speed. The full recipe brings each one close enough to read when its evidence lands — and leaves the rest in orbit.',
    frame: <PestleFrame />,
  },
  tows: {
    concept: 'cards slide toward each other and cross, minting a stamped option at the intersection',
    caption:
      'The cross is the whole framework: two entries you already collected meet, and only some pairings produce a strategy worth writing down.',
    frame: <TowsFrame />,
  },
  ansoff: {
    concept: 'a route traces across the quadrants, each step out carrying its own risk',
    caption:
      'The matrix is a map of routes, not a menu of boxes. The full recipe walks the route you are actually proposing and prices the risk of every step it takes.',
    frame: <AnsoffFrame />,
  },
  'three-horizons': {
    concept: 'resources move across time; starving one horizon visibly fills another',
    caption:
      'Three allocations against one clock. Dragging money into the near horizon is meant to feel like what it is — taking it from somewhere.',
    frame: <ThreeHorizonsFrame />,
  },
  'blue-ocean': {
    concept: 'the value curve redraws as factors are eliminated, reduced, raised or created',
    caption:
      'The dashed line is what the industry competes on. The solid one is the shape you would have to be willing to draw instead.',
    frame: <BlueOceanFrame />,
  },
  'jobs-to-be-done': {
    concept: 'a struggle timeline replays from circumstance to outcome, quotes attached',
    caption:
      'One customer’s progress, laid out in time. The full recipe opens the interview excerpt behind each station, because the quote is the finding.',
    frame: <JtbdFrame />,
  },
  'value-proposition-canvas': {
    concept: 'matches and gaps illuminate between the value map and the customer profile',
    caption:
      'Every line that connects is a claim you can defend. The line that does not connect is the one the roadmap has been ignoring.',
    frame: <VpcFrame />,
  },
  kano: {
    concept: 'satisfaction curves react as features are dragged along the fulfilment axis',
    caption:
      'Three different shapes of response to the same effort. Which curve a feature sits on decides whether improving it is worth anything at all.',
    frame: <KanoFrame />,
  },
  'mckinsey-7s': {
    concept: 'a tension network — pulling one element reveals strain in the others',
    caption:
      'Seven elements, wired. The full recipe lets you pull one and watch where the organisation resists, which is usually not where the slide said it would.',
    frame: <SevenSFrame />,
  },
  'balanced-scorecard': {
    concept: 'causal arrows rise between the four perspectives, and unwritten measures fade',
    caption:
      'The chain of cause is the point: a learning measure that never reaches the financial row is a number somebody is collecting for nothing.',
    frame: <ScorecardFrame />,
  },
  okrs: {
    concept: 'a tree grows from the strategy down through objectives, key results and work',
    caption:
      'Objectives branch into results, results into work. The full recipe grows the tree from whatever the constraint framework just wrote, so the quarter starts where the diagnosis ended.',
    frame: <OkrFrame />,
  },
} satisfies Record<string, ChapterTeaser>;
