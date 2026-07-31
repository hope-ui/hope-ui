// The `## Rejected alternatives` rule, extracted from `check-coverage-parity.mjs` so it can be
// tested directly: that script is a top-level executable that walks the repo and calls
// `process.exit`, so importing it to reach one function would run the whole check.
//
// `blankFencedCode` is a *markdown* projection and lives here rather than beside the TS/TSX
// projections in `source-projection.mjs`, which are a different job (a hand-rolled JS tokenizer)
// with a different set of callers. It has exactly one consumer today; move it next to its siblings
// if a second check ever needs to read markdown.
//
// The rule itself, and why each half of it is enforced: __internal__/definition-of-done.md
// § "Rejected alternatives".

export const REJECTED_ALTERNATIVES_HEADING = "Rejected alternatives";
// The escape hatch, in the same shape as `class-forwarding-ok:` / `rtl-ok:`. `[\s\S]` rather than
// `[^]` so the reason may wrap across lines; biome rejects the latter.
const NO_REJECTED_ALTERNATIVES = /<!--\s*no-rejected-alternatives:(?<reason>[\s\S]*?)-->/;
// The reason is mandatory and must be at least this many words, so it can't decay into a blanket
// `n/a` silencer: four words is enough to force a sentence fragment that names *why* the shape was
// uncontested ("pure data, no contested shape") or points at the file that owns the contested
// decision ("the catalog choice lives in ../catalogs.md").
const MIN_ESCAPE_HATCH_REASON_WORDS = 4;

/**
 * The markdown with every fenced code block blanked — the same idea as `blankNonCode` for TS, and
 * for the same reason: a doc is free to *show* the heading or the escape-hatch comment in an
 * example without thereby satisfying the rule. Line count is preserved, so line-based scanning
 * downstream still lines up with the original file.
 *
 * An unterminated fence blanks to end of file. That is the safe direction: the alternative would
 * let a stray ``` anywhere above the section smuggle one in.
 *
 * @param {string} markdown
 */
export function blankFencedCode(markdown) {
  /** The character (` or ~) opening the fence we are inside, or null at the top level. */
  let fenceChar = null;

  return markdown
    .split("\n")
    .map((line) => {
      const marker = /^\s*(`{3,}|~{3,})/.exec(line);
      if (fenceChar === null) {
        if (marker) {
          fenceChar = marker[1][0];
          return "";
        }
        return line;
      }
      if (marker && marker[1][0] === fenceChar) {
        fenceChar = null;
      }
      return "";
    })
    .join("\n");
}

/**
 * The lines beneath `## Rejected alternatives`, up to the next `#`/`##` heading — or null when the
 * section is absent.
 * @param {string} prose A `blankFencedCode` result.
 */
function rejectedAlternativesSection(prose) {
  const lines = prose.split("\n");
  const heading = new RegExp(`^##\\s+${REJECTED_ALTERNATIVES_HEADING}\\s*$`);
  const start = lines.findIndex((line) => heading.test(line));
  if (start === -1) {
    return null;
  }

  const body = lines.slice(start + 1);
  const end = body.findIndex((line) => /^#{1,2}\s/.test(line));
  return end === -1 ? body : body.slice(0, end);
}

/**
 * Why this doc fails the rejected-alternatives rule, or null when it passes.
 *
 * A doc passes by carrying either a populated `## Rejected alternatives` section or the escape
 * hatch — never both, since a file claiming it had no contested alternative while listing several
 * is a hatch someone forgot to delete after writing the section.
 *
 * "Populated" is two things, because both stubs are what a rule like this decays into: at least one
 * `### <alternative>` entry, and a `**Why not:**` line under each one. An entry with no consequence
 * beneath it records that a choice existed but not what happened when it lost, which is the only
 * part a future reader needs.
 *
 * @param {string} markdown
 * @returns {string | null}
 */
export function rejectedAlternativesProblem(markdown) {
  const prose = blankFencedCode(markdown);
  const section = rejectedAlternativesSection(prose);
  const hatch = NO_REJECTED_ALTERNATIVES.exec(prose);

  if (section && hatch) {
    return `carries both a \`## ${REJECTED_ALTERNATIVES_HEADING}\` section and a \`no-rejected-alternatives:\` escape hatch — delete the hatch`;
  }

  if (hatch) {
    const words = hatch.groups.reason.trim().split(/\s+/).filter(Boolean);
    return words.length >= MIN_ESCAPE_HATCH_REASON_WORDS
      ? null
      : `\`no-rejected-alternatives:\` needs a reason of at least ${MIN_ESCAPE_HATCH_REASON_WORDS} words saying what made the shape uncontested (or pointing at the doc that owns the contested decision)`;
  }

  if (!section) {
    return `missing a \`## ${REJECTED_ALTERNATIVES_HEADING}\` section (or a \`<!-- no-rejected-alternatives: <reason> -->\` comment)`;
  }

  /** @type {Array<{ title: string; hasWhyNot: boolean }>} */
  const entries = [];
  for (const line of section) {
    const entryHeading = /^###\s+(?<title>.+?)\s*$/.exec(line);
    if (entryHeading) {
      entries.push({ title: entryHeading.groups.title, hasWhyNot: false });
    } else if (entries.length > 0 && /^\s*\*\*Why not:\*\*\s*\S/.test(line)) {
      entries.at(-1).hasWhyNot = true;
    }
  }

  if (entries.length === 0) {
    return `\`## ${REJECTED_ALTERNATIVES_HEADING}\` has no \`### <alternative>\` entry beneath it`;
  }
  const unexplained = entries.find((entry) => !entry.hasWhyNot);
  if (unexplained) {
    return `\`## ${REJECTED_ALTERNATIVES_HEADING}\` entry "${unexplained.title}" has no \`**Why not:** <consequence>\` line`;
  }
  return null;
}
