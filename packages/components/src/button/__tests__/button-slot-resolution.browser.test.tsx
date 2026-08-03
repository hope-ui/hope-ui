import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { Button } from "../button";

// Regression: a JSX-valued prop compiles to a lazy getter that runs `createComponent` on *every*
// read, so a prop read from several places in one render builds the component several times and
// throws the extras away. Button resolves each such prop once with `children()` and reads only the
// memoized accessor. `loadingText` is the sharp case — three reads in a single render (the loader
// placement decision, the label gate, the label itself). These tests count real constructions, so
// re-introducing a raw read pushes the count above one and fails here.
//
// Re-creation on unmount/remount is normal conditional rendering, not what this guards.

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

    // `loading` is true from mount, so a single render hits all three read sites at once. Before the
    // fix this constructed the marker three times.
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

    // With no `loadingText`, the label branch always wins, so the label never unmounts — the
    // memoized node must be reused across toggles rather than rebuilt each time `loading` flips.
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
