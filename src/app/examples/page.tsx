import type { Metadata } from 'next';

import { GlassPanel, Kicker, MONO_LABEL } from '@/components';
import { SiteFooter } from '@/components/SiteFooter';
import { COMPANIES } from '@/content/companies';
import { openGraphFor } from '@/lib/site';
import { AtmoMeshDrift } from '@/motion/atmo-mesh-drift';
import { Grain } from '@/motion/grain';
import { Ingest, IngestGroup } from '@/motion/motion-ingest';
import { FRAMEWORKS } from '@/registry';

/**
 * `/examples` — the example-company index (04-phases S6).
 *
 * Three companies ship in v1 with hand-authored evidence packs; three more are named here
 * and nothing else (03-content-spec, appendix §8). That asymmetry is the page's argument
 * and it is why the second group carries no sector, no numbers and no teaser copy: a
 * company on this site is its evidence pack, and Hearth & Pine, Northstar Clinics and Atlas
 * Industrial do not have one yet. Writing a plausible-sounding line about a business whose
 * evidence has not been authored is precisely the invention Ruling 4 forbids, and it would
 * be more tempting here than anywhere else on the site.
 *
 * Everything quantitative on this page counts *the site's own content* — evidence objects
 * in a pack, frameworks bound to a company, state fields a profile populates. Those are
 * facts about the repository, derived at build time from the packs themselves, not claims
 * about a business, which is why they need no evidence chip. The moment a figure describes
 * the company rather than the file, it belongs on the company's page inside a claim block.
 */

const TITLE = 'Example companies — The Strategy Stack';
const DESCRIPTION =
  'Three fictional companies with hand-authored evidence packs: Beacon Mechanical, RelayDesk and Lantern AI. Every number on this site traces to one of their source objects.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...openGraphFor(TITLE, DESCRIPTION),
};

/** Named in the plan, not yet authored. Names only — see the note above. */
const IN_THE_LAB: readonly string[] = ['Hearth & Pine', 'Northstar Clinics', 'Atlas Industrial'];

export default function ExamplesIndexPage() {
  const shipped = COMPANIES.map((company) => ({
    company,
    frameworks: FRAMEWORKS.filter((f) => f.example.some((e) => e.company === company.id)),
  }));

  return (
    <main data-testid="examples-root" className="relative">
      <noscript>
        <style>{`[data-recipe],[data-recipe] *{opacity:1!important;transform:none!important;filter:none!important}`}</style>
      </noscript>

      <header className="relative overflow-hidden">
        <AtmoMeshDrift seed={11} count={4} intensity={0.08} />
        <Grain />
        <div className="relative mx-auto w-full max-w-5xl px-5 pt-24 pb-10 sm:px-8 sm:pt-28">
          <Kicker variant="rule">the example lab · six companies, three of them open</Kicker>

          <h1
            className="font-narrative mt-7 max-w-[17ch] text-[clamp(40px,7vw,84px)] leading-[1.02] text-balance"
            style={{ color: 'var(--ink)' }}
          >
            Companies invented{' '}
            <em className="italic" style={{ color: 'var(--flow)' }}>
              on purpose
            </em>
            .
          </h1>

          <div className="relative mt-[-0.3em] max-w-3xl pt-14">
            <GlassPanel pad="lg" overhang elevated eyebrow="why they are fictional">
              <p className="max-w-[60ch] text-[16px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
                No real business is ever used as an example here — not anonymised, not
                composited, not &ldquo;inspired by&rdquo;. A real company&apos;s numbers cannot
                be published, so a case study built on them has to be vague exactly where the
                teaching happens. These three are invented, which means every figure can be
                shown, every source can be opened, and the diagnosis can be argued with.
              </p>
              <p className="mt-4 max-w-[60ch] text-[16px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
                Each one is an evidence pack first. The profile, the framework runs and the
                scripted Strategy Run are all downstream of it, and nothing on this site states
                a number that does not resolve to one of these source objects.
              </p>
            </GlassPanel>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- shipped */}
      <section
        aria-labelledby="shipped-title"
        className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8 sm:py-24"
      >
        <Kicker index="01" variant="rule">
          open now
        </Kicker>
        <h2
          id="shipped-title"
          className="font-narrative mt-5 max-w-[22ch] text-[clamp(28px,4vw,46px)] leading-[1.06] text-balance"
          style={{ color: 'var(--ink)' }}
        >
          Three packs, open to the last source object.
        </h2>

        <IngestGroup trigger="in-view" className="mt-10 grid gap-4">
          {shipped.map(({ company, frameworks }) => (
            <a
              key={company.id}
              data-example-link={company.id}
              href={`/examples/${company.id}`}
              className="block rounded-lg border p-6 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--flow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--void)] hover:border-[color:color-mix(in_srgb,var(--flow)_55%,transparent)] sm:p-7"
              style={{
                borderColor: 'var(--line)',
                background: 'color-mix(in srgb, var(--surface) 62%, transparent)',
              }}
            >
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3
                  className="font-narrative text-[clamp(24px,3vw,32px)] leading-tight"
                  style={{ color: 'var(--ink)' }}
                >
                  {company.name}
                </h3>
                <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
                  {company.profile.sector}
                </span>
              </div>

              <p
                className="mt-3 max-w-[64ch] text-[15px] leading-[1.65]"
                style={{ color: 'var(--muted)' }}
              >
                {company.profile.oneLiner}
              </p>

              <p
                className="font-narrative mt-4 max-w-[46ch] text-[19px] leading-snug italic"
                style={{ color: 'var(--ink)' }}
              >
                {company.story.pullQuote}
              </p>

              <div
                className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t pt-4"
                style={{ borderColor: 'var(--line)' }}
              >
                {[
                  ['evidence objects', `${company.evidence.length}`],
                  ['frameworks bound', `${frameworks.length}`],
                  ['state fields populated', `${company.profile.fieldsPopulated.length}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                      {k}
                    </div>
                    <div
                      className="font-system mt-1 text-[13px] tabular-nums"
                      style={{ color: 'var(--ink)' }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </a>
          ))}
        </IngestGroup>
      </section>

      {/* ------------------------------------------------------- in the lab */}
      <section
        aria-labelledby="lab-title"
        className="mx-auto w-full max-w-5xl px-5 pb-20 sm:px-8 sm:pb-24"
      >
        <Kicker index="02" variant="rule">
          in the lab
        </Kicker>
        <h2
          id="lab-title"
          className="font-narrative mt-5 max-w-[24ch] text-[clamp(28px,4vw,46px)] leading-[1.06] text-balance"
          style={{ color: 'var(--ink)' }}
        >
          Three more, named and not yet written.
        </h2>
        <p className="mt-4 max-w-[64ch] text-[16px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
          They are on the plan and they are not on the site. When they arrive they arrive the
          same way the first three did — an evidence pack authored object by object, then a
          profile that cannot say anything the pack does not support. Until then these are
          three names, and describing them further would be inventing them twice.
        </p>

        <Ingest trigger="in-view">
          <ul className="mt-8 grid gap-px overflow-hidden rounded-lg border sm:grid-cols-3" style={{ borderColor: 'var(--line)', background: 'var(--line)' }}>
            {IN_THE_LAB.map((name) => (
              <li
                key={name}
                data-in-the-lab={name}
                className="px-5 py-6"
                style={{ background: 'color-mix(in srgb, var(--surface) 70%, var(--void))' }}
              >
                <span
                  className="font-narrative block text-[22px] leading-tight"
                  style={{ color: 'var(--muted)' }}
                >
                  {name}
                </span>
                <span className={`${MONO_LABEL} mt-2 block text-[9px]`} style={{ color: 'var(--faint)' }}>
                  in the lab
                </span>
              </li>
            ))}
          </ul>
        </Ingest>
      </section>

      <SiteFooter />
    </main>
  );
}
