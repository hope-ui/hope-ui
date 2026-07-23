import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createGuards, createMachine, type Machine, type Service } from "@zag-js/core";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMachine } from "../machine";

/**
 * Ported from `@zag-js/solid`'s `tests/machine.test.ts` and `tests/nested-states.test.ts`, with
 * upstream's `@solidjs/testing-library` `renderHook` replaced by hope-ui's `mount()`. That is not
 * cosmetic: `useMachine` starts the machine in `onSettled` and tears it down in `onCleanup`, so it
 * needs a real mounted owner — and `mount()` additionally fails the test on any
 * `STRICT_READ_UNTRACKED` / `REACTIVE_WRITE_IN_OWNED_SCOPE` diagnostic, which is the cheapest
 * possible check that the port did not smuggle an untracked read into a render body.
 */

interface RenderedMachine {
  service: Service<any>;
  container: HTMLElement;
  send: (event: any) => Promise<void>;
  advanceTime: (ms: number) => Promise<void>;
  cleanup: () => void;
}

const live = new Set<() => void>();

afterEach(() => {
  for (const dispose of live) {
    dispose();
  }
  live.clear();
});

function renderMachine(machine: any, props?: any): RenderedMachine {
  let service!: Service<any>;

  const { container, dispose } = mount(() => {
    service = useMachine<any>(machine, props);
    return <output>{String(service.state.get())}</output>;
  });

  live.add(dispose);
  // Let `onSettled` start the machine, the way upstream's `await Promise.resolve()` after
  // `renderHook` does.
  flush();

  return {
    service,
    container,
    async send(event: any) {
      service.send(event);
      await Promise.resolve();
    },
    async advanceTime(ms: number) {
      await vi.advanceTimersByTimeAsync(ms);
    },
    cleanup() {
      live.delete(dispose);
      dispose();
    },
  };
}

describe("useMachine", () => {
  it("renders an accessible tree", async () => {
    const machine = createMachine<any>({
      initialState: () => "idle",
      states: { idle: {} },
    });

    const { container } = renderMachine(machine);

    await expectNoA11yViolations(container);
  });

  it("starts in the initial state", () => {
    const machine = createMachine<any>({
      initialState: () => "foo",
      states: {
        foo: { on: { NEXT: { target: "bar" } } },
        bar: {},
      },
    });

    expect(renderMachine(machine).service.state.get()).toBe("foo");
  });

  it("runs root and state entry actions on start", () => {
    const fooEntry = vi.fn();
    const rootEntry = vi.fn();

    const machine = createMachine<any>({
      initialState: () => "foo",
      entry: ["rootEntry"],
      states: { foo: { entry: ["fooEntry"] } },
      implementations: { actions: { fooEntry, rootEntry } },
    });

    renderMachine(machine);

    expect(fooEntry).toHaveBeenCalledOnce();
    expect(rootEntry).toHaveBeenCalledOnce();
  });

  it("exposes context seeded from bindables", () => {
    const machine = createMachine<any>({
      initialState: () => "test",
      context: ({ bindable }) => ({
        foo: bindable(() => ({ defaultValue: "bar" })),
      }),
      states: { test: {} },
    });

    const { service } = renderMachine(machine);

    expect(service.state.get()).toBe("test");
    expect(service.context.get("foo")).toBe("bar");
  });

  it("transitions on a sent event and runs the target's entry action", async () => {
    const done = vi.fn();
    const machine = createMachine<any>({
      initialState: () => "test",
      states: {
        test: { on: { CHANGE: { target: "success" } } },
        success: { entry: ["done"] },
      },
      implementations: { actions: { done } },
    });

    const { send } = renderMachine(machine);
    await send({ type: "CHANGE" });

    expect(done).toHaveBeenCalledOnce();
  });

  it("answers hasTag() for the current state", async () => {
    const machine = createMachine<any>({
      initialState: () => "green",
      states: {
        green: { tags: ["go"], on: { TIMER: { target: "yellow" } } },
        yellow: { tags: ["go"], on: { TIMER: { target: "red" } } },
        red: { tags: ["stop"] },
      },
    });

    const { service, send } = renderMachine(machine);
    expect(service.state.hasTag("go")).toBe(true);

    await send({ type: "TIMER" });
    expect(service.state.get()).toBe("yellow");
    expect(service.state.hasTag("go")).toBe(true);

    await send({ type: "TIMER" });
    expect(service.state.get()).toBe("red");
    expect(service.state.hasTag("go")).toBe(false);
  });

  it("answers matches() for one or many candidate states", async () => {
    const machine = createMachine<any>({
      initialState: () => "idle",
      states: {
        idle: { on: { START: { target: "loading" } } },
        loading: { on: { SUCCESS: { target: "success" } } },
        success: {},
      },
    });

    const { service, send } = renderMachine(machine);
    expect(service.state.matches("idle")).toBe(true);
    expect(service.state.matches("idle", "loading")).toBe(true);
    expect(service.state.matches("loading", "success")).toBe(false);

    await send({ type: "START" });
    expect(service.state.matches("loading")).toBe(true);

    await send({ type: "SUCCESS" });
    expect(service.state.matches("success")).toBe(true);
    expect(service.state.matches("idle", "loading")).toBe(false);
  });

  it("runs exit, transition and entry actions in that order", async () => {
    const order: string[] = [];
    const record = (key: string) => () => {
      order.push(key);
    };

    const machine = createMachine<any>({
      initialState: () => "test",
      states: {
        test: {
          exit: ["exit1"],
          on: { NEXT: { target: "success", actions: ["nextActions"] } },
        },
        success: { entry: ["entry2"] },
      },
      implementations: {
        actions: {
          nextActions: record("transition"),
          exit1: record("exit1"),
          entry2: record("entry2"),
        },
      },
    });

    const { send } = renderMachine(machine);
    await send({ type: "NEXT" });

    expect(order).toEqual(["exit1", "transition", "entry2"]);
  });

  it("keeps multi-action transition order deterministic", async () => {
    const order: string[] = [];
    const record = (key: string) => () => {
      order.push(key);
    };

    const machine = createMachine<any>({
      initialState: () => "idle",
      states: {
        idle: {
          exit: ["onExit"],
          on: { NEXT: { target: "done", actions: ["a1", "a2", "a3"] } },
        },
        done: { entry: ["onEntry"] },
      },
      implementations: {
        actions: {
          onExit: record("exit"),
          a1: record("a1"),
          a2: record("a2"),
          a3: record("a3"),
          onEntry: record("entry"),
        },
      },
    });

    const { send } = renderMachine(machine);
    await send({ type: "NEXT" });

    expect(order).toEqual(["exit", "a1", "a2", "a3", "entry"]);
  });

  it("recomputes computed values from context", async () => {
    const machine = createMachine<any>({
      initialState: () => "test",
      states: { test: { on: { UPDATE: { actions: ["setValue"] } } } },
      context: ({ bindable }) => ({
        value: bindable(() => ({ defaultValue: "bar" })),
      }),
      computed: { length: ({ context }) => context.get("value").length },
      implementations: {
        actions: { setValue: ({ context }) => context.set("value", "hello") },
      },
    });

    const { service, send } = renderMachine(machine);
    expect(service.computed("length")).toBe(3);

    await send({ type: "UPDATE" });
    expect(service.computed("length")).toBe(5);
  });

  it("runs a watch() track only when the tracked value actually changes", async () => {
    const notify = vi.fn();
    const machine = createMachine<any>({
      initialState: () => "test",
      states: { test: { on: { UPDATE: { actions: ["setValue"] } } } },
      context: ({ bindable }) => ({
        value: bindable(() => ({ defaultValue: "bar" })),
      }),
      watch({ track, context, action }) {
        track([() => context.get("value")], () => action(["notify"]));
      },
      implementations: {
        actions: {
          setValue: ({ context }) => context.set("value", "hello"),
          notify,
        },
      },
    });

    const { send } = renderMachine(machine);

    await send({ type: "UPDATE" });
    await send({ type: "UPDATE" });

    expect(notify).toHaveBeenCalledOnce();
  });

  it("blocks a transition whose guard fails", async () => {
    const machine = createMachine<any>({
      props: () => ({ max: 1 }),
      initialState: () => "test",
      context: ({ bindable }) => ({
        count: bindable(() => ({ defaultValue: 0 })),
      }),
      states: {
        test: {
          on: { INCREMENT: { guard: "isBelowMax", actions: ["increment"] } },
        },
      },
      implementations: {
        guards: {
          isBelowMax: ({ prop, context }) => prop("max") > context.get("count"),
        },
        actions: {
          increment: ({ context }) => context.set("count", context.get("count") + 1),
        },
      },
    });

    const { service, send } = renderMachine(machine);

    await send({ type: "INCREMENT" });
    expect(service.context.get("count")).toBe(1);

    await send({ type: "INCREMENT" });
    expect(service.context.get("count")).toBe(1);
  });

  it("composes guards with and()", async () => {
    const { and } = createGuards<any>();
    const machine = createMachine<any>({
      props: () => ({ max: 3, min: 1 }),
      initialState: () => "test",
      context: ({ bindable }) => ({
        count: bindable(() => ({ defaultValue: 0 })),
      }),
      states: {
        test: {
          on: {
            INCREMENT: {
              guard: and("isBelowMax", "isAboveMin"),
              actions: ["increment"],
            },
            "COUNT.SET": { actions: ["setValue"] },
          },
        },
      },
      implementations: {
        guards: {
          isBelowMax: ({ prop, context }) => prop("max") > context.get("count"),
          isAboveMin: ({ prop, context }) => prop("min") < context.get("count"),
        },
        actions: {
          increment: ({ context }) => context.set("count", context.get("count") + 1),
          setValue: ({ context, event }) => context.set("count", event.value),
        },
      },
    });

    const { service, send } = renderMachine(machine);

    await send({ type: "INCREMENT" });
    expect(service.context.get("count")).toBe(0);

    await send({ type: "COUNT.SET", value: 2 });
    expect(service.context.get("count")).toBe(2);

    await send({ type: "INCREMENT" });
    expect(service.context.get("count")).toBe(3);
  });

  it("falls through to the next transition when the first guard fails", async () => {
    const blocked = vi.fn();
    const allowed = vi.fn();

    const machine = createMachine<any>({
      initialState: () => "idle",
      states: {
        idle: {
          on: {
            NEXT: [
              {
                guard: "allowBlocked",
                target: "blocked",
                actions: ["onBlocked"],
              },
              { target: "allowed", actions: ["onAllowed"] },
            ],
          },
        },
        blocked: {},
        allowed: {},
      },
      implementations: {
        guards: { allowBlocked: () => false },
        actions: { onBlocked: blocked, onAllowed: allowed },
      },
    });

    const { service, send } = renderMachine(machine);
    await send({ type: "NEXT" });

    expect(service.state.get()).toBe("allowed");
    expect(allowed).toHaveBeenCalledOnce();
    expect(blocked).not.toHaveBeenCalled();
  });

  it("does nothing when every guard fails", async () => {
    const attempt = vi.fn();
    const machine = createMachine<any>({
      initialState: () => "idle",
      states: {
        idle: {
          on: {
            NEXT: [
              { guard: "g1", target: "blocked1", actions: ["onAttempt"] },
              { guard: "g2", target: "blocked2", actions: ["onAttempt"] },
            ],
          },
        },
        blocked1: {},
        blocked2: {},
      },
      implementations: {
        guards: { g1: () => false, g2: () => false },
        actions: { onAttempt: attempt },
      },
    });

    const { service, send } = renderMachine(machine);
    await send({ type: "NEXT" });

    expect(service.state.get()).toBe("idle");
    expect(attempt).not.toHaveBeenCalled();
  });

  it("leaves a controlled context value alone", async () => {
    const machine = createMachine<any>({
      props: () => ({ value: "foo", defaultValue: "" }),
      initialState: () => "test",
      context: ({ bindable, prop }) => ({
        value: bindable(() => ({
          defaultValue: prop("defaultValue"),
          value: prop("value"),
        })),
      }),
      states: { test: { on: { "VALUE.SET": { actions: ["setValue"] } } } },
      implementations: {
        actions: {
          setValue: ({ context, event }) => context.set("value", event.value),
        },
      },
    });

    const { service, send } = renderMachine(machine);
    await send({ type: "VALUE.SET", value: "next" });

    expect(service.context.get("value")).toBe("foo");
  });

  it("ignores an unknown event", async () => {
    const known = vi.fn();
    const machine = createMachine<any>({
      initialState: () => "idle",
      states: {
        idle: { on: { KNOWN: { target: "done", actions: ["onKnown"] } } },
        done: {},
      },
      implementations: { actions: { onKnown: known } },
    });

    const { service, send } = renderMachine(machine);

    await send({ type: "UNKNOWN" });
    expect(service.state.get()).toBe("idle");
    expect(known).not.toHaveBeenCalled();

    await send({ type: "KNOWN" });
    expect(service.state.get()).toBe("done");
    expect(known).toHaveBeenCalledOnce();
  });

  it("runs an internal transition's actions without re-entering the state", async () => {
    const onEntry = vi.fn();
    const onInternal = vi.fn();

    const machine = createMachine<any>({
      initialState: () => "active",
      states: {
        active: {
          entry: ["onEntry"],
          on: { INTERNAL: { actions: ["onInternal"] } },
        },
      },
      implementations: { actions: { onEntry, onInternal } },
    });

    const { service, send } = renderMachine(machine);
    await send({ type: "INTERNAL" });

    expect(service.state.get()).toBe("active");
    expect(onInternal).toHaveBeenCalledOnce();
    expect(onEntry).toHaveBeenCalledOnce();
  });

  it("re-runs entry actions for a reenter transition, in exit → transition → entry order", async () => {
    const order: string[] = [];
    const machine = createMachine<any>({
      initialState: () => "active",
      states: {
        active: {
          entry: ["onEntry"],
          exit: ["onExit"],
          on: {
            REENTER: {
              target: "active",
              reenter: true,
              actions: ["onTransition"],
            },
          },
        },
      },
      implementations: {
        actions: {
          onEntry: () => order.push("entry"),
          onExit: () => order.push("exit"),
          onTransition: () => order.push("transition"),
        },
      },
    });

    const { send } = renderMachine(machine);
    expect(order).toEqual(["entry"]);
    order.length = 0;

    await send({ type: "REENTER" });

    expect(order).toEqual(["exit", "transition", "entry"]);
  });

  it("reenters without an explicit target", async () => {
    const order: string[] = [];
    const machine = createMachine<any>({
      initialState: () => "active",
      states: {
        active: {
          entry: ["onEntry"],
          exit: ["onExit"],
          on: { REENTER: { reenter: true, actions: ["onTransition"] } },
        },
      },
      implementations: {
        actions: {
          onEntry: () => order.push("entry"),
          onExit: () => order.push("exit"),
          onTransition: () => order.push("transition"),
        },
      },
    });

    const { send } = renderMachine(machine);
    order.length = 0;

    await send({ type: "REENTER" });

    expect(order).toEqual(["exit", "transition", "entry"]);
  });

  it("keeps a same-state transition from re-running entry", async () => {
    const onPing = vi.fn();
    const onEntry = vi.fn();

    const machine = createMachine<any>({
      initialState: () => "active",
      states: {
        active: {
          entry: ["onEntry"],
          on: { PING: { target: "active", actions: ["onPing"] } },
        },
      },
      implementations: { actions: { onEntry, onPing } },
    });

    const { service, send } = renderMachine(machine);
    expect(onEntry).toHaveBeenCalledOnce();

    await send({ type: "PING" });
    await send({ type: "PING" });

    expect(service.state.get()).toBe("active");
    expect(onPing).toHaveBeenCalledTimes(2);
    expect(onEntry).toHaveBeenCalledOnce();
  });

  it("runs a state effect and cleans it up on exit", async () => {
    vi.useFakeTimers();
    const cleanup = vi.fn();

    const machine = createMachine<any>({
      initialState: () => "test",
      states: {
        test: { effects: ["waitForMs"], on: { DONE: { target: "success" } } },
        success: {},
      },
      implementations: {
        effects: {
          waitForMs({ send }) {
            const id = setTimeout(() => send({ type: "DONE" }), 1000);
            return () => {
              cleanup();
              clearTimeout(id);
            };
          },
        },
      },
    });

    const { service, send, advanceTime } = renderMachine(machine);

    await send({ type: "START" });
    expect(service.state.get()).toBe("test");

    await advanceTime(1000);
    expect(service.state.get()).toBe("success");
    expect(cleanup).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });

  it("keeps effect setup and cleanup balanced across state churn", async () => {
    const setup = vi.fn();
    const cleanup = vi.fn();

    const machine = createMachine<any>({
      initialState: () => "on",
      states: {
        on: { effects: ["trackOn"], on: { TOGGLE: { target: "off" } } },
        off: { on: { TOGGLE: { target: "on" } } },
      },
      implementations: {
        effects: {
          trackOn() {
            setup();
            return cleanup;
          },
        },
      },
    });

    const rendered = renderMachine(machine);
    for (let i = 0; i < 6; i++) {
      await rendered.send({ type: "TOGGLE" });
    }
    rendered.cleanup();

    expect(setup.mock.calls.length).toBeGreaterThan(0);
    expect(cleanup).toHaveBeenCalledTimes(setup.mock.calls.length);
  });

  it("restarts a state's effects exactly once per reenter", async () => {
    const setup = vi.fn();
    const cleanup = vi.fn();

    const machine = createMachine<any>({
      initialState: () => "active",
      states: {
        active: {
          effects: ["trackEffect"],
          on: { REENTER: { target: "active", reenter: true } },
        },
      },
      implementations: {
        effects: {
          trackEffect() {
            setup();
            return cleanup;
          },
        },
      },
    });

    const rendered = renderMachine(machine);
    expect(setup).toHaveBeenCalledOnce();
    expect(cleanup).not.toHaveBeenCalled();

    await rendered.send({ type: "REENTER" });
    expect(setup).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledOnce();

    await rendered.send({ type: "REENTER" });
    expect(setup).toHaveBeenCalledTimes(3);
    expect(cleanup).toHaveBeenCalledTimes(2);

    rendered.cleanup();
    expect(cleanup).toHaveBeenCalledTimes(3);
  });

  it("runs root exit actions and effect cleanups on unmount", () => {
    const rootExit = vi.fn();
    const stateExit = vi.fn();
    const effectCleanup = vi.fn();

    const machine = createMachine<any>({
      initialState: () => "mounted",
      exit: ["onMachineExit"],
      effects: ["rootEffect"],
      states: { mounted: { exit: ["onStateExit"] } },
      implementations: {
        actions: { onMachineExit: rootExit, onStateExit: stateExit },
        effects: { rootEffect: () => effectCleanup },
      },
    });

    const rendered = renderMachine(machine);
    expect(rootExit).not.toHaveBeenCalled();
    expect(effectCleanup).not.toHaveBeenCalled();

    rendered.cleanup();

    expect(rootExit).toHaveBeenCalledOnce();
    expect(effectCleanup).toHaveBeenCalledOnce();
    // The machine's root `exit` runs; the *state*'s exit does not — teardown is not a transition.
    expect(stateExit).not.toHaveBeenCalled();
  });

  it("ignores events sent after cleanup", async () => {
    const onNext = vi.fn();
    const machine = createMachine<any>({
      initialState: () => "idle",
      states: {
        idle: { on: { NEXT: { target: "done", actions: ["onNext"] } } },
        done: {},
      },
      implementations: { actions: { onNext } },
    });

    const rendered = renderMachine(machine);
    rendered.cleanup();

    rendered.service.send({ type: "NEXT" });
    await Promise.resolve();

    expect(rendered.service.state.get()).toBe("idle");
    expect(onNext).not.toHaveBeenCalled();
  });

  it("tracks the current and previous event", async () => {
    let current: any = null;
    let previous: any = null;

    const machine = createMachine<any>({
      initialState: () => "test",
      states: {
        test: { on: { FIRST: { target: "second" } } },
        second: { on: { THIRD: { actions: ["captureEvents"] } } },
      },
      implementations: {
        actions: {
          captureEvents({ event }) {
            previous = event.previous();
            current = event.current();
          },
        },
      },
    });

    const { send } = renderMachine(machine);

    await send({ type: "FIRST", data: "first-data" });
    await send({ type: "THIRD", data: "third-data" });

    expect(current).toMatchObject({ type: "THIRD", data: "third-data" });
    expect(previous).toMatchObject({ type: "FIRST", data: "first-data" });
  });

  it("starts with an empty baseline event", () => {
    let currentType = "unset";
    let previousEvent: any = "unset";

    const machine = createMachine<any>({
      initialState: () => "idle",
      entry: ["capture"],
      states: { idle: {} },
      implementations: {
        actions: {
          capture({ event }) {
            currentType = event.current().type;
            previousEvent = event.previous();
          },
        },
      },
    });

    renderMachine(machine);

    expect(currentType).toBe("");
    expect(previousEvent == null || previousEvent.type === "").toBe(true);
  });

  it("hands each transition action its own event data", async () => {
    const captured: any[] = [];

    const machine = {
      id: "test",
      initial: "idle",
      initialState: () => "idle",
      states: {
        idle: { on: { START: { target: "active", actions: ["capture"] } } },
        active: { on: { STOP: { target: "idle", actions: ["capture"] } } },
      },
      implementations: {
        actions: {
          capture({ event }: any) {
            captured.push(event);
          },
        },
      },
    } as unknown as Machine<any>;

    const { send } = renderMachine(machine);

    await send({ type: "START", value: "test-1" });
    await send({ type: "STOP", value: "test-2" });

    expect(captured).toHaveLength(2);
    expect(captured[0]).toMatchObject({ type: "START", value: "test-1" });
    expect(captured[1]).toMatchObject({ type: "STOP", value: "test-2" });
  });

  it("processes rapid sends in one tick deterministically", async () => {
    // The regression this port has to earn: under Solid 2.0 a signal write is invisible to a
    // plain read until the next flush, so without `flush(() => state.set(target))` in `send`
    // the second event would still transition from "a" and be dropped.
    const seen: string[] = [];
    const machine = createMachine<any>({
      initialState: () => "a",
      states: {
        a: { on: { GO_B: { target: "b", actions: ["record"] } } },
        b: { on: { GO_C: { target: "c", actions: ["record"] } } },
        c: {},
      },
      implementations: {
        actions: {
          record({ event }) {
            seen.push(event.type);
          },
        },
      },
    });

    const { service } = renderMachine(machine);

    service.send({ type: "GO_B" });
    service.send({ type: "GO_C" });
    await Promise.resolve();
    await Promise.resolve();

    expect(service.state.get()).toBe("c");
    expect(seen).toEqual(["GO_B", "GO_C"]);
  });

  it("re-reads props from a Solid signal", async () => {
    const [max, setMax] = createSignal(5);
    const allow = vi.fn();

    const machine = createMachine<any>({
      props: ({ props }) => ({ max: props.max }),
      initialState: () => "test",
      context: ({ bindable }) => ({
        count: bindable(() => ({ defaultValue: 0 })),
      }),
      states: {
        test: {
          on: {
            INCREMENT: { actions: ["increment"] },
            CHECK: {
              guard: ({ prop, context }: any) => context.get("count") < prop("max"),
              actions: ["allowAction"],
            },
          },
        },
      },
      implementations: {
        actions: {
          allowAction: allow,
          increment: ({ context }) => context.set("count", context.get("count") + 1),
        },
      },
    });

    const { send } = renderMachine(machine, () => ({ max: max() }));

    await send({ type: "INCREMENT" });
    await send({ type: "INCREMENT" });
    await send({ type: "INCREMENT" });

    await send({ type: "CHECK" });
    expect(allow).toHaveBeenCalledOnce();

    flush(() => setMax(3));
    await send({ type: "CHECK" });
    expect(allow).toHaveBeenCalledOnce();

    flush(() => setMax(10));
    await send({ type: "CHECK" });
    expect(allow).toHaveBeenCalledTimes(2);
  });
});

describe("useMachine — nested states", () => {
  it("runs nested entry/exit actions across sibling transitions", async () => {
    const order: string[] = [];
    const record = (value: string) => () => order.push(value);

    const machine = createMachine<any>({
      initialState: () => "dialog",
      states: {
        dialog: {
          tags: ["overlay"],
          initial: "closed",
          states: {
            closed: {
              entry: ["enterClosed"],
              exit: ["exitClosed"],
              on: { OPEN: { target: "dialog.open" } },
            },
            open: {
              entry: ["enterOpen"],
              exit: ["exitOpen"],
              on: { CLOSE: { target: "dialog.closed", actions: ["onClose"] } },
            },
          },
          on: { RESET: { target: "dialog.closed" } },
        },
      },
      implementations: {
        actions: {
          enterClosed: record("enter-closed"),
          exitClosed: record("exit-closed"),
          enterOpen: record("enter-open"),
          exitOpen: record("exit-open"),
          onClose: record("transition"),
        },
      },
    });

    const { service, send } = renderMachine(machine);

    expect(service.state.get()).toBe("dialog.closed");
    expect(service.state.matches("dialog")).toBe(true);
    expect(service.state.hasTag("overlay")).toBe(true);

    await send({ type: "OPEN" });
    expect(service.state.get()).toBe("dialog.open");

    await send({ type: "RESET" });
    expect(service.state.get()).toBe("dialog.closed");

    await send({ type: "OPEN" });
    await send({ type: "CLOSE" });

    expect(service.state.get()).toBe("dialog.closed");
    expect(order).toEqual([
      "enter-closed",
      "exit-closed",
      "enter-open",
      "exit-open",
      "enter-closed",
      "exit-closed",
      "enter-open",
      "exit-open",
      "transition",
      "enter-closed",
    ]);
  });

  it("runs effects per nested state", async () => {
    const cleanup = vi.fn();
    const enter = vi.fn();
    const exit = vi.fn();

    const machine = createMachine<any>({
      initialState: () => "dialog",
      states: {
        dialog: {
          initial: "open",
          states: {
            open: {
              effects: ["onEffect"],
              entry: ["onEnter"],
              exit: ["onExit"],
              on: { CLOSE: { target: "dialog.closed" } },
            },
            closed: {},
          },
        },
      },
      implementations: {
        actions: { onEnter: enter, onExit: exit },
        effects: { onEffect: () => cleanup },
      },
    });

    const { service, send } = renderMachine(machine);

    expect(service.state.matches("dialog.open")).toBe(true);
    expect(enter).toHaveBeenCalledOnce();
    expect(cleanup).not.toHaveBeenCalled();

    await send({ type: "CLOSE" });

    expect(service.state.matches("dialog.closed")).toBe(true);
    expect(exit).toHaveBeenCalledOnce();
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it("matches an ancestor state and falls back to its transition", async () => {
    const machine = createMachine<any>({
      initialState: () => "dialog",
      states: {
        dialog: {
          initial: "open",
          on: { ESC: { target: "dialog.closed" } },
          states: { open: {}, closed: {} },
        },
      },
    });

    const { service, send } = renderMachine(machine);
    expect(service.state.matches("dialog")).toBe(true);
    expect(service.state.matches("dialog.open")).toBe(true);

    await send({ type: "ESC" });

    expect(service.state.matches("dialog.closed")).toBe(true);
    expect(service.state.matches("dialog")).toBe(true);
  });

  it("orders exit/enter correctly for a deep sibling transition", async () => {
    const order: string[] = [];
    const record = (value: string) => () => order.push(value);

    const machine = createMachine<any>({
      initialState: () => "root",
      states: {
        root: {
          initial: "left",
          states: {
            left: {
              initial: "leaf1",
              entry: ["enter-left"],
              exit: ["exit-left"],
              states: {
                leaf1: {
                  entry: ["enter-leaf1"],
                  exit: ["exit-leaf1"],
                  on: { NEXT: { target: "root.right.leaf2" } },
                },
              },
            },
            right: {
              initial: "leaf2",
              entry: ["enter-right"],
              states: { leaf2: { entry: ["enter-leaf2"] } },
            },
          },
        },
      },
      implementations: {
        actions: {
          "enter-leaf1": record("enter-leaf1"),
          "exit-leaf1": record("exit-leaf1"),
          "enter-left": record("enter-left"),
          "exit-left": record("exit-left"),
          "enter-right": record("enter-right"),
          "enter-leaf2": record("enter-leaf2"),
        },
      },
    });

    const { send } = renderMachine(machine);
    order.length = 0;

    await send({ type: "NEXT" });

    expect(order).toEqual(["exit-leaf1", "exit-left", "enter-right", "enter-leaf2"]);
  });

  it("resolves relative nested targets from the transition's source state", async () => {
    const machine = createMachine<any>({
      initialState: () => "dialog",
      states: {
        dialog: {
          initial: "open",
          on: { RESET: { target: ".closed" } },
          states: {
            open: {
              initial: "viewing",
              on: { CLOSE: { target: "closed" }, VIEW: { target: ".viewing" } },
              states: {
                viewing: { on: { EDIT: { target: "editing" } } },
                editing: { on: {} },
              },
            },
            closed: { on: { REOPEN: { target: "open" } } },
          },
        },
      },
    });

    const { service, send } = renderMachine(machine);
    expect(service.state.get()).toBe("dialog.open.viewing");

    await send({ type: "EDIT" });
    expect(service.state.get()).toBe("dialog.open.editing");

    await send({ type: "VIEW" });
    expect(service.state.get()).toBe("dialog.open.viewing");

    await send({ type: "CLOSE" });
    expect(service.state.get()).toBe("dialog.closed");

    await send({ type: "REOPEN" });
    expect(service.state.get()).toBe("dialog.open.viewing");

    await send({ type: "EDIT" });
    await send({ type: "RESET" });
    expect(service.state.get()).toBe("dialog.closed");
  });

  it("resolves #id targets across levels", async () => {
    const machine = createMachine<any>({
      initialState: () => "dialog",
      states: {
        dialog: {
          initial: "open",
          states: {
            focused: {
              id: "dialogFocused",
              on: { REOPEN: { target: "open" } },
            },
            open: {
              initial: "idle",
              states: {
                idle: { on: { CLOSE: { target: "#dialogFocused" } } },
                focused: {},
              },
            },
          },
        },
      },
    });

    const { service, send } = renderMachine(machine);
    expect(service.state.get()).toBe("dialog.open.idle");

    await send({ type: "CLOSE" });
    expect(service.state.get()).toBe("dialog.focused");

    await send({ type: "REOPEN" });
    expect(service.state.get()).toBe("dialog.open.idle");
  });

  it("enters three levels deep and transitions back out", async () => {
    const visited: string[] = [];
    const record = (value: string) => () => visited.push(value);

    const machine = createMachine<any>({
      initialState: () => "root",
      states: {
        root: {
          initial: "level1",
          states: {
            level1: {
              initial: "level2",
              states: {
                level2: {
                  initial: "level3",
                  states: {
                    level3: {
                      entry: ["enterLevel3"],
                      on: { NEXT: { target: "root.done" } },
                    },
                  },
                },
              },
            },
            done: { entry: ["enterDone"] },
          },
        },
      },
      implementations: {
        actions: { enterLevel3: record("level3"), enterDone: record("done") },
      },
    });

    const { service, send } = renderMachine(machine);
    expect(service.state.matches("root.level1.level2.level3")).toBe(true);

    await send({ type: "NEXT" });

    expect(service.state.matches("root.done")).toBe(true);
    expect(visited).toEqual(["level3", "done"]);
  });
});
