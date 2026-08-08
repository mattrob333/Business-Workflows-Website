/**
 * Section 4 — "Run it on my business", the honest door (00-LAW Ruling 3).
 *
 * v1 has no engine behind this button and says so. The panel shows exactly what the lab
 * *will* do with this framework — the inputs it would ask for, the state it would write —
 * and then hands over to `WaitlistBar`, which with no endpoint configured refuses to
 * pretend it captured anything. No fake form, no disabled input dressed up as a real one,
 * no "coming soon" that implies a queue exists.
 *
 * The frosted treatment is the whole design idea: you can see the room, you cannot open
 * the door yet. Amber would be the obvious way to draw the eye here and is forbidden —
 * a locked feature is not a binding constraint (01 §1, team rule 3).
 */

import { GlassPanel, MONO_LABEL, WaitlistBar } from '@/components';
import { stateField, type Framework } from '@/registry';

export interface LockedPanelProps {
  framework: Framework;
  /** The example company the visitor has just watched, named for the contrast. */
  exampleName: string;
}

export function LockedPanel({ framework, exampleName }: LockedPanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <GlassPanel pad="lg" eyebrow="locked in this build" className="relative overflow-hidden">
        <p className="font-narrative text-[clamp(22px,2.6vw,30px)] leading-tight" style={{ color: 'var(--ink)' }}>
          Your company here. The first wave opens soon.
        </p>
        <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
          You just watched {framework.name} run on {exampleName}, where every figure was
          authored and every claim was sourced by hand. Running it on a real business needs
          an engine, an evidence store and an approval step — all three arrive together, or
          none of them do.
        </p>

        <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2" style={{ borderColor: 'var(--line)' }}>
          <div>
            <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
              it would ask you for
            </div>
            <p className="mt-2 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
              {framework.readsFrom.slice(0, 5).map((f) => stateField(f).label).join(' · ')}
            </p>
          </div>
          <div>
            <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
              it would write back
            </div>
            <p className="mt-2 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
              {framework.writesTo.slice(0, 5).map((f) => stateField(f).label).join(' · ')}
            </p>
          </div>
        </div>

        <p className={`${MONO_LABEL} mt-5 text-[9px]`} style={{ color: 'var(--faint)' }}>
          nothing on this page is generated live · every word is authored
        </p>
      </GlassPanel>

      <WaitlistBar />
    </div>
  );
}

export default LockedPanel;
