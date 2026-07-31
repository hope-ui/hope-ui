// Pins the `## Rejected alternatives` rule (__internal__/definition-of-done.md).
//
// Worth a test where the other check scripts have none, because this rule's failure mode is
// *silent acceptance*: every loophole here — a stub section, an entry with no consequence, a
// one-word escape hatch, a heading shown inside a code fence — leaves a doc that reads as if it
// records its history while recording nothing, and no other check would ever notice. The
// class-forwarding and RTL checks fail loudly when they regress; this one just stops asking.

import { describe, expect, it } from "vitest";
import { blankFencedCode, rejectedAlternativesProblem } from "../rejected-alternatives.mjs";

/** The canonical shape from the Definition of Done, as a doc a maintainer would actually write. */
const VALID = `# \`createThing\`

## API

Some prose.

## Rejected alternatives

### \`element.scrollIntoView()\` (the native call)
**Why not:** Walks every scrollable ancestor up to the document, so revealing an option inside a
floating popup scrolls the page out from under the reader.
`;

const passes = (markdown) => expect(rejectedAlternativesProblem(markdown)).toBeNull();
const failsWith = (markdown, fragment) =>
  expect(rejectedAlternativesProblem(markdown)).toContain(fragment);

describe("a populated section", () => {
  it("passes", () => {
    passes(VALID);
  });

  it("passes with a Revisit if: line", () => {
    passes(`${VALID}**Revisit if:** a primitive needs to reveal across nested scroll ports.\n`);
  });

  it("passes without one — Revisit if: is optional, and is not checked", () => {
    expect(VALID).not.toContain("Revisit if:");
    passes(VALID);
  });

  it("passes with several entries", () => {
    passes(`## Rejected alternatives

### First thing
**Why not:** it diverges \`_hk\` on hydration.

### Second thing
**Why not:** it leaves the background focusable.
`);
  });
});

describe("the two stubs this rule decays into", () => {
  it("rejects a section with no entry beneath it", () => {
    failsWith("# X\n\n## Rejected alternatives\n\n## SSR\n", "has no `### <alternative>` entry");
  });

  it("rejects an entry with no Why not: line", () => {
    failsWith(
      "# X\n\n## Rejected alternatives\n\n### A thing\nIt just felt wrong.\n",
      'entry "A thing" has no `**Why not:** <consequence>` line',
    );
  });

  it("rejects a Why not: marker with no consequence after it", () => {
    failsWith("## Rejected alternatives\n\n### A thing\n**Why not:**\n", 'entry "A thing"');
  });

  it("names the offending entry when an earlier one is well-formed", () => {
    failsWith(
      `## Rejected alternatives

### Well-formed thing
**Why not:** it strands focus on \`<body>\`.

### Stub thing
`,
      '"Stub thing"',
    );
  });
});

describe("the escape hatch", () => {
  it("passes with a four-word reason", () => {
    passes("# X\n\n<!-- no-rejected-alternatives: pure data, no contested shape -->\n");
  });

  it("passes when the reason wraps across lines", () => {
    passes(`# X

<!-- no-rejected-alternatives: the contested decision is argued
     in ../catalogs.md, which owns the fallback chain -->
`);
  });

  it("rejects a reason under four words, so it cannot become a blanket n/a", () => {
    failsWith("# X\n\n<!-- no-rejected-alternatives: n/a -->\n", "at least 4 words");
    failsWith("# X\n\n<!-- no-rejected-alternatives: nothing was contested -->\n", "at least 4");
  });

  it("rejects an empty reason", () => {
    failsWith("# X\n\n<!-- no-rejected-alternatives: -->\n", "at least 4 words");
  });

  it("rejects carrying both the hatch and a section", () => {
    failsWith(
      `<!-- no-rejected-alternatives: pure data, no contested shape -->

## Rejected alternatives

### A thing
**Why not:** it breaks hydration.
`,
      "delete the hatch",
    );
  });
});

describe("a doc with neither", () => {
  it("is rejected", () => {
    failsWith("# X\n\n## API\n\nSome prose.\n", "missing a `## Rejected alternatives` section");
  });
});

describe("fenced code cannot satisfy the rule", () => {
  // The DoD itself, and CLAUDE.md, both *show* the heading and the hatch in examples. A doc that
  // documents the rule must not thereby pass it.
  it("ignores a section shown inside a backtick fence", () => {
    failsWith(
      "# X\n\n```markdown\n## Rejected alternatives\n\n### A thing\n**Why not:** x.\n```\n",
      "missing a `## Rejected alternatives` section",
    );
  });

  it("ignores a section shown inside a tilde fence", () => {
    failsWith(
      "# X\n\n~~~markdown\n## Rejected alternatives\n\n### A thing\n**Why not:** x.\n~~~\n",
      "missing a `## Rejected alternatives` section",
    );
  });

  it("ignores a hatch shown inside a fence", () => {
    failsWith(
      "# X\n\n```markdown\n<!-- no-rejected-alternatives: pure data, no contested shape -->\n```\n",
      "missing a `## Rejected alternatives` section",
    );
  });

  it("still sees a real section after a closed fence", () => {
    passes(`# X

\`\`\`ts
const x = 1;
\`\`\`

## Rejected alternatives

### A thing
**Why not:** it double-renders on hydration.
`);
  });

  it("does not let a tilde line close a backtick fence", () => {
    failsWith(
      "# X\n\n```markdown\n~~~\n## Rejected alternatives\n\n### A thing\n**Why not:** x.\n```\n",
      "missing a `## Rejected alternatives` section",
    );
  });
});

describe("section boundaries", () => {
  it("stops at the next H2, so a later entry does not count", () => {
    failsWith(
      "## Rejected alternatives\n\n## SSR\n\n### A thing\n**Why not:** x.\n",
      "has no `### <alternative>` entry",
    );
  });

  it("stops at an H1", () => {
    failsWith(
      "## Rejected alternatives\n\n# Another doc\n\n### A thing\n**Why not:** x.\n",
      "has no `### <alternative>` entry",
    );
  });

  it("does not count an entry above the section", () => {
    failsWith(
      "## Behavior\n\n### A thing\n**Why not:** x.\n\n## Rejected alternatives\n",
      "has no `### <alternative>` entry",
    );
  });

  it("requires the exact heading, so the docs stay uniform", () => {
    failsWith("## Rejected alternatives (draft)\n\n### A\n**Why not:** x.\n", "missing a");
    failsWith("## Rejected Alternatives\n\n### A\n**Why not:** x.\n", "missing a");
    failsWith("### Rejected alternatives\n\n### A\n**Why not:** x.\n", "missing a");
  });
});

describe("blankFencedCode", () => {
  it("preserves line count so downstream line scanning stays aligned", () => {
    const source = "a\n```\nb\nc\n```\nd\n";
    expect(blankFencedCode(source).split("\n")).toHaveLength(source.split("\n").length);
  });

  it("blanks to end of file on an unterminated fence", () => {
    // The safe direction: otherwise a stray ``` above the section could smuggle one in.
    failsWith(
      "# X\n\n```\n\n## Rejected alternatives\n\n### A thing\n**Why not:** x.\n",
      "missing a `## Rejected alternatives` section",
    );
  });

  it("leaves ordinary prose untouched", () => {
    expect(blankFencedCode("# X\n\nSome prose.\n")).toBe("# X\n\nSome prose.\n");
  });
});
