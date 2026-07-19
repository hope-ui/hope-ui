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
 * See `docs/testing.md` and `docs/migration-2.0-stable.md` §2.
 */

describe("@solidjs/web server-build contract", () => {
  it("renders a host element through Dynamic, with a hydration key", async () => {
    // Depended on by: `renderElement` (packages/primitives/src/utils/render/render.tsx), the
    // `as`/render-prop polymorphism helper. Everything it renders goes through `<Dynamic>`, and
    // server-side `dynamic()` calls `ssrElement(component, props, undefined, true)` — the
    // trailing `true` is what emits the `_hk` hydration key those elements hydrate against. If
    // stable drops the key, elements rendered through `renderElement` stop hydrating. See
    // docs/migration-2.0-stable.md §3.
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

describe("solid-js server-build contract: component inside <Show> and the children() realignment", () => {
  // Depended on by: `@hope-ui/components` Button and Badge slot rendering
  // (packages/components/src/{button,badge}/*.tsx). This pins the upstream behavior behind the
  // long-standing "component inside a <Show> breaks hydration" bug (solidjs/solid#2384,
  // solidjs/solid-start#1089), still present in the 2.0 beta line.
  //
  // A component passed as a prop and read inside a <Show>-gated element is created LAZILY: the
  // consumer's `x={<Icon/>}` compiles to a getter that runs `createComponent(Icon)` where the prop
  // is *read* — inside the <Show>'s reactive `insert`. On the SERVER, `createComponent(Comp) ===
  // Comp()` with no owner, so the component's root element allocates its hydration key from the
  // ambient owner. On the CLIENT (dev build) `createComponent` wraps `Comp` in a transparent
  // `createRoot`, and the client <Show> nests children under memo/insert-effect owners the server
  // <Show> does not — so the component's `_hk` comes out one off and `hydrate()` claims the wrong
  // node. A *directly-written* child element (`<span><Icon/></span>`) escapes this because it is
  // created eagerly during the span's construction, in the ambient owner — matching the server.
  //
  // Solid's `children()` helper is the fix Button/Badge use: it resolves the slot's content once,
  // eagerly, in the component body (like a direct child) and memoizes it, so the component's key is
  // allocated in the ambient owner and hydration realigns. These pins characterize the *server*
  // half — that `createComponent` keys the component's root inside a <Show>, and that resolving the
  // same content through `children()` changes where that key is allocated. They fail if a future
  // solid changes `createComponent`'s owner treatment (i.e. the day the upstream bug is fixed and
  // the `children()` indirection can be dropped).

  const Icon = (): JSX.Element => <svg data-icon="1" />;

  // A component passed as a prop and read inside a <Show>, the two ways it can be rendered.
  const Lazy = (props: { icon?: JSX.Element }): JSX.Element => (
    <Show when={props.icon != null}>
      <span data-slot="s">{props.icon}</span>
    </Show>
  );
  const Eager = (props: { icon?: JSX.Element }): JSX.Element => {
    const icon = children(() => props.icon);
    return (
      <Show when={icon() != null}>
        <span data-slot="s">{icon()}</span>
      </Show>
    );
  };

  it("keys the component's root <svg> inside a <Show> both ways, but at a different position", async () => {
    const lazy = await renderToStringAsync(() => <Lazy icon={<Icon />} />);
    const eager = await renderToStringAsync(() => <Eager icon={<Icon />} />);

    // Same rendered structure: a keyed decorator span wrapping the component's keyed root <svg>.
    for (const html of [lazy, eager]) {
      expect(html).toMatch(/<span _hk=\S+ data-slot="s"><svg _hk=\S+ data-icon="1">/);
    }

    // The pin: the svg (component root) carries its own `_hk` in both forms — `createComponent`
    // keys the root even nested in a <Show> — yet the eager `children()` form allocates that key at
    // a different position than the lazy prop-insert form. That relocation (into the ambient owner,
    // ahead of the span) is exactly what lets the eager form hydrate where the lazy one cannot.
    const svgKey = (html: string) => html.match(/<svg _hk=(\S+) /)?.[1];
    expect(svgKey(lazy)).toBeDefined();
    expect(svgKey(eager)).toBeDefined();
    expect(svgKey(eager)).not.toBe(svgKey(lazy));
  });
});
