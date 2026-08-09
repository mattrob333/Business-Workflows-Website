/**
 * The chapter page — the other eleven (03-content-spec, 04-phases S6).
 *
 * ## Why this is not `FrameworkPageConfig` at a smaller size
 *
 * The six full pages are showpieces: a performing motion recipe, an interactive island, a
 * prediction that pays off, an evidence sweep over every figure. A chapter has none of
 * those and should not pretend to. 03-content-spec is precise about what it *is* — hero
 * question, position-in-graph mini-map, motion-concept teaser as a **static frame**, a
 * lesson summary of around four hundred words, and *notify me when the lab opens* — and
 * that list is a different, smaller pattern rather than a subset of the big one.
 *
 * So this is a separate template with its own content shape (`content/frameworks/chapters`),
 * selected by `depth` in the route. The two templates share what is genuinely shared and
 * nothing else: `PageSection`'s rhythm, `GraphMiniMap`, `StatePanel`, the handoff contract
 * in `handoff.ts`, and `WaitlistBar`. What they deliberately do not share is the config
 * type — a chapter cannot accidentally acquire a half-built showpiece, because there is
 * nowhere to put one.
 *
 * ## The five things a chapter page must not do
 *
 * 1. **No amber.** None of the eleven is a constraint surface (00-LAW Ruling 2, team rule
 *    3). The constraint belongs to `/frameworks/theory-of-constraints` and to step eleven
 *    of the run, and nothing here — not the teaser, not the handoff, not the notify panel —
 *    may borrow it for emphasis.
 * 2. **No figures.** There is no example-company evidence pack bound to this page, so there
 *    is nothing that could source a number (Ruling 4). The summaries are written without
 *    them; the only digits on the page come from the registry's own counts, which are
 *    facts about the graph rather than claims about a business.
 * 3. **No animation.** The teaser is one authored still. It renders identically with
 *    JavaScript off and under reduced motion, which is the whole reduced-motion contract
 *    for this route (Ruling 7).
 * 4. **No fake door.** The notify panel is `WaitlistBar` in whatever state the build
 *    actually supports — unconfigured, and saying so, in this one.
 * 5. **No invented ordering.** Everything about where this framework sits — what feeds it,
 *    what it feeds, what to run next — is read from the registry, exactly as the six full
 *    pages read it.
 */

import { GlassPanel, Kicker, MONO_LABEL } from '@/components';
import { GraphMiniMap } from '@/components/GraphMiniMap';
import { SiteFooter } from '@/components/SiteFooter';
import { WaitlistBar } from '@/components/WaitlistBar';
import type { ChapterContent } from '@/content/frameworks/chapters';
import type { Company } from '@/content/companies';
import { AtmoMeshDrift } from '@/motion/atmo-mesh-drift';
import { Grain } from '@/motion/grain';
import { GROUPS, type Framework } from '@/registry';

import { IncomingState } from './IncomingState';
import { PageSection } from './PageSection';
import { StatePanel } from './StatePanel';
import type { HandoffTarget } from './handoff';
import type { IncomingCompany, IncomingSource } from './IncomingState';

const JUMPS: [string, string][] = [
  ['#position', 'where it sits'],
  ['#teaser', 'the motion it gets'],
  ['#chapter', 'the chapter'],
  ['#notify', 'notify me'],
];

export interface ChapterPageProps {
  framework: Framework;
  content: ChapterContent;
  /** The company the full page will run on, once the lab opens. Named, never simulated. */
  company: Company;
  /** One line from the registry binding: what this framework shows on that company. */
  exampleNote: string;
  targets: readonly HandoffTarget[];
  sources: IncomingSource[];
  companies: IncomingCompany[];
}

export function ChapterPage({
  framework,
  content,
  company,
  exampleNote,
  targets,
  sources,
  companies,
}: ChapterPageProps) {
  const group = GROUPS.find((g) => g.id === framework.group);
  const fedBy = sources.map((s) => s.name);
  const feeds = targets.map((t) => t.framework.name);

  return (
    <main
      data-testid="framework-page-root"
      data-framework={framework.id}
      data-slug={framework.slug}
      data-depth="chapter"
      className="relative"
    >
      {/* ------------------------------------------------------------- hero */}
      <header className="relative overflow-hidden">
        <AtmoMeshDrift seed={framework.name.length + 3} count={3} intensity={0.07} />
        <Grain />
        <div className="relative mx-auto w-full max-w-5xl px-5 pt-24 pb-10 sm:px-8 sm:pt-28">
          <Kicker variant="rule">
            {group ? `${group.label} · ${group.blurb}` : 'framework'} · chapter
          </Kicker>

          <h1
            className="font-narrative mt-7 max-w-[16ch] text-[clamp(40px,7vw,84px)] leading-[1.02] text-balance"
            style={{ color: 'var(--ink)' }}
          >
            {framework.name}
          </h1>

          {/* type/serif-over-data, used once on this page. */}
          <div className="relative mt-[-0.3em] max-w-3xl pt-14">
            <GlassPanel pad="lg" overhang elevated eyebrow="the question it answers">
              <p className="max-w-[58ch] text-[17px] leading-[1.6]" style={{ color: 'var(--ink)' }}>
                {framework.coreQuestion}
              </p>
              <p
                className="mt-4 max-w-[62ch] text-[15px] leading-[1.65]"
                style={{ color: 'var(--muted)' }}
              >
                This is a chapter: the framework&apos;s place in the graph, what it reads and
                writes, and the argument in about four hundred words. The lab version will run
                it on <span style={{ color: 'var(--ink)' }}>{company.name}</span> — {exampleNote}
              </p>
              <div
                className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4"
                style={{ borderColor: 'var(--line)' }}
              >
                {[
                  ['reads', `${framework.readsFrom.length} fields`],
                  ['writes', `${framework.writesTo.length} fields`],
                  ['feeds', `${framework.feedsInto.length} frameworks`],
                  ['recipe', framework.motionRecipe],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                      {k}
                    </div>
                    <div className="font-system mt-1 text-[12px]" style={{ color: 'var(--ink)' }}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>

          <IncomingState sources={sources} companies={companies} className="mt-6 max-w-3xl" />

          <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {JUMPS.map(([href, label]) => (
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

      {/* ------------------------------------------- 1 · position in the graph */}
      <PageSection
        id="position"
        index="01"
        kicker="position in the graph"
        title={<>You are here, and these are the lines into it.</>}
        lede="A framework's meaning is mostly its neighbours. This is the same map the library draws, with this record lit."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <GlassPanel pad="md" eyebrow="the seventeen">
            <GraphMiniMap current={framework.id} />
          </GlassPanel>
          <div className="grid content-start gap-5">
            <div>
              <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
                fed by
              </div>
              <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
                {fedBy.length > 0
                  ? fedBy.join(' · ')
                  : 'Nothing upstream — this one reads the business directly.'}
              </p>
            </div>
            <div>
              <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
                feeds
              </div>
              <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
                {feeds.length > 0
                  ? feeds.join(' · ')
                  : 'Nothing downstream — this is a terminal node.'}
              </p>
            </div>
            <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--faint)' }}>
              Every one of those lines carries named state fields rather than a summary. The
              panel further down prints exactly which.
            </p>
          </div>
        </div>
      </PageSection>

      {/* --------------------------------------- 2 · the motion concept, as a still */}
      <PageSection
        id="teaser"
        index="02"
        kicker={`motion concept · ${framework.motionRecipe}`}
        title={<>One frame of the animation this page will get.</>}
        lede="A still, not a preview. The recipe below is named, specified and already built for the frameworks that use it at full depth — this chapter shows the frame it will resolve to, and nothing it has not earned."
      >
        <figure data-testid="chapter-teaser" data-recipe-name={framework.motionRecipe}>
          <div
            className="overflow-hidden rounded-lg border p-6 sm:p-8"
            style={{
              borderColor: 'var(--line)',
              background: 'color-mix(in srgb, var(--surface) 62%, transparent)',
            }}
          >
            {content.teaser.frame}
          </div>
          <figcaption className="mt-4 grid gap-2">
            <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
              {framework.motionRecipe} · {content.teaser.concept}
            </span>
            <span className="max-w-[64ch] text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              {content.teaser.caption}
            </span>
          </figcaption>
        </figure>
      </PageSection>

      {/* ---------------------------------------------------- 3 · the chapter */}
      <PageSection
        id="chapter"
        index="03"
        kicker="the chapter"
        title={<>What it is, when it earns its place, and how it goes wrong.</>}
      >
        <article className="max-w-[68ch]">
          <content.Summary />
        </article>
        <div className="mt-14">
          <div className={`${MONO_LABEL} mb-4 text-[10px]`} style={{ color: 'var(--faint)' }}>
            the signature · straight from the registry
          </div>
          <StatePanel framework={framework} targets={targets} />
        </div>
      </PageSection>

      {/* ------------------------------------------------------ 4 · notify me */}
      <PageSection
        id="notify"
        index="04"
        kicker="notify me when the lab opens"
        title={
          <>
            The chapter is honest about being a <em className="italic">chapter</em>.
          </>
        }
        lede="Six frameworks ship at full depth in this build because six could be made exceptional. This one is queued behind them, and the form below will not pretend otherwise."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <GlassPanel pad="lg" eyebrow="what opens here">
            <p
              className="font-narrative text-[clamp(21px,2.4vw,28px)] leading-tight"
              style={{ color: 'var(--ink)' }}
            >
              {content.lab}
            </p>
            <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--line)' }}>
              <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                already true today
              </div>
              <p className="mt-2 max-w-[46ch] text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
                {framework.name} is a real record in the registry: it has its route, its place
                on the map, and the state fields it reads and writes. Every framework that
                hands off to it already links here. Only the lesson and the lab are pending.
              </p>
            </div>
          </GlassPanel>
          <WaitlistBar
            headline="Tell me when this one opens."
            caption={`One note when ${framework.name} ships at full depth — and one when the lab opens on your own business.`}
            cta="Notify me"
          />
        </div>
      </PageSection>

      {/* -------------------------------------------------- 5 · where it goes */}
      <PageSection
        id="handoff"
        index="05"
        kicker="handoff"
        title={<>Where this one hands off.</>}
        lede="The edges are walkable now — all seventeen pages exist, so every link below is a real page, carrying the fields that travel that edge."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {targets.length === 0 ? (
            <p className="text-[14px]" style={{ color: 'var(--muted)' }}>
              Nothing downstream. This framework is where a line of reasoning ends.
            </p>
          ) : (
            targets.map((target) => {
              const body = (
                <>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className="font-narrative text-[21px] leading-tight"
                      style={{ color: 'var(--ink)' }}
                    >
                      {target.framework.name}
                    </span>
                    <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                      {target.recommended ? 'run this next' : 'also reads this'}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] leading-[1.55]" style={{ color: 'var(--muted)' }}>
                    {target.framework.coreQuestion}
                  </p>
                  <p className={`${MONO_LABEL} mt-3 text-[9px]`} style={{ color: 'var(--flow)' }}>
                    carries {target.fields.length} field{target.fields.length === 1 ? '' : 's'}
                  </p>
                </>
              );
              return target.href ? (
                <a
                  key={target.framework.id}
                  data-handoff-link={target.framework.id}
                  data-recommended={target.recommended ? 'true' : 'false'}
                  href={target.href}
                  className="block h-full rounded-lg border p-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--flow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--void)] hover:border-[color:color-mix(in_srgb,var(--flow)_55%,transparent)]"
                  style={{
                    borderColor: target.recommended
                      ? 'color-mix(in srgb, var(--flow) 40%, transparent)'
                      : 'var(--line)',
                    background: 'color-mix(in srgb, var(--surface) 60%, transparent)',
                  }}
                >
                  {body}
                </a>
              ) : (
                <div
                  key={target.framework.id}
                  data-handoff-chapter={target.framework.id}
                  className="block h-full rounded-lg border border-dashed p-5"
                  style={{ borderColor: 'var(--line)', opacity: 0.75 }}
                >
                  {body}
                </div>
              );
            })
          )}
        </div>
      </PageSection>

      <SiteFooter />
    </main>
  );
}

export default ChapterPage;
