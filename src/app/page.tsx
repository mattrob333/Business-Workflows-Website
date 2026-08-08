import type { Metadata } from 'next';

import { GlassPanel } from '@/components/GlassPanel';
import { Kicker } from '@/components/Kicker';
import { WaitlistBar } from '@/components/WaitlistBar';
import { MetricLine } from '@/components/framework-page/Claims';
import { FOCUS_RING, MONO_LABEL } from '@/components/styles';
import { beaconMechanical } from '@/content/companies/beacon-mechanical';
import { ActBoard } from '@/components/home/ActBoard';
import { ActBridge } from '@/components/home/ActBridge';
import { ActConductor } from '@/components/home/ActConductor';
import { ActDelegation } from '@/components/home/ActDelegation';
import { ActInstruments } from '@/components/home/ActInstruments';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HomeStage } from '@/components/home/HomeStage';
import {
  ACTS,
  COMPANY,
  FICTION_CHIP,
  HERO_METRICS,
  HERO_METRIC_LABELS,
  HERO_SECTOR,
} from '@/components/home/data';
import { Act } from '@/motion/acts';
import { AtmoMeshDrift } from '@/motion/atmo-mesh-drift';
import { Grain } from '@/motion/grain';

/**
 * `/` — the homepage (04-phases S4).
 *
 * ## What this page is
 *
 * A scrollytelling documentary in five acts: **one fictional company gets diagnosed while
 * you scroll** (03-content-spec, "the homepage — five acts"). Beacon Mechanical is the
 * patient throughout; the frameworks are the instruments; the visitor's arc is 00-LAW
 * Ruling 1's, made visible before it is ever argued.
 *
 *   I   · the board state   — `fw/bmc-assemble`, the canvas filling itself from evidence
 *   II  · the instruments   — the framework graph, edges lighting as outputs hand off
 *   III · the conductor     — `fw/toc-flow`, the bottleneck, and the page's first amber
 *   IV  · the delegation    — `fw/raci-route`, the packet stopping at a human
 *   V   · the bridge        — the loop, then the waitlist and a quiet footer
 *
 * ## The two constraints this file is arranged around
 *
 * **`LCP < 2.0s` (Ruling 7) is the hard line on this page**, and the hero is the LCP
 * element. So the hero below is *plain server-rendered markup*: no `motion` wrapper, no
 * entrance variant, no opacity gate, nothing that waits for hydration to become visible.
 * The atmosphere and the grain are absolutely-positioned siblings behind it, and every
 * animation on this page happens to things *around* the headline — the canvas assembling,
 * the chips landing, the pipe backing up — never to the headline itself. The S4 walk
 * fetches the raw HTML and fails if the `h1` carries `opacity: 0`.
 *
 * The same ruling permits one WebGL/canvas moment on this page and it is **not taken**.
 * A hero shader is the most expensive object a homepage can buy and the least legible
 * argument it can make; the budget is spent instead on five acts of real diagrams that
 * teach. The designed static hero *is* the answer to Ruling 7's "with a static designed
 * fallback" — there is nothing to fall back from.
 *
 * **The amber law** (Ruling 2, team rule 3). ACT III carries the page's first and only
 * amber, inside `[data-amber-surface]` on files that already hold the `amber-law` pragma.
 * The hero and the other four acts are asserted amber-*free* — an absence, not a
 * containment. See `components/home/ActConductor` for the choreography in full.
 *
 * ## Where the work happens
 *
 * `components/home/data.ts` derives everything from `src/registry` and Beacon's authored
 * pack at build time; the act compositions are server components; the only client islands
 * are the motion recipes themselves plus `HomeStage`, which owns Lenis and the acts'
 * scroll clock. The registry and the company pack never enter the browser bundle.
 */

export const metadata: Metadata = {
  title: 'The Strategy Stack — business frameworks, finally running.',
  description:
    'A strategy simulator you can walk through: watch six frameworks run on one company, hand their output to each other, and find the one constraint that binds.',
};

export default function Home() {
  return (
    <main data-testid="home-root" className="relative">
      {/*
        With JavaScript off, Framer holds entrance variants at opacity 0 and drawn paths
        at a full dash offset. Ruling 7 requires every diagram to be readable in its final
        state without JS, so the no-JS path force-resolves both.
      */}
      <noscript>
        <style>{`[data-recipe],[data-recipe] *{opacity:1!important;transform:none!important;filter:none!important;stroke-dasharray:none!important;stroke-dashoffset:0!important}`}</style>
      </noscript>

      {/* ---------------------------------------------------------------- hero */}
      <header data-testid="hero" className="relative overflow-hidden">
        <AtmoMeshDrift seed={11} count={4} intensity={0.09} />
        <Grain />

        <div
          data-copy="hero"
          className="relative mx-auto w-full max-w-5xl px-5 pt-24 pb-16 sm:px-8 sm:pt-32 sm:pb-20"
        >
          <Kicker variant="rule">the strategy stack · powered by instinct</Kicker>

          {/*
            The LCP element. Static, opaque, and first in the column — nothing above it
            loads, nothing around it gates it, and it is styled entirely by CSS that ships
            in the initial payload.
          */}
          <h1
            data-testid="hero-headline"
            className="font-narrative mt-7 max-w-[17ch] text-[clamp(40px,7.4vw,88px)] leading-[1.02] text-balance"
            style={{ color: 'var(--ink)' }}
          >
            Business frameworks were never wallpaper. They were{' '}
            <em className="italic">programs</em>.
          </h1>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-start">
            <div>
              <p
                data-testid="hero-subline"
                className="text-[19px] leading-[1.5]"
                style={{ color: 'var(--ink)' }}
              >
                Business frameworks, finally running.
              </p>

              <p
                className="mt-4 max-w-[54ch] text-[16px] leading-[1.65]"
                style={{ color: 'var(--muted)' }}
              >
                Scroll, and one company gets diagnosed. Nine blocks assemble from its own
                records. The instruments read them and hand their output to each other. One
                finding turns out to be binding, and the work routes to the people and
                agents who do it.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#watch"
                  data-testid="cta-watch"
                  className={`${MONO_LABEL} ${FOCUS_RING} inline-flex items-center justify-center rounded-md border px-6 py-[13px] text-[11px] transition-colors`}
                  style={{
                    color: 'var(--ink)',
                    borderColor: 'color-mix(in srgb, var(--flow) 55%, transparent)',
                    background: 'color-mix(in srgb, var(--flow-deep) 22%, transparent)',
                  }}
                >
                  Watch it run ↓
                </a>
                <a
                  href="#join"
                  data-testid="cta-join"
                  className={`${MONO_LABEL} ${FOCUS_RING} inline-flex items-center justify-center rounded-md border px-6 py-[13px] text-[11px] transition-colors`}
                  style={{ color: 'var(--muted)', borderColor: 'var(--line-strong)' }}
                >
                  Join the first wave
                </a>
              </div>

              {/*
                Ruling 4, on the page that most needs it: the company is invented, and the
                site says so beside the first numbers it shows you.
              */}
              <p
                className={`${MONO_LABEL} mt-8 flex items-start gap-2 text-[10px]`}
                style={{ color: 'var(--faint)' }}
              >
                <span
                  aria-hidden="true"
                  className="mt-[6px] inline-block h-[5px] w-[5px] shrink-0 rounded-full"
                  style={{ background: 'var(--line-strong)' }}
                />
                {FICTION_CHIP}
              </p>
            </div>

            {/*
              The case file. Three readings, each carrying the object it came from — the
              symptom stated in the system voice before any framework has run on it. It is
              static markup: `panel/glass` animates only its lift, so nothing here waits
              for hydration to become visible.
            */}
            <GlassPanel pad="md" eyebrow="under examination" elevated>
              <p className="font-narrative text-[26px] leading-tight" style={{ color: 'var(--ink)' }}>
                {COMPANY}
              </p>
              <p className="mt-1 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
                {HERO_SECTOR}
              </p>
              <div className="mt-4 grid gap-2">
                {HERO_METRICS.map((metric) => (
                  <MetricLine
                    key={metric.label}
                    metric={metric}
                    company={beaconMechanical}
                    label={HERO_METRIC_LABELS[metric.label] ?? metric.label}
                  />
                ))}
              </div>
              <p className="mt-4 text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
                Its best year on paper, and the same number of jobs finished as last year.
                Everyone in the building has an explanation.
              </p>
            </GlassPanel>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- the five acts */}
      <HomeStage id="watch" acts={ACTS}>
        <Act id="board" pin={2.2}>
          <ActBoard />
        </Act>
        <Act id="instruments" pin={2}>
          <ActInstruments />
        </Act>
        <Act id="conductor" pin={2.2}>
          <ActConductor />
        </Act>
        <Act id="delegation" pin={2}>
          <ActDelegation />
        </Act>
        <Act id="bridge" pin={2}>
          <ActBridge />
        </Act>
      </HomeStage>

      {/* ------------------------------------------------------------- the door */}
      <section
        id="join"
        data-testid="join-section"
        aria-labelledby="join-title"
        className="relative py-20 sm:py-24"
      >
        <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
          <Kicker index="06" variant="rule">
            the first wave
          </Kicker>
          <h2
            id="join-title"
            data-copy="join"
            className="font-narrative mt-5 max-w-[22ch] text-[clamp(28px,4vw,46px)] leading-[1.06] text-balance"
            style={{ color: 'var(--ink)' }}
          >
            Your company here, with the frameworks{' '}
            <em className="italic">live on it</em>.
          </h2>
          <p
            data-copy="join-lede"
            className="mt-4 max-w-[62ch] text-[16px] leading-[1.65]"
            style={{ color: 'var(--muted)' }}
          >
            Everything above is authored: a fictional company, an evidence pack written by
            hand, and animations that always tell the same story. Running this on a real
            business needs an engine, and the engine arrives with the evidence and approval
            discipline the demonstration above implies — not before it.
          </p>
          <div className="mt-9 max-w-2xl">
            <WaitlistBar />
          </div>
        </div>
      </section>

      <HomeFooter />
    </main>
  );
}
