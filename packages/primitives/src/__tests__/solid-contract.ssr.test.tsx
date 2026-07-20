import { Dynamic, type JSX, renderToStringAsync } from "@solidjs/web";
import { children, createUniqueId, Show } from "solid-js";
import { describe, expect, it } from "vitest";

/**
 * The **server-build** half of the Solid contract. This file only means anything in the `ssr`
 * Vitest project, which is the one place `solid-js` *and* `@solidjs/web` both resolve to their
 * `dist/server.js` entries — the same pair a SolidStart server process loads.
 *
 * Its sibling `solid-contract.browser.test.tsx` pins the client-build behaviors (`applyRef`).
 *
 * See `__internal__/testing.md` and `__internal__/migration-2.0-stable.md` §2.
 */

describe("@solidjs/web server-build contract", () => {
  it("renders a host element through Dynamic, with a hydration key", async () => {
    // Depended on by: `renderElement` (packages/primitives/src/utils/render.tsx), the
    // `as`/render-prop polymorphism helper. Everything it renders goes through `<Dynamic>`, and
    // server-side `dynamic()` calls `ssrElement(component, props, undefined, true)` — the
    // trailing `true` is what emits the `_hk` hydration key those elements hydrate against. If
    // stable drops the key, elements rendered through `renderElement` stop hydrating. See
    // __internal__/migration-2.0-stable.md §3.
    const html = await renderToStringAsync(() => (
      <Dynamic component="span" id="pinned">
        hi
      </Dynamic>
    ));

    expect(html).toContain("<span");
    expect(html).toContain('id="pinned"');
    expect(html).toContain(">hi<");
    expect(html).toMatch(/_hk=\d+/);
  });
});

describe("solid-js server-build contract", () => {
  it("makes createUniqueId consume a hydration child id, exactly as the hydrating client does", async () => {
    // The behavior that kept Dialog's hydration round-trip impossible for months, once the
    // `ssr` project stopped being a hybrid.
    //
    // `createUniqueId()` is three different functions depending on the build:
    //   server build:                `getNextChildId(owner)`            — consumes an id
    //   client build, hydrating:     `sharedConfig.getNextContextId()`  — consumes an id
    //   client build, not hydrating: `` `cl-${counter++}` ``            — consumes nothing
    //
    // The first two bottom out in the same `nextChildIdFor(owner)`. So a server render and a
    // hydrating client walk the same counter, and their `_hk` keys line up — but only if the
    // SSR half genuinely runs the server build. While `vitest.config.ts` aliased
    // `@solidjs/web` and left `solid-js` on its browser build, the SSR half took the
    // `cl-${counter++}` branch, consumed nothing, and every key after the first
    // `createUniqueId()` was off by one.
    //
    // Observable proof: the id must *not* look like `cl-N`, and calling it must shift the
    // hydration key of the element rendered after it.
    const withoutId = await renderToStringAsync(() => <Dynamic component="span">hi</Dynamic>);
    const withId = await renderToStringAsync(() => {
      const id = createUniqueId();
      expect(id).not.toMatch(/^cl-/);
      return <Dynamic component="span">hi</Dynamic>;
    });

    const keyOf = (html: string) => html.match(/_hk=(\S+)/)?.[1];

    expect(keyOf(withoutId)).toBeDefined();
    expect(keyOf(withId)).toBeDefined();
    expect(keyOf(withId)).not.toBe(keyOf(withoutId));
  });
});

describe("solid-js server-build contract: the <Show> `when`-gate read is the extra hydration key", () => {
  // Depended on by: `@hope-ui/components` Button and Badge slot rendering
  // (packages/components/src/{button,badge}/*.tsx). This pins the *server* half of the long-standing
  // "component inside a <Show> breaks hydration" bug (solidjs/solid#2384, solidjs/solid-start#1089),
  // still present in the 2.0 beta line — and, crucially, isolates the actual cause.
  //
  // A component passed as a prop is created LAZILY: the consumer's `x={<Icon/>}` compiles to a getter
  // that runs `createComponent(Icon)` where the prop is *read*. What breaks hydration is NOT merely
  // reading it inside a <Show> — it is reading it in the <Show>'s `when` gate AND again in its body
  // (the idiomatic `when={x != null}` + `{x}`). The `when` read builds a component only to test
  // truthiness and discards it, but still allocates a hydration key; the client evaluates `when`
  // under a memo/insert-effect owner the server does not, so that discarded key lands at a different
  // position on each side and the real body node comes out one `_hk` off. Isolated round-trips (see
  // the browser suite / button-icons / badge-icons) confirm the split: a single read inside a <Show>
  // hydrates cleanly, and a double read that does not touch the `when` gate (both reads in the body,
  // or no <Show> at all) hydrates cleanly — only `when`+body fails.
  //
  // These are *server*-side pins of the mechanism: the sole difference between `WhenGateAndBody` and
  // `BodyOnly` is the extra `when`-gate read, and it shows up as exactly one extra allocated `_hk`.
  // `children()` (the Button/Badge fix) resolves the slot once in the ambient owner, so the `when`
  // gate reads the memoized accessor — no phantom build — and the key relocates. They fail if a
  // future solid changes `createComponent`'s owner treatment (the day the upstream bug is fixed and
  // the `children()` indirection can be dropped).

  const Icon = (): JSX.Element => <svg data-icon="1" />;

  // The failing idiom: the prop is read in the `when` gate AND the body.
  const WhenGateAndBody = (props: { icon?: JSX.Element }): JSX.Element => (
    <Show when={props.icon != null}>
      <span data-slot="s">{props.icon}</span>
    </Show>
  );
  // The control: the <Show> gates on an unrelated flag, so the prop is read exactly ONCE, in the
  // body. Same <Show>, but no `when`-gate read — this is the shape that hydrates cleanly, and it
  // proves the <Show> itself is not the cause.
  const BodyOnly = (props: { icon?: JSX.Element; show?: boolean }): JSX.Element => (
    <Show when={props.show}>
      <span data-slot="s">{props.icon}</span>
    </Show>
  );
  // The fix: resolve once with `children()`, read the accessor in both the gate and the body.
  const Eager = (props: { icon?: JSX.Element }): JSX.Element => {
    const icon = children(() => props.icon);
    return (
      <Show when={icon() != null}>
        <span data-slot="s">{icon()}</span>
      </Show>
    );
  };

  it("keys the body <svg> one position later when the prop is also read in the `when` gate", async () => {
    const whenGateAndBody = await renderToStringAsync(() => <WhenGateAndBody icon={<Icon />} />);
    const bodyOnly = await renderToStringAsync(() => <BodyOnly icon={<Icon />} show={true} />);
    const eager = await renderToStringAsync(() => <Eager icon={<Icon />} />);

    // All three render the same structure: a keyed span wrapping the component's keyed root <svg>.
    for (const html of [whenGateAndBody, bodyOnly, eager]) {
      expect(html).toMatch(/<span _hk=\S+ data-slot="s"><svg _hk=\S+ data-icon="1">/);
    }

    const svgKey = (html: string) => html.match(/<svg _hk=(\S+) /)?.[1];

    // Isolation pin: `WhenGateAndBody` and `BodyOnly` are identical except for the extra `when`-gate
    // read, and both sit inside a <Show> — so the <Show> is NOT the variable. The `when`-gate read
    // (a built-then-discarded component) burns exactly one extra hydration key, so the rendered body
    // <svg> keys one position later than the single-read control.
    expect(svgKey(whenGateAndBody)).toBeDefined();
    expect(svgKey(bodyOnly)).toBeDefined();
    expect(svgKey(whenGateAndBody)).not.toBe(svgKey(bodyOnly));
    expect(Number(svgKey(whenGateAndBody))).toBe(Number(svgKey(bodyOnly)) + 1);

    // The fix relocates the key: `children()` allocates the component in the ambient owner (ahead of
    // the span), a different position than either raw-prop form — which is what lets it hydrate.
    expect(svgKey(eager)).toBeDefined();
    expect(svgKey(eager)).not.toBe(svgKey(whenGateAndBody));
  });
});
