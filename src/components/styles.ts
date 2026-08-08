/**
 * Shared class fragments for the §6 component set.
 *
 * 00-LAW Ruling 7 requires full keyboard operability on every interactive, which in
 * practice means one focus treatment that is unmistakable on a near-black canvas. It
 * lives here so a reviewer can check it once instead of eleven times.
 */

/** The house focus ring: periwinkle (the "active" hue), offset off the dark ground. */
export const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)] ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--void)]';

/** Mono kicker treatment — 01 §3, the system voice. */
export const MONO_LABEL = 'font-system uppercase tracking-[.14em]';
