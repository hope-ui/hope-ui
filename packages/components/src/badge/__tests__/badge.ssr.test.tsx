import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Badge } from "../badge";
import { Tree } from "./badge.ssr-entry";

// Badge reads its styling from the theme, so every render — server and client alike — needs a
// `<ThemeProvider>`. It emits no DOM, but it does occupy a position in the tree, and Solid matches
// server and client nodes by position, so it must wrap identically on both sides. Enforced by
// construction: this file and `badge.browser.test.tsx` import the same `Tree`.

describe("Badge SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Badge>New</Badge>
      </ThemeProvider>
    ));
    expect(typeof html).toBe("string");
  });

  it("paints the recipe classes into the server output", async () => {
    // Turning props into classes is a pure function of those props, so the server emits exactly what
    // the client would — which is the whole of theming's SSR requirement.
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Badge variant="solid" colorScheme="danger">
          Error
        </Badge>
      </ThemeProvider>
    ));
    expect(html).toContain("bg-danger");
    expect(html).toContain("text-on-danger");
    expect(html).toContain('data-slot="badge-label"');
  });

  it("renders the role dot on its own slot for the dot variant", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Badge variant="dot" colorScheme="success">
          Online
        </Badge>
      </ThemeProvider>
    ));
    expect(html).toContain('data-slot="badge-dot"');
    // The role color rides the dot; the badge itself stays neutral.
    expect(html).toContain("bg-success");
    expect(html).toContain("border-neutral-subtle-line");
  });

  it("renders the decorator slots when supplied", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Badge startDecorator={<span>+</span>} endDecorator={<span>-</span>}>
          Label
        </Badge>
      </ThemeProvider>
    ));
    expect(html).toContain('data-slot="badge-start-decorator"');
    expect(html).toContain('data-slot="badge-end-decorator"');
  });

  it("matches its server output byte for byte", async () => {
    // Only the `ssr` project can produce this: it is the one place `solid-js` *and* `@solidjs/web`
    // both resolve to their server builds, which is what makes the `_hk` attributes — the position
    // keys `hydrate()` matches server nodes on — real. Byte-exact on purpose: matching happens on
    // those keys, so "contains the right text" would not catch a shifted tree.
    //
    // Inline rather than a committed `.html`, so a hydration subject costs zero fixture files. The
    // bridge renders this same `<Tree />` fresh for the browser test, so the two cannot drift.
    // Regenerate deliberately with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<span _hk=00j0 class="inline-flex items-center justify-center whitespace-nowrap align-middle font-medium select-none border h-5 gap-1 px-2 text-xs has-data-[slot=badge-start-decorator]:ps-1.5 has-data-[slot=badge-end-decorator]:pe-1.5 rounded-md bg-primary-soft text-primary-emphasis border-primary-soft" data-slot="badge" ><span _hk=00e0 data-slot="badge-label" class="inline-flex items-center">New</span></span>"`,
    );
  });
});
