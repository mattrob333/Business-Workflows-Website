import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { GlassPanel, Kicker, MONO_LABEL, PredictionPrompt } from '@/components';
import {
  ExplanationAct,
  HandoffSection,
  IncomingState,
  LockedPanel,
  PageSection,
  ShareRow,
  StatePanel,
  handoffTargets,
  incomingSources,
} from '@/components/framework-page';
import {
  assertConfigMatchesRegistry,
  frameworkPageConfig,
} from '@/components/framework-page/configs';
import { COMPANIES, companyBySlug } from '@/content/companies';
import { AtmoMeshDrift } from '@/motion/atmo-mesh-drift';
import { Grain } from '@/motion/grain';
import { GROUPS, bySlug, frameworksByDepth } from '@/registry';

/**
 * `/frameworks/[slug]` — the six full framework pages (04-phases S3).
 *
 * ## What this route is
 *
 * One page pattern, six frameworks, zero per-page routing. `generateStaticParams` walks the
 * registry for `depth: 'full'` records only, so the static export emits exactly six pages
 * and the eleven chapter slugs 404 until S6 builds them. Delete a record and its page
 * disappears; promote a chapter to full and its page appears — neither requires touching
 * this file.
 *
 * ## The seven sections (03-content-spec, v1-scoped by Ruling 3)
 *
 *   1 · animated explanation — the framework's motion recipe, act-pinned on its example company
 *   2 · learn — the MDX lesson, closing on READS FROM / WRITES TO / BEST NEXT from the registry
 *   3 · explore an example — predict, interact, compare, inspect the evidence
 *   4 · run it on my business — the honest locked door, then the waitlist
 *   5 · review — *not a section*: the honesty chips live inside section 3, where the claims are
 *   6 · handoff — what this unlocked, and one click into the next framework carrying state
 *   7 · share — copy link (og-images arrive with S6)
 *
 * ## The per-framework config shape (what S3-B writes)
 *
 * Everything that varies between the six lives in one module per framework under
 * `src/components/framework-page/configs/`, typed as `FrameworkPageConfig`:
 *
 * ```ts
 * export const xPageConfig: FrameworkPageConfig = {
 *   id,                                        // a registry id at depth 'full'
 *   showpiece: { recipe, actTitle, headline, note, pin, diagram, evidenceRefs, caption?, reading? },
 *   lesson:    { Body, path },                 // the imported .mdx + the registry's lesson path
 *   explore:   { title, lede, prediction, interaction, compare? },
 *   unlocked:  [ … ],                          // section 6's "what this unlocked" lines
 * };
 * ```
 *
 * Then add it to `CONFIGS` in `configs/index.ts`. That is the whole task: the state panel,
 * the handoff targets and their URL state, the locked panel, the graph locator, the share
 * row and the footer are derived from `src/registry` and render identically on all six.
 * `assertConfigMatchesRegistry` fails the build if a config's recipe or lesson path drifts
 * from its record. A full-depth framework with no config yet still gets its route, its
 * registry-driven sections and a visible placeholder — nothing 404s while S3-B is in flight.
 *
 * ## The two laws that bite hardest here
 *
 * **Amber.** Exactly one of these six pages has a constraint to name, so exactly one shows
 * amber: `/frameworks/theory-of-constraints`, in the recipe's computed stage, its badge and
 * the verdict panel. Every other page must contain none at all, and `tests/framework-pages`
 * asserts both halves (00-LAW Ruling 2, team rule 3).
 *
 * **Evidence.** Every figure in the explore section sits inside a claim block that names its
 * source object. The walk sweeps that section for digits and fails on any that do not
 * (Ruling 4). Counts rendered by the interaction islands are spelled as words for exactly
 * this reason — a number the page invented for the UI must not look like a finding.
 */

export function generateStaticParams(): { slug: string }[] {
  return frameworksByDepth('full').map((framework) => ({ slug: framework.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const framework = bySlug(slug);
  if (!framework) return { title: 'Not found — The Strategy Stack' };
  return {
    title: `${framework.name} — The Strategy Stack`,
    description: framework.coreQuestion,
  };
}

const FOOTER_LINE =
  'THE STRATEGY STACK · POWERED BY INSTINCT · BUSINESS FRAMEWORKS, FINALLY RUNNING.';

const JUMPS: [string, string][] = [
  ['#learn', 'learn'],
  ['#explore', 'explore an example'],
  ['#run-it', 'run it on my business'],
  ['#handoff', 'what comes next'],
];

export default async function FrameworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const framework = bySlug(slug);
  if (!framework || framework.depth !== 'full') notFound();

  const primary = framework.example.find((e) => e.role === 'primary');
  if (!primary) throw new Error(`${framework.id}: no primary example binding`);
  const company = companyBySlug(primary.company);
  if (!company) throw new Error(`${framework.id}: unknown example company "${primary.company}"`);

  const config = frameworkPageConfig(framework.id);
  if (config) assertConfigMatchesRegistry(config);

  const group = GROUPS.find((g) => g.id === framework.group);
  const targets = handoffTargets(framework, company.id);
  const sources = incomingSources(framework);
  const companies = COMPANIES.map((c) => ({ id: c.id, name: c.name }));

  return (
    <main
      data-testid="framework-page-root"
      data-framework={framework.id}
      data-slug={framework.slug}
      className="relative"
    >
      {/*
        With JavaScript off, Framer's initial variants would hold the showpiece and the
        entrance groups at opacity 0. Ruling 7 requires every diagram to be readable in its
        final state without JS, so the no-JS path force-resolves them.
      */}
      <noscript>
        <style>{`[data-recipe],[data-recipe] *{opacity:1!important;transform:none!important;filter:none!important}`}</style>
      </noscript>

      {/* --------------------------------------------------------------- hero */}
      <header className="relative overflow-hidden">
        <AtmoMeshDrift seed={framework.name.length + 7} count={4} intensity={0.08} />
        <Grain />
        <div className="relative mx-auto w-full max-w-5xl px-5 pt-24 pb-10 sm:px-8 sm:pt-28">
          <Kicker variant="rule">
            {group ? `${group.label} · ${group.blurb}` : 'framework'}
          </Kicker>

          <h1
            className="font-narrative mt-7 max-w-[16ch] text-[clamp(40px,7vw,84px)] leading-[1.02] text-balance"
            style={{ color: 'var(--ink)' }}
          >
            {framework.name}
          </h1>

          <div className="relative mt-[-0.3em] max-w-3xl pt-14">
            <GlassPanel pad="lg" overhang elevated eyebrow="the question it answers">
              <p className="max-w-[58ch] text-[17px] leading-[1.6]" style={{ color: 'var(--ink)' }}>
                {framework.coreQuestion}
              </p>
              <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
                Running on <span style={{ color: 'var(--ink)' }}>{company.name}</span> —{' '}
                {primary.note}
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

      {config ? (
        <>
          {/* --------------------------------------- 1 · animated explanation */}
          <section id="showpiece" data-section="showpiece" aria-label="The framework, running">
            <div className="mx-auto w-full max-w-5xl px-5 pt-20 sm:px-8 sm:pt-24">
              <Kicker index="01" variant="rule">
                the framework, running · {company.name.toLowerCase()}
              </Kicker>
            </div>
            <ExplanationAct
              recipe={config.showpiece.recipe}
              actTitle={config.showpiece.actTitle}
              headline={config.showpiece.headline}
              note={config.showpiece.note}
              {...(config.showpiece.pin !== undefined ? { pin: config.showpiece.pin } : {})}
              {...(config.showpiece.caption !== undefined
                ? { caption: config.showpiece.caption }
                : {})}
            >
              {config.showpiece.diagram}
            </ExplanationAct>
            {config.showpiece.reading ? (
              <div className="mx-auto w-full max-w-5xl px-5 pt-12 sm:px-8">
                {config.showpiece.reading}
              </div>
            ) : null}
          </section>

          {/* ---------------------------------------------------- 2 · learn */}
          <PageSection
            id="learn"
            index="02"
            kicker="learn"
            title={<>What it is, and how it stops being wallpaper.</>}
          >
            <article className="max-w-[68ch]">
              <config.lesson.Body />
            </article>
            <div className="mt-14">
              <div className={`${MONO_LABEL} mb-4 text-[10px]`} style={{ color: 'var(--faint)' }}>
                the signature · straight from the registry
              </div>
              <StatePanel framework={framework} targets={targets} />
            </div>
          </PageSection>

          {/* ------------------------------------------ 3 · explore an example */}
          <PageSection
            id="explore"
            index="03"
            kicker={`explore · ${company.name.toLowerCase()}`}
            title={config.explore.title}
            lede={config.explore.lede}
          >
            {/*
              Everything numeric below sits inside a claim block that cites its source. That
              is section 5 of the spec — "review" — which is not a section at all but a
              property of this one.
            */}
            <div data-testid="explore-body" className="grid gap-10">
              <PredictionPrompt
                question={config.explore.prediction.question}
                options={config.explore.prediction.options}
                {...(config.explore.prediction.correctId !== undefined
                  ? { correctId: config.explore.prediction.correctId }
                  : {})}
                {...(config.explore.prediction.kicker !== undefined
                  ? { kicker: config.explore.prediction.kicker }
                  : {})}
              >
                {config.explore.prediction.reveal}
              </PredictionPrompt>

              {config.explore.interaction}

              {config.explore.compare ? (
                <div>
                  <div className={`${MONO_LABEL} mb-4 text-[10px]`} style={{ color: 'var(--faint)' }}>
                    compare lenses
                  </div>
                  {config.explore.compare}
                </div>
              ) : null}
            </div>
          </PageSection>
        </>
      ) : (
        <PageSection
          id="showpiece"
          index="01"
          kicker="in build"
          title={<>This page&apos;s lesson and lab are being authored.</>}
          lede={`${framework.name} has its route, its place in the graph and its state signature. The showpiece, the lesson and the interactive example land in the second half of this slice.`}
        >
          <StatePanel framework={framework} targets={targets} />
        </PageSection>
      )}

      {/* ------------------------------------- 4 · run it on my business */}
      <PageSection
        id="run-it"
        index="04"
        kicker="run it on my business"
        title={
          <>
            The door is real. It is just not <em className="italic">open</em> yet.
          </>
        }
        lede="This build has no engine behind it and will not pretend otherwise. Nothing here is generated, nothing is stored, and the form below says so in plain language."
      >
        <LockedPanel framework={framework} exampleName={company.name} />
      </PageSection>

      {/* --------------------------------------------------- 6 · handoff */}
      <PageSection
        id="handoff"
        index="05"
        kicker="handoff"
        title={<>What this unlocked, and where it goes.</>}
        lede="The next framework does not start from a blank page. It starts from the fields this one just wrote — and the link carries them."
      >
        <HandoffSection
          framework={framework}
          company={company}
          targets={targets}
          unlocked={
            config?.unlocked ?? [
              `${framework.name} writes ${framework.writesTo.length} typed fields into the shared business state.`,
              'Everything downstream reads those fields rather than a summary of them.',
            ]
          }
        />
      </PageSection>

      {/* ----------------------------------------------------- 7 · share */}
      <PageSection
        id="share"
        index="06"
        kicker="share"
        title={<>Send someone the argument, not a summary of it.</>}
      >
        <ShareRow label={`${framework.name} on ${company.name}`} />
      </PageSection>

      <footer
        className="mx-auto w-full max-w-5xl border-t px-5 py-10 sm:px-8"
        style={{ borderColor: 'var(--line)' }}
      >
        <p className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          {FOOTER_LINE}
        </p>
      </footer>
    </main>
  );
}
