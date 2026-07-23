import { renderToStringAsync } from "@solidjs/web";
import { createMachine } from "@zag-js/core";
import { describe, expect, it, vi } from "vitest";
import { useMachine } from "../machine";

/**
 * Not required by the Definition of Done — the SSR round-trip is the *components* set, and this
 * folder ships no DOM. It is here because everything that makes `useMachine` client-only is gated
 * behind `onSettled`, and "the gate holds" is exactly the claim a server render can falsify:
 * anything that leaked into the render body would throw here, or serialize a state the client
 * would then disagree with.
 */
describe("useMachine under renderToStringAsync", () => {
  it("renders the initial state without starting the machine", async () => {
    const entry = vi.fn();
    const effect = vi.fn();

    const machine = createMachine<any>({
      initialState: () => "idle",
      entry: ["onEntry"],
      effects: ["rootEffect"],
      states: { idle: { on: { NEXT: { target: "done" } } }, done: {} },
      implementations: { actions: { onEntry: entry }, effects: { rootEffect: effect } },
    });

    const html = await renderToStringAsync(() => {
      const service = useMachine<any>(machine);
      return <span data-state={String(service.state.get())}>{String(service.state.get())}</span>;
    });

    expect(html).toContain('data-state="idle"');
    // `onSettled` never runs on the server, so the machine is still NotStarted: no entry action,
    // no effect, nothing scheduled that the client would then have to reconcile.
    expect(entry).not.toHaveBeenCalled();
    expect(effect).not.toHaveBeenCalled();
  });

  it("serializes context read through a bindable", async () => {
    const machine = createMachine<any>({
      props: () => ({ value: "seed" }),
      initialState: () => "idle",
      context: ({ bindable, prop }) => ({
        value: bindable(() => ({ defaultValue: prop("value") })),
      }),
      states: { idle: {} },
    });

    const html = await renderToStringAsync(() => {
      const service = useMachine<any>(machine, { value: "seed" });
      return <span>{String(service.context.get("value"))}</span>;
    });

    expect(html).toContain("seed");
  });
});
