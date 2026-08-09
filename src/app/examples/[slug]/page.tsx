import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { GlassPanel, Kicker, MONO_LABEL, StatusChip, WaitlistBar } from '@/components';
import { SiteFooter } from '@/components/SiteFooter';
import { ClaimLine, MetricLine, PageSection, EvidenceChips } from '@/components/framework-page';
import { COMPANIES, COMPANY_IDS, companyBySlug } from '@/content/companies';
import { openGraphFor } from '@/lib/site';
import { AtmoMeshDrift } from '@/motion/atmo-mesh-drift';
import { Grain } from '@/motion/grain';
import { IngestGroup } from '@/motion/motion-ingest';
import { FRAMEWORKS, GROUPS } from '@/registry';

/**
 * `/examples/[slug]` — one example company (04-phases S6).
 *
 * Three sections, in the order the honesty engine implies: **what this business is**, then
 * **where every one of those statements came from**, then **which instruments to point at
 * it**. The evidence pack is not an appendix here — it is the middle of the page, printed
 * in full and readable without opening anything, because a company on this site *is* its
 * pack (Ruling 4) and hiding it behind popovers would make the site's central claim
 * unverifiable exactly where a sceptic would go looking.
 *
 * ## What this page deliberately does not do
 *
 * **It does not name the constraint.** Every one of these companies has one, and the
 * temptation to print it here — with the amber that names it — is strong and wrong. The
 * constraint belongs to `/frameworks/theory-of-constraints`, where the elimination is
 * shown, and to step eleven of the run, where it is earned. A company page that opened with
 * the answer would spend the site's most sacred colour on a summary and would spoil the two
 * surfaces that exist to deliver it. So this page contains no amber at all (00-LAW Ruling 2,
 * team rule 3) and hands the diagnosis off rather than restating it.
 *
 * **It does not print an unsourced figure.** Everything numeric inside `company-body` sits
 * in a claim block that cites its object, or is an evidence object itself. The crawl walk
 * sweeps that region for digits and fails on anything outside both.
 *
 * **It does not fake a run.** The framework links carry `?company=<id>` so the page you
 * land on knows which business you were reading about; they do not claim a handoff
 * happened, because on this page none did.
 */

export function generateStaticParams(): { slug: string }[] {
  return COMPANY_IDS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = companyBySlug(slug);
  if (!company) return { title: 'Not found — The Strategy Stack' };
  const title = `${company.name} — The Strategy Stack`;
  const description = `${company.profile.oneLiner} A fictional example company with a hand-authored evidence pack of ${company.evidence.length} source objects.`;
  return { title, description, ...openGraphFor(title, description) };
}

export default async function ExampleCompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = companyBySlug(slug);
  if (!company) notFound();

  const { profile, story } = company;
  const beat = new Map(story.demonstrates.map((d) => [d.framework, d.beat]));

  /** Bound frameworks, in registry order, primary bindings first. */
  const bound = FRAMEWORKS.map((framework) => {
    const binding = framework.example.find((e) => e.company === company.id);
    return binding ? { framework, binding } : null;
  })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => Number(b.binding.role === 'primary') - Number(a.binding.role === 'primary'));

  const others = COMPANIES.filter((c) => c.id !== company.id);

  return (
    <main
      data-testid="company-page-root"
      data-company={company.id}
      className="relative"
    >
      <noscript>
        <style>{`[data-recipe],[data-recipe] *{opacity:1!important;transform:none!important;filter:none!important}`}</style>
      </noscript>

      {/* --------------------------------------------------------------- hero */}
      <header className="relative overflow-hidden">
        <AtmoMeshDrift seed={company.name.length + 2} count={4} intensity={0.08} />
        <Grain />
        <div className="relative mx-auto w-full max-w-5xl px-5 pt-24 pb-10 sm:px-8 sm:pt-28">
          <Kicker variant="rule">example company · {profile.sector.toLowerCase()}</Kicker>

          <h1
            className="font-narrative mt-7 max-w-[16ch] text-[clamp(40px,7vw,84px)] leading-[1.02] text-balance"
            style={{ color: 'var(--ink)' }}
          >
            {company.name}
          </h1>

          {/* type/serif-over-data, used once on this page. */}
          <div className="relative mt-[-0.3em] max-w-3xl pt-14">
            <GlassPanel pad="lg" overhang elevated eyebrow="the business, in one line">
              <p className="max-w-[58ch] text-[17px] leading-[1.6]" style={{ color: 'var(--ink)' }}>
                {profile.oneLiner}
              </p>
              <p
                className={`${MONO_LABEL} mt-5 border-t pt-4 text-[9px]`}
                style={{ color: 'var(--faint)', borderColor: 'var(--line)' }}
              >
                fictional company · every figure below resolves to a source object in its pack
              </p>
            </GlassPanel>
          </div>

          <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {[
              ['#situation', 'the situation'],
              ['#profile', 'the profile'],
              ['#evidence', 'the evidence pack'],
              ['#frameworks', 'which frameworks to try'],
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

      {/*
        Everything numeric from here to the end of the evidence pack is either inside a
        claim block or is an evidence object. `tests/crawl` sweeps exactly this region.
      */}
      <div data-testid="company-body">
        {/* ------------------------------------------------------ 1 · situation */}
        <PageSection
          id="situation"
          index="01"
          kicker="the situation"
          title={<>What is actually going on here.</>}
          lede="The story as an operator would tell it, and then the same story as claims — each one labelled with how much weight it can carry."
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            <div className="grid content-start gap-4">
              {story.challenge.map((line) => (
                <p key={line} className="max-w-[62ch] text-[16px] leading-[1.7]" style={{ color: 'var(--muted)' }}>
                  {line}
                </p>
              ))}
              <p
                className="font-narrative mt-4 max-w-[30ch] border-l pl-6 text-[clamp(22px,3vw,32px)] leading-[1.15] italic"
                style={{
                  color: 'var(--ink)',
                  borderColor: 'color-mix(in srgb, var(--flow) 55%, transparent)',
                }}
              >
                {story.pullQuote}
              </p>
            </div>

            <div className="grid content-start gap-3">
              <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
                the headline claims
              </div>
              {profile.headline.map((claim) => (
                <ClaimLine key={claim.text} claim={claim} company={company} />
              ))}
              <p className="mt-2 text-[13px] leading-[1.6]" style={{ color: 'var(--faint)' }}>
                Nothing here says what the binding constraint is. That is what the conductor is
                for, and it is worth arriving at rather than being told.
              </p>
            </div>
          </div>
        </PageSection>

        {/* -------------------------------------------------------- 2 · profile */}
        <PageSection
          id="profile"
          index="02"
          kicker="the profile"
          title={<>The business as typed state.</>}
          lede="This is not a description of the company — it is the shared business state, hand-authored, in the same fields the frameworks read and write. Every figure carries the object it came from."
        >
          <div className="grid gap-10">
            <div>
              <div className={`${MONO_LABEL} mb-4 text-[10px]`} style={{ color: 'var(--flow)' }}>
                {profile.segments.label} · {profile.segments.field}
              </div>
              <IngestGroup trigger="in-view" className="grid gap-3 sm:grid-cols-2">
                {profile.segments.items.map((segment) => (
                  <div
                    key={segment.name}
                    data-claim="true"
                    className="rounded-md border p-4"
                    style={{
                      borderColor: 'var(--line)',
                      background: 'color-mix(in srgb, var(--surface) 55%, transparent)',
                    }}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-[15px] leading-snug" style={{ color: 'var(--ink)' }}>
                        {segment.name}
                      </span>
                      <span
                        className="font-system text-[14px] tabular-nums"
                        style={{ color: 'var(--flow)' }}
                      >
                        {segment.shareOfRevenue.value}%
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
                      {segment.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                        {segment.shareOfRevenue.label.toLowerCase()}
                      </span>
                      <EvidenceChips company={company} refs={[segment.shareOfRevenue.evidenceRef]} />
                    </div>
                    {segment.notes.map((note) => (
                      <div key={note.text} className="mt-3">
                        <ClaimLine claim={note} company={company} />
                      </div>
                    ))}
                  </div>
                ))}
              </IngestGroup>
            </div>

            <div>
              <div className={`${MONO_LABEL} mb-4 text-[10px]`} style={{ color: 'var(--flow)' }}>
                {profile.operating.label} · {profile.operating.field}
              </div>
              <div className="grid gap-2">
                {profile.operating.items.map((metric) => (
                  <MetricLine key={metric.label} metric={metric} company={company} />
                ))}
              </div>
            </div>

            <div>
              <div className={`${MONO_LABEL} mb-4 text-[10px]`} style={{ color: 'var(--flow)' }}>
                {profile.capabilities.label} · {profile.capabilities.field}
              </div>
              <div className="grid gap-4">
                {profile.capabilities.items.map((capability) => (
                  <div
                    key={capability.name}
                    className="rounded-md border p-4"
                    style={{
                      borderColor: 'var(--line)',
                      background: 'color-mix(in srgb, var(--surface) 55%, transparent)',
                    }}
                  >
                    <div className="text-[15px] leading-snug" style={{ color: 'var(--ink)' }}>
                      {capability.name}
                    </div>
                    <p className="mt-2 max-w-[68ch] text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
                      {capability.description}
                    </p>
                    <div className="mt-3">
                      <ClaimLine claim={capability.assessment} company={company} />
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {capability.measures.map((measure) => (
                        <MetricLine key={measure.label} metric={measure} company={company} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className={`${MONO_LABEL} mb-4 text-[10px]`} style={{ color: 'var(--flow)' }}>
                state fields this pack populates
              </div>
              <p className="max-w-[70ch] text-[13px] leading-[1.7]" style={{ color: 'var(--muted)' }}>
                {profile.fieldsPopulated.join(' · ')}
              </p>
            </div>
          </div>
        </PageSection>

        {/* ------------------------------------------------------- 3 · evidence */}
        <PageSection
          id="evidence"
          index="03"
          kicker="the evidence pack"
          title={<>Every source object, open.</>}
          lede="The whole pack, printed. Source, date, type, the quotable fragment, and how much weight it can take. If a figure anywhere on this site does not appear in one of these, it does not appear at all."
        >
          <ul className="grid gap-3">
            {company.evidence.map((evidence) => (
              <li
                key={evidence.id}
                data-evidence-object={evidence.id}
                data-reliability={evidence.reliability}
                className="rounded-md border p-4"
                style={{
                  borderColor: 'var(--line)',
                  background: 'color-mix(in srgb, var(--surface) 55%, transparent)',
                }}
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span
                    className="font-system text-[12px]"
                    style={{ color: 'var(--flow)', letterSpacing: '.06em' }}
                  >
                    {evidence.id}
                  </span>
                  <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                    {evidence.type.replace(/_/g, ' ')}
                  </span>
                  <span
                    className="font-system text-[11px] tabular-nums"
                    style={{ color: 'var(--faint)' }}
                  >
                    {evidence.date}
                  </span>
                  <span className={`${MONO_LABEL} ml-auto text-[9px]`} style={{ color: 'var(--faint)' }}>
                    {evidence.reliability} reliability
                  </span>
                </div>
                <div className="mt-2 text-[14px] leading-snug" style={{ color: 'var(--ink)' }}>
                  {evidence.source}
                  {evidence.author ? (
                    <span style={{ color: 'var(--faint)' }}> · {evidence.author}</span>
                  ) : null}
                </div>
                <p
                  className="mt-2 border-l pl-3 text-[13px] leading-relaxed"
                  style={{ color: 'var(--muted)', borderColor: 'var(--line-strong)' }}
                >
                  &ldquo;{evidence.excerpt}&rdquo;
                </p>
              </li>
            ))}
          </ul>
        </PageSection>
      </div>

      {/* --------------------------------------------- 4 · which frameworks to try */}
      <PageSection
        id="frameworks"
        index="04"
        kicker="which frameworks to try"
        title={<>Point an instrument at it.</>}
        lede="The bindings come from the registry: these are the frameworks that name this company as an example, primary bindings first. Each link carries the company through, so the page you land on knows which business you were reading about."
      >
        <IngestGroup trigger="in-view" className="grid gap-3 sm:grid-cols-2">
          {bound.map(({ framework, binding }) => {
            const group = GROUPS.find((g) => g.id === framework.group);
            return (
              <a
                key={framework.id}
                data-try-framework={framework.id}
                href={`/frameworks/${framework.slug}?company=${company.id}`}
                className="block h-full rounded-lg border p-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--flow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--void)] hover:border-[color:color-mix(in_srgb,var(--flow)_55%,transparent)]"
                style={{
                  borderColor:
                    binding.role === 'primary'
                      ? 'color-mix(in srgb, var(--flow) 40%, transparent)'
                      : 'var(--line)',
                  background: 'color-mix(in srgb, var(--surface) 60%, transparent)',
                }}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className="font-narrative text-[21px] leading-tight"
                    style={{ color: 'var(--ink)' }}
                  >
                    {framework.name}
                  </span>
                  <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                    {group?.label.toLowerCase()} ·{' '}
                    {framework.depth === 'full' ? 'full lesson' : 'chapter'}
                    {binding.role === 'primary' ? ' · primary example' : ''}
                  </span>
                </div>
                <p className="mt-2 text-[14px] leading-[1.55]" style={{ color: 'var(--muted)' }}>
                  {binding.note}
                </p>
                {beat.get(framework.id) ? (
                  <p className={`${MONO_LABEL} mt-3 text-[9px]`} style={{ color: 'var(--flow)' }}>
                    what it shows
                  </p>
                ) : null}
                {beat.get(framework.id) ? (
                  <p className="mt-1 text-[13px] leading-[1.55]" style={{ color: 'var(--faint)' }}>
                    {beat.get(framework.id)}
                  </p>
                ) : null}
              </a>
            );
          })}
        </IngestGroup>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <GlassPanel pad="lg" eyebrow="where the diagnosis happens">
            <p className="max-w-[48ch] text-[15px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              A profile and a pack are not a finding. The finding is which single thing limits
              the whole system, and that is what the conductor is for — it is reached by
              elimination, on its own page, with the candidates rejected one at a time.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              <a
                href={`/frameworks/theory-of-constraints?company=${company.id}`}
                className={`${MONO_LABEL} rounded-sm text-[10px] underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)]`}
                style={{ color: 'var(--flow)' }}
              >
                the conductor
              </a>
              {company.id === 'beacon-mechanical' ? (
                <a
                  href="/runs/find-what-matters-now"
                  className={`${MONO_LABEL} rounded-sm text-[10px] underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)]`}
                  style={{ color: 'var(--flow)' }}
                >
                  the full run on this company
                </a>
              ) : null}
              <a
                href="/graph"
                className={`${MONO_LABEL} rounded-sm text-[10px] underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)]`}
                style={{ color: 'var(--flow)' }}
              >
                the whole graph
              </a>
            </div>
            <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--line)' }}>
              <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                the other packs
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                {others.map((other) => (
                  <a
                    key={other.id}
                    href={`/examples/${other.id}`}
                    className="rounded-sm text-[13px] underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)]"
                    style={{ color: 'var(--muted)' }}
                  >
                    {other.name}
                  </a>
                ))}
              </div>
            </div>
          </GlassPanel>

          <div className="grid content-start gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip status="fact" />
              <StatusChip status="supported-inference" />
              <StatusChip status="assumption" />
              <StatusChip status="hypothesis" />
              <span className="text-[12px]" style={{ color: 'var(--faint)' }}>
                the ladder every claim above sits on
              </span>
            </div>
            <WaitlistBar
              headline="You ran the framework once. Instinct keeps it running."
              caption={`${company.name} is authored. Your business is not — and that is the version the first wave opens on.`}
            />
          </div>
        </div>
      </PageSection>

      <SiteFooter />
    </main>
  );
}
