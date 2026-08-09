import type { Metadata } from 'next';

import { GlassPanel, Kicker, MONO_LABEL, WaitlistBar } from '@/components';
import { SiteFooter } from '@/components/SiteFooter';
import { LoopDiagram } from '@/components/home/LoopDiagram';
import { LOOP_STATIONS } from '@/components/home/data';
import { AtmoMeshDrift } from '@/motion/atmo-mesh-drift';
import { Grain } from '@/motion/grain';
import { Ingest, IngestGroup } from '@/motion/motion-ingest';
import { COMPANIES } from '@/content/companies';
import { openGraphFor } from '@/lib/site';
import { FRAMEWORKS, allEdges, frameworksByDepth } from '@/registry';

/**
 * `/about-instinct` — the bridge (02-architecture; 04-phases S6).
 *
 * The page the whole site has been walking toward. Its job is one transition: the visitor
 * has just watched frameworks run on a company that felt real, and now needs to know what
 * the thing behind them is and what happens if they want it pointed at their own business.
 *
 * ## The three rules this page is built under
 *
 * **1 · The thesis is quoted, never rewritten.** 00-LAW Ruling 6 fixes the conversion
 * message as law: never *buy more framework reports*, always *"You ran the framework once.
 * Instinct keeps it running."* The other two lines on this page — *"Business frameworks
 * were never wallpaper. They were programs."* and *"AI is the processor. Instinct is the
 * compiler and runtime."* — are the essays', and they appear here exactly as they appear in
 * 00-LAW and 03-content-spec. The source essays are not in this repository, so this page
 * quotes what the law quotes and invents no new essay text. Nothing on this page is a
 * paraphrase of an argument it cannot cite.
 *
 * **2 · No amber.** The product frames below include the constraint — of course they do,
 * it is the pivot of the whole system — but naming a capability is not naming a binding
 * constraint. Amber belongs to the two surfaces that earn it: the conductor's page and step
 * eleven of the run (Ruling 2, team rule 3). A bridge page wearing amber to look important
 * would spend the site's most sacred colour on marketing.
 *
 * **3 · The honest v1 statement is not fine print.** It gets a section, in the same type
 * size as the promises above it. Everything on this site is authored; the lab is what opens
 * next; the waitlist is the only thing on the page that does anything, and in this build it
 * says plainly that it is not wired up.
 */

const TITLE = 'The bridge — The Strategy Stack, powered by Instinct';
const DESCRIPTION =
  'You ran the framework once. Instinct keeps it running. What the system behind this site is, what v1 honestly is not, and how to join the first wave.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...openGraphFor(TITLE, DESCRIPTION),
};

/** The product frames, 00-LAW's framing, in the order the loop runs them. */
const FRAMES: readonly { kicker: string; title: string; body: string }[] = [
  {
    kicker: 'research',
    title: 'Evidence before opinion',
    body: 'The system reads what the business already produces — exports, documents, transcripts, contracts — and turns it into source objects with dates and reliability. Everything downstream cites them. A finding that cannot name its object does not get made.',
  },
  {
    kicker: 'diagnostic',
    title: 'Frameworks as programs',
    body: 'Each framework is a program with typed inputs and typed outputs, not a template to fill in. It reads named fields of one shared business model and writes named fields back, which is what lets the next one start from the last one rather than from a blank page.',
  },
  {
    kicker: 'the constraint',
    title: 'One thing at a time',
    body: 'A hundred true findings is not a plan. Above the other instruments sits the prioritisation layer, whose only question is which single thing currently limits the throughput of the whole system — and whose only output is what to do about that one thing.',
  },
  {
    kicker: 'governed delegation',
    title: 'Work routed, accountability kept',
    body: 'The output is work, and work has to go somewhere. Some of it goes to people and some to agents, with capability boundaries, approval thresholds and an audit trail — and with a named human accountable for every outcome, which is the part that is not negotiable.',
  },
];

export default function AboutInstinctPage() {
  const full = frameworksByDepth('full').length;
  const chapters = FRAMEWORKS.length - full;
  const evidence = COMPANIES.reduce((n, c) => n + c.evidence.length, 0);

  return (
    <main data-testid="bridge-root" className="relative">
      <noscript>
        <style>{`[data-recipe],[data-recipe] *{opacity:1!important;transform:none!important;filter:none!important}`}</style>
      </noscript>

      {/* --------------------------------------------------------------- hero */}
      <header className="relative overflow-hidden">
        <AtmoMeshDrift seed={17} count={5} intensity={0.09} />
        <Grain />
        <div className="relative mx-auto w-full max-w-5xl px-5 pt-24 pb-10 sm:px-8 sm:pt-32">
          <Kicker index="V" variant="rule">
            the bridge · powered by instinct
          </Kicker>

          <h1
            className="font-narrative mt-7 max-w-[18ch] text-[clamp(40px,7.2vw,88px)] leading-[1.02] text-balance"
            style={{ color: 'var(--ink)' }}
          >
            You ran the framework once.{' '}
            <em className="italic" style={{ color: 'var(--flow)' }}>
              Instinct keeps it running.
            </em>
          </h1>

          {/* type/serif-over-data, used once on this page. */}
          <div className="relative mt-[-0.3em] max-w-3xl pt-16">
            <GlassPanel pad="lg" overhang elevated eyebrow="the thesis, in the essays' words">
              <p
                className="font-narrative max-w-[34ch] text-[clamp(22px,2.8vw,32px)] leading-[1.15]"
                style={{ color: 'var(--ink)' }}
              >
                Business frameworks were never wallpaper.{' '}
                <em className="italic">They were programs.</em>
              </p>
              <p className="mt-5 max-w-[60ch] text-[16px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
                A framework you fill in once is a document. The same framework, wired to the
                state the previous one wrote and re-run when the evidence moves, is a system.
                Everything on this site exists to make that difference visible before it is
                ever argued.
              </p>
              <p
                className="font-narrative mt-6 max-w-[38ch] border-t pt-5 text-[19px] leading-snug"
                style={{ color: 'var(--muted)', borderColor: 'var(--line)' }}
              >
                AI is the processor.{' '}
                <em className="italic" style={{ color: 'var(--ink)' }}>
                  Instinct is the compiler and runtime.
                </em>
              </p>
            </GlassPanel>
          </div>

          <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {[
              ['#frames', 'what instinct is'],
              ['#loop', 'the loop'],
              ['#honest', 'what v1 is not'],
              ['#join', 'join the first wave'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={`${MONO_LABEL} rounded-sm text-[10px] underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)]`}
                style={{ color: 'var(--muted)' }}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ------------------------------------------------------------ frames */}
      <section
        id="frames"
        aria-labelledby="frames-title"
        className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8 sm:py-24"
      >
        <Kicker index="01" variant="rule">
          what instinct is
        </Kicker>
        <h2
          id="frames-title"
          className="font-narrative mt-5 max-w-[22ch] text-[clamp(28px,4vw,46px)] leading-[1.06] text-balance"
          style={{ color: 'var(--ink)' }}
        >
          Four things, in the order they have to happen.
        </h2>
        <p className="mt-4 max-w-[64ch] text-[16px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
          Not four features. Four stages of one loop, each of which is useless without the one
          before it — which is why they arrive together or not at all.
        </p>

        <IngestGroup trigger="in-view" className="mt-10 grid gap-px overflow-hidden rounded-lg border sm:grid-cols-2" style={{ borderColor: 'var(--line)', background: 'var(--line)' }}>
          {FRAMES.map((frame, i) => (
            <article
              key={frame.kicker}
              data-frame={frame.kicker}
              className="px-6 py-7"
              style={{ background: 'color-mix(in srgb, var(--surface) 70%, var(--void))' }}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className={`${MONO_LABEL} text-[10px] tabular-nums`}
                  style={{ color: 'var(--faint)' }}
                >
                  {`0${i + 1}`}
                </span>
                <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
                  {frame.kicker}
                </span>
              </div>
              <h3
                className="font-narrative mt-3 max-w-[20ch] text-[24px] leading-tight"
                style={{ color: 'var(--ink)' }}
              >
                {frame.title}
              </h3>
              <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
                {frame.body}
              </p>
            </article>
          ))}
        </IngestGroup>
      </section>

      {/* -------------------------------------------------------------- loop */}
      <section
        id="loop"
        aria-labelledby="loop-title"
        className="mx-auto w-full max-w-5xl px-5 pb-20 sm:px-8 sm:pb-24"
      >
        <Kicker index="02" variant="rule">
          the loop
        </Kicker>
        <div className="mt-5 grid items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h2
              id="loop-title"
              className="font-narrative max-w-[20ch] text-[clamp(28px,4vw,46px)] leading-[1.06] text-balance"
              style={{ color: 'var(--ink)' }}
            >
              The difference is only that nobody has to remember to start it.
            </h2>
            <p className="mt-4 max-w-[56ch] text-[16px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
              Observe, model, diagnose, prioritise, delegate, measure — and round again, because
              measuring changes the evidence and changed evidence is a reason to re-run. Every
              company already does some of this, once a year, by hand, and loses the state
              between laps. Holding the state is the product.
            </p>
            <p className="mt-4 max-w-[56ch] text-[16px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
              This site is one lap, authored, so you can see the shape of it before deciding
              whether you want it running.
            </p>
          </div>
          <Ingest trigger="in-view">
            <LoopDiagram stations={LOOP_STATIONS} />
          </Ingest>
        </div>
      </section>

      {/* ------------------------------------------------------------ honest */}
      <section
        id="honest"
        aria-labelledby="honest-title"
        className="mx-auto w-full max-w-5xl px-5 pb-20 sm:px-8 sm:pb-24"
      >
        <Kicker index="03" variant="rule">
          what this build honestly is not
        </Kicker>
        <h2
          id="honest-title"
          className="font-narrative mt-5 max-w-[22ch] text-[clamp(28px,4vw,46px)] leading-[1.06] text-balance"
          style={{ color: 'var(--ink)' }}
        >
          Everything here is authored. That is the point, and it is also the limit.
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="grid content-start gap-4">
            <p className="max-w-[62ch] text-[16px] leading-[1.7]" style={{ color: 'var(--muted)' }}>
              There is no engine behind this site. No account, no upload, no model call, no
              stored state. Every word, every figure and every animation was written by hand,
              which is exactly why it can be this precise — and exactly why it cannot yet be
              pointed at your business.
            </p>
            <p className="max-w-[62ch] text-[16px] leading-[1.7]" style={{ color: 'var(--muted)' }}>
              The companies are fictional and will stay fictional. The evidence packs are
              invented so that they can be shown in full. The Strategy Run labels itself a
              simulation on every screen. None of that is modesty — a demonstration that quietly
              implies a live system would make the one claim this project cannot afford to have
              doubted.
            </p>
            <p className="max-w-[62ch] text-[16px] leading-[1.7]" style={{ color: 'var(--muted)' }}>
              What opens next is the lab: the same frameworks with an engine underneath them, an
              evidence store, and an approval step before anything is written to your company
              model. Those three arrive together, because any two of them without the third is
              the thing everyone already distrusts.
            </p>
          </div>

          <GlassPanel pad="lg" eyebrow="what is actually in this build">
            <ul className="grid gap-3">
              {[
                [`${FRAMEWORKS.length} frameworks in the registry`, `${full} at full depth, ${chapters} as chapters`],
                [`${allEdges().length} handoffs`, 'every one carrying named state fields, not prose'],
                [`${COMPANIES.length} example companies`, `${evidence} authored source objects between them`],
                ['1 scripted Strategy Run', 'twelve steps, interactive at every one, labelled a simulation'],
                ['0 live model calls', 'nothing on this site is generated while you read it'],
              ].map(([head, note]) => (
                <li key={head} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-[9px] inline-block h-[5px] w-[5px] shrink-0 rounded-full"
                    style={{ background: 'var(--flow)' }}
                  />
                  <span>
                    <span className="block text-[15px] leading-snug" style={{ color: 'var(--ink)' }}>
                      {head}
                    </span>
                    <span className="mt-1 block text-[13px] leading-snug" style={{ color: 'var(--faint)' }}>
                      {note}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>
      </section>

      {/* -------------------------------------------------------------- join */}
      <section
        id="join"
        data-testid="join-section"
        aria-labelledby="join-title"
        className="mx-auto w-full max-w-5xl px-5 pb-24 sm:px-8"
      >
        <div
          className="rounded-xl border p-6 sm:p-10"
          style={{
            borderColor: 'color-mix(in srgb, var(--flow) 28%, transparent)',
            background: 'color-mix(in srgb, var(--flow-deep) 8%, transparent)',
          }}
        >
          <Kicker index="04" variant="rule">
            join the first wave
          </Kicker>
          <h2
            id="join-title"
            className="font-narrative mt-5 max-w-[20ch] text-[clamp(30px,4.4vw,52px)] leading-[1.04] text-balance"
            style={{ color: 'var(--ink)' }}
          >
            Your company here, with the instruments live on it.
          </h2>
          <p className="mt-4 max-w-[60ch] text-[16px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
            One note when the lab opens, and nothing else. No newsletter, no drip, no reports to
            buy — the message this project is built on is that you should not need to buy the
            same framework twice.
          </p>
          <div className="mt-8 max-w-2xl">
            <WaitlistBar />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
