/**
 * The eleven chapter frameworks' authored content (04-phases S6).
 *
 * ## One shape, eleven times
 *
 * A chapter is not a small full page. The six full frameworks carry a per-framework config
 * module (`components/framework-page/configs/`) with a performing motion recipe, an
 * interactive island and a prediction — hundreds of lines each, because each one is a
 * showpiece. A chapter carries this instead: a summary, a still, and a line about what the
 * lab will open. Same eleven fields, eleven times, so the page template can be written once
 * and so nothing here can drift into being a half-built full page.
 *
 * ## Where the prose lives
 *
 * `src/content/frameworks/<id>/summary.mdx` — one file per chapter, around four hundred
 * words, rendered through the same `mdx-components` house style as the six full lessons, so
 * a visitor moving between depths meets one typography. Each summary uses `>` exactly once,
 * for its pull-quote line (03-content-spec's voice rule), and contains no figures at all:
 * a chapter has no example-company evidence pack bound to its page, and Ruling 4 does not
 * bend for prose that is "only illustrative".
 *
 * The registry's `lesson` path for these records — `<id>/lesson.mdx` — is deliberately
 * still unwritten. It is reserved for the full lesson that arrives when a chapter is
 * promoted; the summary is a different, smaller artefact and gets its own filename rather
 * than pretending to be the lesson at a shorter length.
 */

import type { ComponentType } from 'react';

import { CHAPTER_TEASERS, type ChapterTeaser } from '@/components/framework-page/chapter-teasers';
import { FRAMEWORKS, type FrameworkId } from '@/registry';

import AnsoffSummary from './ansoff/summary.mdx';
import BalancedScorecardSummary from './balanced-scorecard/summary.mdx';
import BlueOceanSummary from './blue-ocean/summary.mdx';
import JobsToBeDoneSummary from './jobs-to-be-done/summary.mdx';
import KanoSummary from './kano/summary.mdx';
import McKinsey7sSummary from './mckinsey-7s/summary.mdx';
import OkrsSummary from './okrs/summary.mdx';
import PestleSummary from './pestle/summary.mdx';
import ThreeHorizonsSummary from './three-horizons/summary.mdx';
import TowsSummary from './tows/summary.mdx';
import ValuePropositionCanvasSummary from './value-proposition-canvas/summary.mdx';

export interface ChapterContent {
  readonly id: FrameworkId;
  /** The ~400-word summary, as an MDX component. */
  readonly Summary: ComponentType;
  /** The static motion-concept frame and the recipe language around it. */
  readonly teaser: ChapterTeaser;
  /**
   * What opens when this chapter is promoted — one sentence, concrete, no dates. It is the
   * copy above the notify-me form, so it is also the only promise the page makes.
   */
  readonly lab: string;
}

const CONTENT: Readonly<Partial<Record<FrameworkId, Omit<ChapterContent, 'id'>>>> = {
  pestle: {
    Summary: PestleSummary,
    teaser: CHAPTER_TEASERS.pestle,
    lab: 'Signals you can score for likelihood, impact and horizon, then watch reorder the terrain read underneath them.',
  },
  tows: {
    Summary: TowsSummary,
    teaser: CHAPTER_TEASERS.tows,
    lab: 'The full cross, on your own SWOT: pick two entries, see whether they mint anything, and keep the ones that do.',
  },
  ansoff: {
    Summary: AnsoffSummary,
    teaser: CHAPTER_TEASERS.ansoff,
    lab: 'A route you can trace across the quadrants, priced in the capabilities your VRIO read says you actually have.',
  },
  'three-horizons': {
    Summary: ThreeHorizonsSummary,
    teaser: CHAPTER_TEASERS['three-horizons'],
    lab: 'An allocation slider across the three horizons, where moving money into one visibly takes it out of another.',
  },
  'blue-ocean': {
    Summary: BlueOceanSummary,
    teaser: CHAPTER_TEASERS['blue-ocean'],
    lab: 'Your industry curve drawn from real buying criteria, and a second curve you redraw factor by factor.',
  },
  'jobs-to-be-done': {
    Summary: JobsToBeDoneSummary,
    teaser: CHAPTER_TEASERS['jobs-to-be-done'],
    lab: 'A struggle timeline built from your own interview excerpts, with the quote behind every station one click away.',
  },
  'value-proposition-canvas': {
    Summary: ValuePropositionCanvasSummary,
    teaser: CHAPTER_TEASERS['value-proposition-canvas'],
    lab: 'Both halves of the canvas, wired together, so the rows that fail to connect are the first thing you see.',
  },
  kano: {
    Summary: KanoSummary,
    teaser: CHAPTER_TEASERS.kano,
    lab: 'Feature classifications per segment, held as hypotheses until survey-structured evidence promotes them.',
  },
  'mckinsey-7s': {
    Summary: McKinsey7sSummary,
    teaser: CHAPTER_TEASERS['mckinsey-7s'],
    lab: 'The tension network for your organisation: pull one element and watch where the other six resist.',
  },
  'balanced-scorecard': {
    Summary: BalancedScorecardSummary,
    teaser: CHAPTER_TEASERS['balanced-scorecard'],
    lab: 'Measures wired to the systems that produce them, so a scorecard that has stopped being written to says so.',
  },
  okrs: {
    Summary: OkrsSummary,
    teaser: CHAPTER_TEASERS.okrs,
    lab: 'A quarter written against the constraint the conductor just named, with baselines, owners and honest confidence.',
  },
};

export function chapterContent(id: FrameworkId): ChapterContent | undefined {
  const entry = CONTENT[id];
  return entry ? { id, ...entry } : undefined;
}

/**
 * Every chapter-depth record has content, and nothing else does.
 *
 * Checked at module load rather than in a unit test, deliberately: this module imports
 * MDX, so it can only be evaluated by the bundler, and the bundler evaluates it during
 * `next build`. A missing summary therefore fails the static export — loudly, with the id
 * that is missing — instead of shipping a page that throws at the visitor. A promoted
 * chapter that still carries chapter content fails the same way, which is the drift this
 * check actually exists to catch.
 */
export function checkChapterContent(): string[] {
  const errors: string[] = [];
  for (const framework of FRAMEWORKS) {
    const present = CONTENT[framework.id] !== undefined;
    if (framework.depth === 'chapter' && !present)
      errors.push(`${framework.id}: chapter depth with no summary content`);
    if (framework.depth === 'full' && present)
      errors.push(`${framework.id}: full depth but still carrying chapter content`);
  }
  for (const id of Object.keys(CONTENT)) {
    if (!FRAMEWORKS.some((f) => f.id === id))
      errors.push(`chapter content for "${id}", which is not a framework`);
  }
  return errors;
}

const CONTENT_ERRORS = checkChapterContent();
if (CONTENT_ERRORS.length > 0)
  throw new Error(`Chapter content invalid:\n  ${CONTENT_ERRORS.join('\n  ')}`);
