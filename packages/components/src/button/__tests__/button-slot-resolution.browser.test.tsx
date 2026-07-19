import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { Button } from "../button";

// Regression: every Button slot whose content can be a **component** is resolved once via `children()`
// in the body, and every read site uses the memoized accessor — never the raw prop. A JSX-element
// prop compiles to a lazy getter that runs `createComponent` on *every* read, so a prop read in more
// than one place within a single render would construct the component multiple times and discard the
// extras. `loadingText` is the sharp case: it is read three ways in one render — the loader-placement
// decision, the label gate, and the label render — so a raw `merged.loadingText` at each site would
// build it three times. These tests count real constructions; re-introducing a raw read pushes the
// count above 1 and fails here. (A component slot is still legitimately re-created when it unmounts
// and remounts — e.g. `loadingText` across a loading on/off/on cycle — which is Solid's normal
// conditional-render model and not what this guards.) See button.tsx's slot-resolution comment.

function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

describe("Button slot resolution — single creation", () => {
  it("constructs a component loadingText once despite its three read sites", () => {
    let creations = 0;
    const Marker = (): JSX.Element => {
      creations++;
      return <svg data-testid="lt-marker" />;
    };

    // `loading` is true from mount, so this one render exercises all three loadingText reads at once
    // (placement + gate + render). One memoized resolution → one construction (was three pre-fix).
    const { dispose } = mount(() => (
      <Themed>
        <Button loading loadingText={<Marker />}>
          Save
        </Button>
      </Themed>
    ));

    expect(creations).toBe(1);
    dispose();
  });

  it("constructs a component label child once and reuses it across loading toggles", () => {
    let creations = 0;
    const Marker = (): JSX.Element => {
      creations++;
      return <svg data-testid="label-marker" />;
    };
    const [loading, setLoading] = createSignal(false);

    // The label stays mounted the whole time (no loadingText, so the label branch always wins), so a
    // memoized resolution is reused across toggles rather than rebuilt on each `isLoading()` re-run.
    const { dispose } = mount(() => (
      <Themed>
        <Button loading={loading()}>
          <Marker />
        </Button>
      </Themed>
    ));

    flush(() => setLoading(true));
    flush(() => setLoading(false));

    expect(creations).toBe(1);
    dispose();
  });

  it("has no accessibility violations", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Button loading loadingText="Saving…" aria-label="Save">
          Save
        </Button>
      </Themed>
    ));
    await expectNoA11yViolations(container);
    dispose();
  });
});
