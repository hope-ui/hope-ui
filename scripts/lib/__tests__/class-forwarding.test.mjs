// Pins the class-forwarding rule (CLAUDE.md § "Every public part forwards its DOM props").
//
// The rule guards a bug that is silent in every other signal: a part that drops the consumer's
// `class` type-checks, passes its own suite, and keeps the docs promising the opposite — which is
// how it shipped in five `Alert` parts and twice before that. The checker is the only thing that
// notices, so a regression *in the checker* restores the silence. Both directions matter equally
// here: a rule that stops reporting lets the bug back in, and a rule that gets stricter fails the
// build for the inline `class={slots.label()}` chrome this repo writes on purpose.

import { describe, expect, it } from "vitest";
import { classForwardingViolations } from "../class-forwarding.mjs";

const linesOf = (source) => classForwardingViolations(source).map((violation) => violation.line);
const passes = (source) => expect(classForwardingViolations(source)).toEqual([]);

/** The canonical part, written correctly: the slot fn is handed the consumer's class. */
const COMPLIANT_PART = `import { merge, omit } from "solid-js";

export const Icon = (props) => {
  const ctx = useAlertContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get class(): string {
      return ctx.slots.icon(props.class);
    },
  });

  return renderElement({ as: "span", props: elementProps });
};
`;

/** The same part with the argument dropped — the shipped `Alert` bug, on line 9. */
const DROPS_THE_CLASS = COMPLIANT_PART.replace("ctx.slots.icon(props.class)", "ctx.slots.icon()");

describe("shape 1 — a bare slot call inside a `get class()`", () => {
  it("passes when the slot fn is handed the consumer's class", () => {
    passes(COMPLIANT_PART);
  });

  it("passes when a root hands it the merged class", () => {
    passes(COMPLIANT_PART.replace("ctx.slots.icon(props.class)", "slots.root(merged.class)"));
  });

  it("flags the bare call, on the call's own line", () => {
    expect(classForwardingViolations(DROPS_THE_CLASS)).toEqual([
      {
        line: 9,
        message:
          "`slots.icon()` in a `get class()` drops the consumer's class; " +
          "pass it: `slots.icon(props.class)`",
      },
    ]);
  });

  it("names the slot in the message, so the fix is copy-pasteable", () => {
    const [violation] = classForwardingViolations(
      DROPS_THE_CLASS.replace("ctx.slots.icon()", "ctx.slots.itemIndicator()"),
    );
    expect(violation.message).toContain("`slots.itemIndicator(props.class)`");
  });

  it("flags a call whose empty argument list carries whitespace", () => {
    expect(linesOf(DROPS_THE_CLASS.replace("ctx.slots.icon()", "ctx.slots.icon( )"))).toEqual([9]);
  });

  it("reports every offending getter in a file, at its own line", () => {
    const twoParts = `export const Icon = (props) => {
  const elementProps = merge(rest, {
    get class(): string {
      return ctx.slots.icon();
    },
  });
  return renderElement({ as: "span", props: elementProps });
};

export const Title = (props) => {
  const elementProps = merge(rest, {
    get class(): string {
      return ctx.slots.title();
    },
  });
  return renderElement({ as: "h2", props: elementProps });
};
`;
    expect(linesOf(twoParts)).toEqual([4, 13]);
  });
});

describe('shape 2 — `omit(…, "class")` with the class never read back', () => {
  // The half no getter reveals: a part that renders no recipe slot at all (`Dialog.Trigger`) still
  // removes `class` from what it forwards, and then the class reaches neither the hook nor the
  // element.
  const DROPS_VIA_OMIT = `export const Trigger = (props) => {
  const rest = omit(props, "render", "class");
  return renderElement({ as: "button", props: rest });
};
`;

  it("flags the omit, on the omit's own line", () => {
    expect(classForwardingViolations(DROPS_VIA_OMIT)).toEqual([
      {
        line: 2,
        message:
          'omits "class" from the forwarded props but never reads ' +
          "`props.class`/`merged.class`, so the consumer's class reaches nothing",
      },
    ]);
  });

  it("flags a single-quoted key too", () => {
    expect(linesOf(DROPS_VIA_OMIT.replace('"class"', "'class'"))).toEqual([2]);
  });

  it("does not flag an omit that keeps `class`", () => {
    passes(DROPS_VIA_OMIT.replace(', "class"', ""));
  });

  it("does not flag a key that merely starts with `class`", () => {
    passes(DROPS_VIA_OMIT.replace('"class"', '"className"'));
  });

  it("does not flag when the class is read back", () => {
    passes(DROPS_VIA_OMIT.replace("props: rest", "props: merge(rest, { class: props.class })"));
  });

  // The argument list is re-read from the ORIGINAL source, because the code projection blanks
  // string interiors — read off the projection, `"class"` would be invisible and this whole shape
  // would silently stop reporting.
  it("sees the quoted key even though the projection blanks string interiors", () => {
    expect(linesOf(DROPS_VIA_OMIT)).toHaveLength(1);
  });

  it("a single compliant read anywhere suppresses EVERY omit in the file", () => {
    // Deliberate, and deliberately coarse: the read is a file-wide test, not a per-part one. The
    // `Trigger` below is a real violation in isolation, and goes unreported because an unrelated
    // part further down happens to read `merged.class`.
    const twoParts = `export const Trigger = (props) => {
  const rest = omit(props, "render", "class");
  return renderElement({ as: "button", props: rest });
};

export const Content = (props) => {
  const merged = withDefaults(props, { size: "md" });
  const rest = omit(merged, "render", "class");
  const elementProps = merge(rest, {
    get class(): string {
      return ctx.slots.content(merged.class);
    },
  });
  return renderElement({ as: "div", props: elementProps });
};
`;
    expect(linesOf(twoParts.slice(0, twoParts.indexOf("\n\nexport const Content")))).toEqual([2]);
    passes(twoParts);
  });
});

describe("shapes that must stay legal", () => {
  it("ignores a bare slot call in a JSX attribute — that is component-internal chrome", () => {
    // Button's label and decorators, Badge's dot, CloseButton's icon: inline elements a consumer
    // cannot address with a `class` prop, because they are not parts. Only a `get class()` is in
    // scope, and that restriction is what keeps this check at zero false positives.
    passes(`export const Button = (props) => {
  return (
    <button class={slots.root()}>
      <span class={slots.label()}>{props.children}</span>
    </button>
  );
};
`);
  });

  it("ignores a slot call outside any getter", () => {
    passes(`const rootClass = slots.root();\nexport const Icon = () => rootClass;\n`);
  });
});

describe("the `class-forwarding-ok:` escape hatch", () => {
  /** A getter with no consumer to forward from — `CalendarCell` is built by `Calendar.Grid`. */
  const cell = (lines) => `export const Cell = (props) => {
  const elementProps = {
${lines}
  };
  return renderElement({ as: "td", props: elementProps });
};
`;

  it("exempts on the offending line itself", () => {
    passes(
      cell(`    get class(): string {
      return ctx.slots.cell(); // class-forwarding-ok: built from a model, never written in JSX
    },`),
    );
  });

  it("exempts from the comment block directly above the getter", () => {
    passes(
      cell(`    // class-forwarding-ok: CalendarCell is built by Calendar.Grid from a model, so
    // there is no consumer class to fold in.
    get class(): string {
      return ctx.slots.cell();
    },`),
    );
  });

  it("exempts from a JSDoc block above the getter", () => {
    passes(
      cell(`    /**
     * class-forwarding-ok: built from a model, never written in JSX.
     */
    get class(): string {
      return ctx.slots.cell();
    },`),
    );
  });

  it("does NOT exempt when a blank line breaks the comment block", () => {
    expect(
      linesOf(
        cell(`    // class-forwarding-ok: built from a model.

    get class(): string {
      return ctx.slots.cell();
    },`),
      ),
    ).toEqual([6]);
  });

  it("does NOT exempt when a code line breaks the comment block", () => {
    expect(
      linesOf(
        cell(`    // class-forwarding-ok: built from a model.
    "data-slot": "calendar-cell",
    get class(): string {
      return ctx.slots.cell();
    },`),
      ),
    ).toEqual([6]);
  });

  it("does NOT exempt from a trailing comment on the getter line", () => {
    // The block is walked upward from the getter, so the getter's own line is never inspected —
    // only the offending line and the comment block above.
    expect(
      linesOf(
        cell(`    get class(): string { // class-forwarding-ok: too late, this line is not inspected
      return ctx.slots.cell();
    },`),
      ),
    ).toEqual([4]);
  });

  it("exempts a one-line getter, where the call line IS the getter line", () => {
    passes(
      cell(
        "    get class(): string { return ctx.slots.cell(); } // class-forwarding-ok: no consumer",
      ),
    );
  });

  const OMITTING_TRIGGER = `export const Trigger = (props) => {
  const rest = omit(props, "render", "class");
  return renderElement({ as: "button", props: rest });
};
`;

  it("exempts the omit shape on the omit line", () => {
    passes(
      OMITTING_TRIGGER.replace(
        '"class");',
        '"class"); // class-forwarding-ok: the primitive hook composes the class itself',
      ),
    );
  });

  it("exempts the omit shape from the comment block above the omit", () => {
    passes(
      OMITTING_TRIGGER.replace(
        "  const rest",
        "  // class-forwarding-ok: the primitive hook composes the class itself.\n  const rest",
      ),
    );
  });

  it("does not let a getter's exemption cover an omit elsewhere in the file", () => {
    // The omit shape passes its own line as the block start, so it only looks directly above
    // itself — an exemption written for a getter cannot silence it.
    expect(
      linesOf(`export const Root = (props) => {
  const elementProps = {
    // class-forwarding-ok: this element is built from a model, never written in JSX.
    get class(): string {
      return ctx.slots.root();
    },
  };
  const rest = omit(props, "render", "class");
  return renderElement({ as: "div", props: elementProps });
};
`),
    ).toEqual([8]);
  });
});

describe("comments, strings and regexes cannot trip the rule", () => {
  it("ignores the forbidden shapes spelled out in a comment", () => {
    // `check-class-forwarding.mjs`'s own header writes both violations out in full. A file that
    // documents the rule must not thereby fail it.
    passes(`// A part must never write:
//
//     const elementProps = merge(rest, {
//       get class(): string {
//         return ctx.slots.icon();
//       },
//     });
//
// ...nor omit(props, "render", "class") without ever reading it back.
export const Icon = (props) => renderElement({ as: "span", props });
`);
  });

  it("ignores the forbidden shapes inside string literals", () => {
    passes(`const badGetter = "get class(): string { return ctx.slots.icon(); }";
const badOmit = 'omit(props, "render", "class")';
export const Icon = (props) => renderElement({ as: "span", props });
`);
  });

  it("ignores a call shape spelled out inside a regex literal", () => {
    // A regex literal is code, but the projection blanks its contents too — so a capture group
    // that happens to read like the forbidden call is not a call.
    passes(`const OMIT_PATTERN = /omit(props, "class")/;
export const Icon = (props) => renderElement({ as: "span", props });
`);
  });

  it("still reports a real violation sitting under a comment that describes it", () => {
    expect(
      linesOf(`// The slot fn below must be handed props.class.
export const Icon = (props) => {
  const elementProps = {
    get class(): string {
      return ctx.slots.icon();
    },
  };
};
`),
    ).toEqual([5]);
  });
});

describe("known looseness — documented, not endorsed", () => {
  it("accepts ANY argument in the getter, not specifically the consumer's class", () => {
    // The rule only checks the argument list is non-empty, so a slot call handed something else
    // entirely passes. The runtime pin (part-class-forwarding.browser.test.tsx) is what covers it.
    passes(COMPLIANT_PART.replace("ctx.slots.icon(props.class)", 'ctx.slots.icon(cx("shrink-0"))'));
  });

  it("honours the exemption marker even when it sits inside a string", () => {
    // Detection reads the code projection; the exemption lookup reads the raw line. So the marker
    // is findable in places the violation itself would be invisible.
    passes(
      DROPS_THE_CLASS.replace(
        "ctx.slots.icon();",
        'ctx.slots.icon() + "class-forwarding-ok: not a comment";',
      ),
    );
  });
});
