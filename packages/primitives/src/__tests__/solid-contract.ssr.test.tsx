import { Dynamic, type JSX, renderToStream } from "@solidjs/web";
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
    // Depended on by `renderElement` (packages/primitives/src/render/render.tsx): everything it
    // renders goes through `<Dynamic>`, and server-side `dynamic()` calls
    // `ssrElement(component, props, undefined, true)` — that trailing `true` is what emits the
    // `_hk` hydration key, the positional marker Solid matches server and client nodes by. If
    // stable drops the key, every element `renderElement` renders stops hydrating. See
    // `__internal__/migration-2.0-stable.md` §3.
    const html = await renderToStream(() => (
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
    // `createUniqueId()` is three different functions depending on the build:
    //   server build:                `getNextChildId(owner)`            — consumes an id
    //   client build, hydrating:     `sharedConfig.getNextContextId()`  — consumes an id
    //   client build, not hydrating: `` `cl-${counter++}` ``            — consumes nothing
    //
    // The first two bottom out in the same `nextChildIdFor(owner)`, so a server render and a
    // hydrating client walk one counter and their `_hk` keys line up — but only while the SSR half
    // genuinely runs the server build. Aliasing `@solidjs/web` alone and leaving `solid-js` on its
    // browser build (which `vitest.config.ts` once did) puts the server half on the
    // `cl-${counter++}` branch, consuming nothing, and every key after the first `createUniqueId()`
    // comes out one off. So: the id must *not* look like `cl-N`, and calling it must shift the
    // hydration key of whatever renders after it.
    const withoutId = await renderToStream(() => <Dynamic component="span">hi</Dynamic>);
    const withId = await renderToStream(() => {
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

describe("solid-js server-build contract: the <Show> `when`-gate read no longer burns a key", () => {
  // Depended on by `@hope-ui/components` Button and Badge slot rendering. This pins the *server*
  // half of the long-standing "component inside a <Show> breaks hydration" bug (solidjs/solid#2384,
  // solidjs/solid-start#1089) — and, since 2.0.0-beta.32, its fix.
  //
  // A component passed as a prop is built lazily: `x={<Icon/>}` compiles to a getter that runs
  // `createComponent(Icon)` wherever the prop is *read*. The trigger was never reading it inside a
  // <Show>; it was reading it in the <Show>'s `when` gate AND again in its body — the idiomatic
  // `when={x != null}` + `{x}`. The `when` read builds a component only to test truthiness and
  // throws it away, and it used to still allocate a hydration key (`_hk`, the positional marker
  // Solid matches server and client nodes by). The client evaluates `when` under an owner the
  // server does not, so that discarded key landed at a different position on each side and the real
  // body node ended up one key off.
  //
  // beta.32 fixed it upstream ("corrected hydration id drift from allocation-capable prop getters
  // in flow controls"): the discarded gate component no longer consumes an id, so `WhenGateAndBody`
  // and `BodyOnly` — which differ *only* in that extra gate read — now key identically. That
  // equality is the whole assertion; it flipping back is the regression this test exists to catch.
  //
  // `Eager` is what Button and Badge do — `children()` resolves the slot once in the ambient owner,
  // so the gate reads a memoized accessor and builds nothing. It is NOT a no-op even now: resolving
  // in the ambient owner allocates ahead of the span, so it still keys differently from the raw-prop
  // forms. So `children()` cannot simply be deleted on the strength of the upstream fix — the rule
  // it also serves (a component-valued prop read more than once is *constructed* more than once)
  // stands on its own, and any removal owes its own hydration round-trip. Full decision procedure:
  // `__internal__/solid-2.0-notes.md`.

  const Icon = (): JSX.Element => <svg data-icon="1" />;

  // The failing idiom: the prop is read in the `when` gate AND the body.
  const WhenGateAndBody = (props: { icon?: JSX.Element }): JSX.Element => (
    <Show when={props.icon != null}>
      <span data-slot="s">{props.icon}</span>
    </Show>
  );
  // The control: same <Show>, but it gates on an unrelated flag, so the prop is read exactly once
  // and in the body only. This shape hydrates cleanly — proof the <Show> itself is not the cause.
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

  it("keys the body <svg> identically whether or not the prop is also read in the `when` gate", async () => {
    const whenGateAndBody = await renderToStream(() => <WhenGateAndBody icon={<Icon />} />);
    const bodyOnly = await renderToStream(() => <BodyOnly icon={<Icon />} show={true} />);
    const eager = await renderToStream(() => <Eager icon={<Icon />} />);

    for (const html of [whenGateAndBody, bodyOnly, eager]) {
      expect(html).toMatch(/<span _hk=\S+ data-slot="s"><svg _hk=\S+ data-icon="1">/);
    }

    const svgKey = (html: string) => html.match(/<svg _hk=(\S+) /)?.[1];

    // Both sit inside a <Show> and differ only in the extra `when`-gate read, so any difference
    // between these two keys IS the drift. Equal means the built-then-discarded gate component
    // consumed no id — the beta.32 fix. This assertion failing means it regressed.
    expect(svgKey(whenGateAndBody)).toBeDefined();
    expect(svgKey(bodyOnly)).toBeDefined();
    expect(svgKey(whenGateAndBody)).toBe(svgKey(bodyOnly));

    // `children()` still relocates the key — it allocates the component in the ambient owner, ahead
    // of the span, so it keys differently from either raw-prop form. Removing it is therefore a real
    // structural change, not a cleanup the upstream fix makes free.
    expect(svgKey(eager)).toBeDefined();
    expect(svgKey(eager)).not.toBe(svgKey(whenGateAndBody));
  });
});
