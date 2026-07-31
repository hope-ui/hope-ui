import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { ComboboxInputHarness, FRUITS, listOf, statusOf, toggleOf } from "./combobox-harness";

// `createComboboxStatus` reports how many options the current filter left, both **shown** and
// **announced**. Filtering is the one thing a combobox does that a screen reader cannot observe:
// focus does not move, the input's text is the user's own, and the list silently gets shorter.

function mountStatus(tree: () => ReturnType<typeof ComboboxInputHarness>) {
  const mounted = mount(tree);
  onTestFinished(mounted.dispose);
  return mounted;
}

/** The live regions `createAnnounce` builds on `document.body`, outside any mount container. */
function announcedOutside(container: Element): string {
  return [...document.querySelectorAll("[aria-live]")]
    .filter((node) => !container.contains(node))
    .map((node) => node.textContent ?? "")
    .join(" ");
}

describe("createComboboxStatus", () => {
  it("is a polite, atomic live region reporting the option count", async () => {
    const { container, dispose } = mountStatus(() => (
      <ComboboxInputHarness values={FRUITS} withStatus options={{ defaultOpen: true }} />
    ));
    await vi.waitFor(() => expect(listOf(container)).not.toBeNull());

    const status = statusOf(container) as HTMLElement;
    expect(status.getAttribute("role")).toBe("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.getAttribute("aria-atomic")).toBe("true");
    expect(status.textContent).toBe("5 options available");

    // Axe returns `aria-valid-attr-value` as *incomplete* for any element carrying both
    // `aria-haspopup` and `aria-controls`, without ever resolving the IDREF
    // (`ariaValidAttrValueEvaluate`'s `controlsWithinPopup` pre-check) — undecidable by
    // construction, not a markup problem. The chevron carries exactly that pair while open, and the
    // IDREF itself is pinned in `combobox-toggle.browser.test.tsx`.
    await expectNoA11yViolations(container, { allowIncomplete: ["aria-valid-attr-value"] });
    dispose();
  });

  it("counts what the kernel was handed, so a filtered set needs no seam here", async () => {
    // The hook reads `state.list.focus.items().length`. Combobox hands the kernel the *filtered*
    // array, so this reports the filtered count without ever learning a filter exists — which is
    // what keeps the kernel free of one.
    const { container } = mountStatus(() => (
      <ComboboxInputHarness
        values={[FRUITS[0] as string, FRUITS[1] as string]}
        withStatus
        options={{ defaultOpen: true }}
      />
    ));
    await vi.waitFor(() => expect(statusOf(container)?.textContent).toBe("2 options available"));
  });

  it("uses the singular for one option", async () => {
    const { container } = mountStatus(() => (
      <ComboboxInputHarness
        values={[FRUITS[0] as string]}
        withStatus
        options={{ defaultOpen: true }}
      />
    ));
    await vi.waitFor(() => expect(statusOf(container)?.textContent).toBe("1 option available"));
  });

  it("announces through a body-level region when the popup opens", async () => {
    const { container } = mountStatus(() => <ComboboxInputHarness values={FRUITS} withStatus />);

    await userEvent.click(toggleOf(container));
    await vi.waitFor(() => expect(listOf(container)).not.toBeNull());

    // The rendered region above mounts *with* its text, and a live region only announces a change
    // its assistive technology was already watching — so the open frame is the one moment it cannot
    // cover. `createAnnounce`'s region lives on `document.body` and outlives every popup.
    await vi.waitFor(() => expect(announcedOutside(container)).toContain("5 options available"));
  });

  it("does not re-announce imperatively when the count changes", async () => {
    // The two channels are split by moment and must not overlap: a later count change is announced
    // by the rendered region itself (it has been mounted since the open), so reaching for
    // `createAnnounce` again would read the number twice.
    const values = [FRUITS[0] as string, FRUITS[1] as string, FRUITS[2] as string];
    const { container } = mountStatus(() => (
      <ComboboxInputHarness values={values} withStatus options={{ defaultOpen: true }} />
    ));
    await vi.waitFor(() => expect(statusOf(container)?.textContent).toBe("3 options available"));
    await vi.waitFor(() => expect(announcedOutside(container)).toContain("3 options available"));

    const announcedAfterOpen = announcedOutside(container);
    // Nothing else fires it while the popup stays open — the region's own text is the channel.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(announcedOutside(container)).toBe(announcedAfterOpen);
  });

  it("forwards a consumer's props and keeps the three live-region attributes", async () => {
    const { container } = mountStatus(() => (
      <ComboboxInputHarness values={FRUITS} withStatus options={{ defaultOpen: true }} />
    ));
    await vi.waitFor(() => expect(statusOf(container)).not.toBeNull());

    const status = statusOf(container) as HTMLElement;
    // `role`/`aria-live`/`aria-atomic` are merged after the consumer's props on purpose: this element
    // *is* the live region, and overriding any of them silently turns the announcement off.
    expect(status.getAttribute("data-testid")).toBe("status");
    expect(status.getAttribute("role")).toBe("status");
  });
});
