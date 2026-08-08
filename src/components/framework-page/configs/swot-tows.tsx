/**
 * `/frameworks/swot-tows` — SWOT and TOWS on one page, running on Beacon Mechanical.
 *
 * The registry keeps them as two records because they are two engines with different
 * outputs: `swot` writes `swot_entries`, `tows` reads them and writes `strategic_options`.
 * 03-content-spec merges them onto one page because separating them in the *product* is
 * exactly how the framework dies — a wall of four lists, photographed, generating nothing.
 * So this config belongs to the `swot` record (which owns the `swot-tows` slug) and the
 * whole page is arranged around the cross rather than the quadrants.
 *
 * Everything else follows `./bmc.tsx`. The quadrant entries and the crossings are authored:
 * a claim about how this business hangs together, which no registry can derive. What is not
 * authored is the evidence under them — every entry traces to Beacon's pack, and the two
 * moves that would load the constrained stage say so with the queue metrics attached rather
 * than with a colour. No amber on this page (00-LAW Ruling 2).
 */

import { LensSwitch, MONO_LABEL } from '@/components';
import {
  beaconMechanical,
  beaconProfile,
  beaconStory,
} from '@/content/companies/beacon-mechanical';
import SwotLesson from '@/content/frameworks/swot/lesson.mdx';
import type { Claim, Metric } from '@/lib/claim';
import { TowsCross, type TowsCard, type TowsCrossing } from '@/motion/fw-tows-cross';
import { ClaimLine, EvidenceChips, MetricLine } from '../Claims';
import {
  TowsCrossPicker,
  type CrossCard,
  type CrossMove,
} from '../interactions/TowsCrossPicker';
import type { FrameworkPageConfig } from '../types';

const company = beaconMechanical;

/* --------------------------------------------------- figures, from the pack */

function operating(label: string): Metric {
  const found = beaconProfile.operating.items.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's operating measures have no "${label}"`);
  return found;
}

function capability(name: string) {
  const found = beaconProfile.capabilities.items.find((c) => c.name === name);
  if (!found) throw new Error(`Beacon's profile has no capability "${name}"`);
  return found;
}

function segmentNote(segment: string, prefix: string): Claim {
  const found = beaconProfile.segments.items.find((s) => s.name === segment);
  if (!found) throw new Error(`Beacon's profile has no segment "${segment}"`);
  const note = found.notes.find((n) => n.text.startsWith(prefix));
  if (!note) throw new Error(`Beacon's "${segment}" segment has no note starting "${prefix}"`);
  return note;
}

function misreading(prefix: string): Claim {
  const found = beaconStory.constraint.misreadings.find((c) => c.text.startsWith(prefix));
  if (!found) throw new Error(`Beacon's story has no misreading starting "${prefix}"`);
  return found;
}

/* ------------------------------------------------------------- the showpiece */

const STRENGTHS: TowsCard[] = [
  { id: 's1', text: 'Crews that finish occupied-building retrofits without a second visit' },
  { id: 's2', text: 'A service book with real headroom in it' },
];

const WEAKNESSES: TowsCard[] = [
  { id: 'w1', text: 'Every change order waits on one approver' },
  { id: 'w2', text: 'Signed work waits most of a season for a crew' },
];

const OPPORTUNITIES: TowsCard[] = [
  { id: 'o1', text: 'Industrial buyers who pay for a date rather than a discount' },
  { id: 'o2', text: 'Accounts asking for planned replacement programmes' },
];

const THREATS: TowsCard[] = [
  { id: 't1', text: 'Distributor lead times doubled at the last renewal' },
  { id: 't2', text: 'The largest accounts moving work over start dates' },
];

const CROSSINGS: TowsCrossing[] = [
  {
    id: 'so',
    kind: 'SO',
    internal: 's1',
    external: 'o1',
    option: 'Push retrofit volume into the industrial segment, where buyers pay for speed.',
  },
  {
    id: 'st',
    kind: 'ST',
    internal: 's1',
    external: 't2',
    option: 'Guarantee start windows to the largest accounts before a missed date decides for them.',
  },
  {
    id: 'wo',
    kind: 'WO',
    internal: 'w2',
    external: 'o2',
    option:
      'Take the planned-replacement programmes, but run survey, commissioning and punch-list off the service book so crew hours go only to installing.',
  },
  {
    id: 'wt',
    kind: 'WT',
    internal: 'w1',
    external: 't1',
    option:
      'Delegate change-order approval under a threshold and order long-lead equipment against the signed queue.',
  },
];

const SHOWPIECE_SOURCES = ['ev_103', 'ev_104', 'ev_105', 'ev_109', 'ev_116', 'ev_119'];

const ENTRY_BASIS: { entry: string; claim: Claim }[] = [
  {
    entry: 'strength · retrofit crews',
    claim: capability('Complex retrofit installation').assessment,
  },
  {
    entry: 'strength · service headroom',
    claim: {
      text: 'Service technicians run at roughly three-quarters of their scheduled hours against installation crews at over ninety per cent. The headroom is real. Whether it can take work off the crews is a separate question, and the pack does not answer it.',
      status: 'supported_inference',
      evidenceRefs: ['ev_104', 'ev_103'],
    },
  },
  {
    entry: 'weakness · one approver',
    claim: capability('Single-approver project control').assessment,
  },
  {
    entry: 'weakness · the wait for a crew',
    claim: {
      text: 'Signed installation projects wait a median of sixty-eight days for a crew, against twenty-four days a year ago, and scheduling is now the largest complaint theme in the service desk log.',
      status: 'fact',
      evidenceRefs: ['ev_105', 'ev_108'],
    },
  },
  {
    entry: 'opportunity · buyers who pay for speed',
    claim: segmentNote('Industrial and logistics facilities', 'This segment is the most willing'),
  },
  {
    entry: 'threat · lead times, and a customer who left',
    claim: {
      text: 'Quoted distributor lead times moved from four weeks to eight at the last renewal, and a facilities director at a top-five account has already given a chiller replacement to somebody else purely on the date.',
      status: 'fact',
      evidenceRefs: ['ev_109', 'ev_119'],
    },
  },
];

const READING = (
  <div className="grid gap-4">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
        every entry, with what is under it
      </span>
      <span className="text-[14px]" style={{ color: 'var(--muted)' }}>
        This is the part the wall never has.
      </span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {ENTRY_BASIS.map((row) => (
        <ClaimLine key={row.entry} claim={row.claim} company={company} label={row.entry} />
      ))}
    </div>
    <p className="max-w-[68ch] text-[15px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
      Two of these are facts off a system export, three are inferences, and one is a
      hypothesis carried forward as an open question. A sticky note cannot make that
      distinction and a photograph cannot preserve it — which is the whole reason a quadrant
      of adjectives ages so badly. An entry that cannot say how sure it is will be exactly as
      confident next year as it is today.
    </p>
  </div>
);

/* ------------------------------------------------------------ the interaction */

const INTERNALS: CrossCard[] = [
  { id: 's1', label: 'Crews that finish occupied-building retrofits', side: 'S' },
  { id: 's2', label: 'A service book with real headroom in it', side: 'S' },
  { id: 'w1', label: 'Every change order waits on one approver', side: 'W' },
  { id: 'w2', label: 'Signed work waits most of a season for a crew', side: 'W' },
];

const EXTERNALS: CrossCard[] = [
  { id: 'o1', label: 'Industrial buyers who pay for a date', side: 'O' },
  { id: 'o2', label: 'Accounts asking for planned replacement programmes', side: 'O' },
  { id: 't1', label: 'Distributor lead times doubled at renewal', side: 'T' },
  { id: 't2', label: 'The largest accounts move work over start dates', side: 'T' },
];

const MOVES: CrossMove[] = [
  {
    internal: 's1',
    external: 'o1',
    kind: 'SO',
    option: 'Push retrofit volume into the industrial segment, where buyers pay for speed.',
    verdict: 'adds work to the stage with the least room in it',
    effect: 'loads',
    detail: (
      <MetricLine
        metric={operating('Signed projects awaiting a crew')}
        company={company}
        label="what this would be added to"
      />
    ),
  },
  {
    internal: 's1',
    external: 't2',
    kind: 'ST',
    option:
      'Guarantee start windows to the largest accounts before a missed date decides for them.',
    verdict: 'defends the accounts by promising hours that do not exist',
    effect: 'loads',
    detail: (
      <ClaimLine
        claim={segmentNote('Industrial and logistics facilities', 'This segment is the most willing')}
        company={company}
        label="why the move is tempting"
      />
    ),
  },
  {
    internal: 'w2',
    external: 'o2',
    kind: 'WO',
    option:
      'Take the planned-replacement programmes, but run survey, commissioning and punch-list off the service book so crew hours go only to installing.',
    verdict: 'the one move that gives crew hours back',
    effect: 'releases',
    detail: (
      <div className="grid gap-2">
        <MetricLine
          metric={operating('Service utilisation')}
          company={company}
          label="service technicians, booked"
          note="against installation crews, who are not"
        />
        <ClaimLine
          claim={{
            text: 'Whether punch-list and commissioning can move to the service pool is an assumption. The pack shows the headroom and shows that rework traces to compressed schedules rather than to skill; it does not show that these technicians are qualified for this work. That is an open question, and it is the one worth answering first.',
            status: 'assumption',
            evidenceRefs: ['ev_104', 'ev_114'],
          }}
          company={company}
          label="what would have to be true"
        />
      </div>
    ),
  },
  {
    internal: 'w1',
    external: 't1',
    kind: 'WT',
    option:
      'Delegate change-order approval under a threshold and order long-lead equipment against the signed queue.',
    verdict: 'contains real damage, and moves days where the limit moves weeks',
    effect: 'neutral',
    detail: <ClaimLine claim={misreading('Approvals are the problem')} company={company} />,
  },
];

/* ---------------------------------------------------------------- the compare */

const WALL_ENTRIES = [
  'Great crews',
  'Strong local reputation',
  'Supply chain issues',
  'Scheduling problems',
  'Growing market',
  'Bigger competitors',
];

const COMPARE = (
  <LensSwitch
    label="The same four lists, twice"
    lenses={[
      {
        id: 'collected',
        label: 'As collected',
        caption: 'the wall · forty minutes, six sticky notes',
        content: (
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              {WALL_ENTRIES.map((entry) => (
                <span
                  key={entry}
                  className="rounded-md border px-3 py-2 text-[13px]"
                  style={{
                    color: 'var(--muted)',
                    borderColor: 'var(--line)',
                    background: 'color-mix(in srgb, var(--surface) 55%, transparent)',
                  }}
                >
                  {entry}
                </span>
              ))}
            </div>
            <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              Every one of these is defensible and not one of them can be crossed with
              anything. Pair &ldquo;great crews&rdquo; with &ldquo;growing market&rdquo; and
              you generate &ldquo;leverage our great crews in the growing market&rdquo;, which
              is a sentence rather than a move. Nothing here can go stale either, because
              nothing here was ever specific enough to stop being true.
            </p>
          </div>
        ),
      },
      {
        id: 'typed',
        label: 'As typed',
        caption: 'the same business · entries that carry their evidence',
        content: (
          <div className="grid gap-2">
            <ClaimLine
              claim={capability('Complex retrofit installation').assessment}
              company={company}
              label="strength"
            />
            <ClaimLine
              claim={capability('Single-approver project control').assessment}
              company={company}
              label="weakness"
            />
            <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              Same wall, same room, same afternoon. These two entries cross with things: one
              of them names what the business can promise and the other names what stops it
              from keeping the promise, and each carries a status saying how much weight it
              will take.
            </p>
          </div>
        ),
      },
    ]}
  />
);

/* ----------------------------------------------------------------- the config */

export const swotTowsPageConfig: FrameworkPageConfig = {
  id: 'swot',
  showpiece: {
    recipe: 'fw/tows-cross',
    actTitle: 'the cross',
    headline: (
      <>
        SWOT gathers. TOWS <em className="italic">generates</em>.
      </>
    ),
    note: 'Four quadrants down the sides, and an empty zone in the middle that stays empty until two entries collide inside it. The lists are the ingredients; the middle is the only place an option has ever come from.',
    pin: 2.2,
    diagram: (
      <TowsCross
        strengths={STRENGTHS}
        weaknesses={WEAKNESSES}
        opportunities={OPPORTUNITIES}
        threats={THREATS}
        crossings={CROSSINGS}
      />
    ),
    evidenceRefs: SHOWPIECE_SOURCES,
    caption: (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          collected from
        </span>
        <EvidenceChips company={company} refs={SHOWPIECE_SOURCES} />
      </div>
    ),
    reading: READING,
  },
  lesson: {
    Body: SwotLesson,
    path: 'src/content/frameworks/swot/lesson.mdx',
  },
  explore: {
    title: (
      <>
        Sixteen pairings. Four of them make <em className="italic">something</em>.
      </>
    ),
    lede: 'Pick one entry from each side and see what the pairing generates. Most pairings generate nothing at all, and finding that out by hand is the fastest way to feel why a wall of four lists has never once produced a strategy.',
    prediction: {
      kicker: 'commit before the cross',
      question:
        "Four options come off Beacon's cross. Only one of them gives the business back capacity it does not currently have. Which?",
      options: [
        {
          id: 'so',
          label: 'Push retrofit volume where buyers pay for speed',
          detail: 'strength × opportunity',
        },
        {
          id: 'st',
          label: 'Guarantee start windows to the largest accounts',
          detail: 'strength × threat',
        },
        {
          id: 'wo',
          label: 'Run survey and commissioning off the service book',
          detail: 'weakness × opportunity',
        },
        {
          id: 'wt',
          label: 'Delegate change-order approval and pre-order equipment',
          detail: 'weakness × threat',
        },
      ],
      correctId: 'wo',
      reveal: (
        <div className="grid gap-3">
          <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
            Two of the four sell more of the thing the business already cannot deliver, and
            they are the two that will sound best in the room. One contains a real problem and
            moves days. Only the weakness-by-opportunity move gives hours back to the crews —
            and it arrives carrying an assumption that has to be tested before anybody acts on
            it, which is what an honest generated option looks like.
          </p>
          <ClaimLine
            claim={{
              text: 'Both strength-led moves add installation work to a dispatch board that already holds thirty-one signed projects at a median wait of sixty-eight days, on a year in which contracts signed ran fourteen ahead of projects completed.',
              status: 'supported_inference',
              evidenceRefs: ['ev_105', 'ev_106'],
            }}
            company={company}
            label="what the popular options would be added to"
          />
          <MetricLine
            metric={operating('Service utilisation')}
            company={company}
            label="where the spare hours are"
            note="a different pool from the one that is full"
          />
        </div>
      ),
    },
    interaction: <TowsCrossPicker internals={INTERNALS} externals={EXTERNALS} moves={MOVES} />,
    compare: COMPARE,
  },
  unlocked: [
    'Four quadrants of typed entries, each carrying its evidence and how sure it is — a wall that can go out of date visibly rather than quietly.',
    'Four generated options with a shape and a verdict, including the two that would make the delivery queue worse and would otherwise have been the popular ones.',
    'An open question worth more than any of the options: whether service technicians can take commissioning work off the installation crews.',
  ],
};

export default swotTowsPageConfig;
