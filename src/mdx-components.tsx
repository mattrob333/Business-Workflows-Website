import type { MDXComponents } from 'mdx/types';

/**
 * The house style for MDX prose — required by `@next/mdx` in the App Router, and the only
 * place lesson typography is decided.
 *
 * 01-design-system §3's three voices, applied: Newsreader for the section headings, Inter
 * at 17px over 1.7 for the body (the teaching voice, measure capped at 68ch), IBM Plex Mono
 * for anything that is a label rather than a sentence. Lessons therefore carry no classes
 * of their own — a lesson file is prose, and if an author needs a class to make a paragraph
 * read correctly, the mistake is here rather than there.
 *
 * **The blockquote is the pull quote.** 03-content-spec requires exactly one
 * quote-worthy line per framework page, set in Newsreader italic; the convention is that a
 * lesson uses `>` once, for that line, and never for anything else. Marked with
 * `data-pullquote` so the S3 walk can assert every full page actually has one.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children, ...props }) => (
      <h2
        className="font-narrative mt-12 mb-4 max-w-[26ch] text-[clamp(22px,2.6vw,30px)] leading-[1.12] text-balance"
        style={{ color: 'var(--ink)' }}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className="font-system mt-8 mb-3 text-[11px] uppercase"
        style={{ color: 'var(--flow)', letterSpacing: '.14em' }}
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p
        className="mt-4 max-w-[68ch] text-[17px] leading-[1.7]"
        style={{ color: 'var(--muted)' }}
        {...props}
      >
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul className="mt-4 grid max-w-[68ch] gap-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="mt-4 grid max-w-[68ch] list-decimal gap-2 pl-5" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="text-[17px] leading-[1.6]" style={{ color: 'var(--muted)' }} {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-medium" style={{ color: 'var(--ink)' }} {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),
    a: ({ children, ...props }) => (
      <a
        className="rounded-sm underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)]"
        style={{ color: 'var(--flow)' }}
        {...props}
      >
        {children}
      </a>
    ),
    hr: (props) => (
      <hr className="mt-10 mb-2 border-0 border-t" style={{ borderColor: 'var(--line)' }} {...props} />
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        data-pullquote="true"
        className="font-narrative my-10 max-w-[30ch] border-l pl-6 text-[clamp(24px,3.2vw,34px)] leading-[1.15] italic"
        style={{ color: 'var(--ink)', borderColor: 'color-mix(in srgb, var(--flow) 55%, transparent)' }}
        {...props}
      >
        {children}
      </blockquote>
    ),
    code: ({ children, ...props }) => (
      <code
        className="font-system rounded-[3px] px-[5px] py-[2px] text-[13px]"
        style={{ color: 'var(--ink)', background: 'var(--raised)' }}
        {...props}
      >
        {children}
      </code>
    ),
    ...components,
  };
}
