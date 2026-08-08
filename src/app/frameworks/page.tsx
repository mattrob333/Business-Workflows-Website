import type { Metadata } from 'next';
import { GROUPS, STRATEGY_RUNS, frameworksInGroup } from '@/registry';

/**
 * S1's proof that the registry drives rendering: every framework on this page comes from
 * `src/registry` alone — delete a record and its row disappears. Deliberately plain. The
 * Framework Graph (S2) and the six full pages (S3) own the designed versions; there is no
 * motion here on purpose.
 */

export const metadata: Metadata = {
  title: 'The seventeen — The Strategy Stack',
  description:
    'Every framework in the stack, the question it answers, and the state it reads and writes.',
};

export default function FrameworksIndexPage() {
  const total = GROUPS.reduce((sum, group) => sum + frameworksInGroup(group.id).length, 0);
  const full = GROUPS.reduce(
    (sum, group) => sum + frameworksInGroup(group.id).filter((f) => f.depth === 'full').length,
    0,
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <header className="border-b border-line pb-10">
        <p className="font-system text-xs uppercase tracking-[.14em] text-faint">The library</p>
        <h1 className="font-narrative mt-4 text-5xl leading-[1.05]">The seventeen</h1>
        <p className="mt-5 max-w-[68ch] text-muted">
          Every framework in the stack, grouped by the job it does. Frameworks do not pass
          paragraphs to each other — they read and write typed fields of one shared business
          model, and the counts below are those fields.
        </p>
        <p className="font-system mt-6 text-xs uppercase tracking-[.14em] text-faint">
          {total} frameworks · {full} at full depth · {total - full} chapters ·{' '}
          {STRATEGY_RUNS.length} strategy runs
        </p>
      </header>

      {GROUPS.map((group) => {
        const frameworks = frameworksInGroup(group.id);
        if (frameworks.length === 0) return null;
        return (
          <section key={group.id} className="mt-16" aria-labelledby={`group-${group.id}`}>
            <h2 id={`group-${group.id}`} className="font-narrative text-2xl">
              {group.label}
            </h2>
            <p className="mt-1 text-sm text-faint">{group.blurb}</p>

            <ul className="mt-6 space-y-px">
              {frameworks.map((framework) => (
                <li
                  key={framework.id}
                  className="border border-line bg-surface px-5 py-4 first:rounded-t-sm last:rounded-b-sm"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-narrative text-xl">{framework.name}</h3>
                    <span className="font-system text-[11px] uppercase tracking-[.14em] text-faint">
                      {framework.depth === 'full' ? 'Full lesson' : 'Chapter'}
                    </span>
                    <span className="font-system text-[11px] uppercase tracking-[.14em] text-faint">
                      /{framework.slug}
                    </span>
                  </div>
                  <p className="mt-2 max-w-[68ch] text-muted">{framework.coreQuestion}</p>
                  <dl className="font-system mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11px] uppercase tracking-[.14em] text-faint">
                    <div className="flex gap-2">
                      <dt>Reads</dt>
                      <dd className="text-flow">{framework.readsFrom.length} fields</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt>Writes</dt>
                      <dd className="text-flow">{framework.writesTo.length} fields</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt>Feeds</dt>
                      <dd className="text-flow">{framework.feedsInto.length} frameworks</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt>Runs</dt>
                      <dd className="text-flow">{framework.runs.length}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <footer className="font-system mt-24 border-t border-line pt-8 text-[11px] uppercase tracking-[.14em] text-faint">
        The Strategy Stack · powered by Instinct · business frameworks, finally running.
      </footer>
    </main>
  );
}
