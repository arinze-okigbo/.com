import type { ReactNode } from "react";

import { InlineLink } from "@/components/ui/InlineLink";

/**
 * Inline span parsing for post bodies: links, code, strong, em.
 *
 * Order matters — code spans are extracted first so that emphasis markers inside
 * a code span are never interpreted.
 */

type Rule = {
  readonly pattern: RegExp;
  readonly render: (match: RegExpExecArray, key: string) => ReactNode;
};

const RULES: readonly Rule[] = [
  {
    pattern: /`([^`]+)`/,
    render: (match, key) => <code key={key}>{match[1]}</code>,
  },
  {
    pattern: /\[([^\]]+)\]\(([^)\s]+)\)/,
    render: (match, key) => (
      <InlineLink key={key} href={match[2]}>
        {match[1]}
      </InlineLink>
    ),
  },
  {
    pattern: /\*\*([^*]+)\*\*/,
    render: (match, key) => <strong key={key}>{match[1]}</strong>,
  },
  {
    pattern: /(?<!\*)\*([^*]+)\*(?!\*)/,
    render: (match, key) => <em key={key}>{match[1]}</em>,
  },
];

function firstMatch(text: string): { rule: Rule; match: RegExpExecArray } | null {
  return RULES.reduce<{ rule: Rule; match: RegExpExecArray } | null>((earliest, rule) => {
    const match = rule.pattern.exec(text);
    if (match === null) return earliest;
    if (earliest !== null && earliest.match.index <= match.index) return earliest;
    return { rule, match };
  }, null);
}

/** Renders one line of inline markdown to React nodes. Never mutates its input. */
export function renderInline(text: string, keyPrefix: string): readonly ReactNode[] {
  const found = firstMatch(text);
  if (found === null) return text.length > 0 ? [text] : [];

  const { rule, match } = found;
  const before = text.slice(0, match.index);
  const after = text.slice(match.index + match[0].length);

  return [
    ...(before.length > 0 ? [before] : []),
    rule.render(match, `${keyPrefix}-${match.index}`),
    ...renderInline(after, `${keyPrefix}-a${match.index}`),
  ];
}
