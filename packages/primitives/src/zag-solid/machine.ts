import type {
  ActionsOrFn,
  BindableContext,
  ChooseFn,
  ComputedFn,
  EffectsOrFn,
  GuardFn,
  Machine,
  MachineSchema,
  Params,
  Service,
} from "@zag-js/core";
import {
  createScope,
  findTransition,
  getExitEnterStates,
  hasTag,
  INIT_STATE,
  MachineStatus,
  matchesState,
  resolveStateValue,
} from "@zag-js/core";
import { callAll, compact, ensure, isFunction, isString, toArray, warn } from "@zag-js/utils";
import { type Accessor, createMemo, flush, merge, onCleanup, onSettled, untrack } from "solid-js";
import { createBindable } from "./bindable";
import { createRefs } from "./refs";
import { createTrack } from "./track";

function resolve<T>(value: T | Accessor<T>): T {
  return isFunction(value) ? value() : value;
}

const KIND_LABEL = { actions: "action", guards: "guard", effects: "effect" } as const;

/**
 * Runs one of the machine's **construction** callbacks — the ones that read props to derive a
 * starting value: `context()` (listbox derives `initialValue` and its selected-item map there),
 * `refs()`, and the state cell's `initialState({ prop })`.
 *
 * Those reads are one-shot by definition; Zag re-reads everything reactively afterwards, through
 * `prop()` inside guards, actions, effects and `track` deps. They also happen in a component render
 * body, the phase Solid 2.0 labels strict-read, so `untrack` is how the intent gets spelled instead
 * of warned about. Doing it here — rather than at the call site — is what lets a consumer write a
 * bare `useMachine(...)` in its render body.
 *
 * Deliberately not applied to `machine.watch?.()`: that one only *registers* `track` effects, whose
 * deps are collected in their own tracking scope. A machine that reads props directly there has a
 * real bug, and should keep getting the diagnostic.
 */
function seedFromProps<T>(read: () => T): T {
  return untrack(read);
}

/**
 * Binds a Zag.js machine to SolidJS reactivity: a scope, a reactive state cell, reactive props,
 * per-state effects and a teardown. `@zag-js/core` is framework-agnostic pure TS; this is the
 * whole of the framework adapter.
 *
 * Pass `userProps` as an **accessor** whenever a prop comes from a signal — it is re-read through a
 * memo, so guards, actions and computed values see current values.
 *
 * The machine starts in `onSettled` and stops in `onCleanup`; outside that window `send` is a
 * no-op, which is what makes an event fired from a torn-down effect harmless.
 */
export function useMachine<T extends MachineSchema>(
  machine: Machine<T>,
  userProps: Partial<T["props"]> | Accessor<Partial<T["props"]>> = {},
): Service<T> {
  const scope = createMemo(() => {
    const { id, ids, getRootNode } = resolve(userProps) as any;
    return createScope({ id, ids, getRootNode });
  });

  const debug = (...args: any[]) => {
    if (machine.debug) {
      console.log(...args);
    }
  };

  const props = createMemo(
    () =>
      machine.props?.({
        props: compact(resolve(userProps)),
        scope: scope(),
      }) ?? resolve(userProps),
  );

  const prop: any = (key: string) => (props() as any)[key];

  const context: any = seedFromProps(() =>
    machine.context?.({
      prop,
      bindable: createBindable,
      get scope() {
        return scope();
      },
      flush,
      getContext() {
        return contextCells as any;
      },
      getComputed() {
        return computed as any;
      },
      getRefs() {
        return refs as any;
      },
      getEvent() {
        return getEvent();
      },
    }),
  );

  const contextCells: BindableContext<T> = {
    get(key) {
      return context?.[key].get();
    },
    set(key, value) {
      context?.[key].set(value);
    },
    initial(key) {
      return context?.[key].initial;
    },
    hash(key) {
      const current = context?.[key].get();
      return context?.[key].hash(current);
    },
  };

  const refs = createRefs(
    seedFromProps(() => machine.refs?.({ prop, context: contextCells })) ?? {},
  );

  /** Cleanups for the effects of every state currently entered, keyed by state path. */
  let effectCleanups = new Map<string, VoidFunction>();
  let currentTransition: any = null;
  let currentEvent: any = { type: "" };
  let previousEvent: any = null;

  // `merge` is 2.0's `mergeProps`. Both call sites only *add* method keys to an object, so
  // `merge`'s presence-based (rather than value-based) key resolution can't bite here.
  const getEvent = (): any =>
    merge(currentEvent, {
      current() {
        return currentEvent;
      },
      previous() {
        return previousEvent;
      },
    });

  const getState = () =>
    merge(state, {
      matches(...values: T["state"][]) {
        const current = state.get();
        return values.some((value) => matchesState(current as string, value as string));
      },
      hasTag(tag: T["tag"]) {
        return hasTag(machine, state.get(), tag);
      },
    });

  const getParams = (): Params<T> => ({
    state: getState(),
    context: contextCells,
    event: getEvent(),
    prop,
    send,
    action,
    guard,
    track: createTrack,
    refs,
    computed,
    flush,
    get scope() {
      return scope();
    },
    choose,
  });

  /** Looks a name up in the machine's implementations, warning (as upstream does) when it is absent. */
  const implementationOf = (kind: "actions" | "guards" | "effects", name: string): any => {
    const found = (machine.implementations?.[kind] as any)?.[name];
    if (!found) {
      warn(`[zag-js] No implementation found for ${KIND_LABEL[kind]} "${JSON.stringify(name)}"`);
    }
    return found;
  };

  const action = (actions: ActionsOrFn<T> | undefined) => {
    const names = isFunction(actions) ? actions(getParams()) : actions;
    if (!names) {
      return;
    }
    for (const name of names) {
      implementationOf("actions", name as string)?.(getParams());
    }
  };

  const guard = (guardOrFn: T["guard"] | GuardFn<T>) => {
    if (isFunction(guardOrFn)) {
      return guardOrFn(getParams());
    }
    return implementationOf("guards", guardOrFn as string)?.(getParams());
  };

  /** Starts a state's effects and returns the one cleanup that stops all of them. */
  const startEffects = (effects: EffectsOrFn<T> | undefined) => {
    const names = isFunction(effects) ? effects(getParams()) : effects;
    if (!names) {
      return;
    }
    const cleanups: VoidFunction[] = [];
    for (const name of names) {
      const cleanup = implementationOf("effects", name as string)?.(getParams());
      if (cleanup) {
        cleanups.push(cleanup);
      }
    }
    return () => {
      for (const cleanup of cleanups) {
        cleanup?.();
      }
    };
  };

  const rememberCleanup = (path: string, cleanup: VoidFunction | undefined) => {
    if (!cleanup) {
      return;
    }
    const existing = effectCleanups.get(path);
    effectCleanups.set(path, existing ? callAll(existing, cleanup) : cleanup);
  };

  const choose: ChooseFn<T> = (transitions) =>
    toArray(transitions).find((transition) => {
      if (isString(transition.guard)) {
        return !!guard(transition.guard);
      }
      if (isFunction(transition.guard)) {
        return transition.guard(getParams());
      }
      return !transition.guard;
    });

  const computed: ComputedFn<T> = (key) => {
    ensure(machine.computed, () => `[zag-js] No computed object found on machine`);
    return machine.computed[key]({
      context: contextCells,
      event: currentEvent,
      prop,
      refs,
      scope: scope(),
      computed,
    });
  };

  const state = seedFromProps(() =>
    createBindable(() => ({
      defaultValue: resolveStateValue(machine, machine.initialState({ prop })),
      onChange(nextState, prevState) {
        const { exiting, entering } = getExitEnterStates(
          machine,
          prevState,
          nextState,
          currentTransition?.reenter,
        );

        for (const item of exiting) {
          effectCleanups.get(item.path)?.();
          effectCleanups.delete(item.path);
        }

        for (const item of exiting) {
          action(item.state?.exit);
        }

        action(currentTransition?.actions);

        for (const item of entering) {
          rememberCleanup(item.path, startEffects(item.state?.effects));
        }

        if (prevState === INIT_STATE) {
          action(machine.entry);
          rememberCleanup(INIT_STATE, startEffects(machine.effects));
        }

        for (const item of entering) {
          action(item.state?.entry);
        }
      },
    })),
  );

  let status = MachineStatus.NotStarted;

  onSettled(() => {
    const started = status === MachineStatus.Started;
    status = MachineStatus.Started;
    debug(started ? "rehydrating..." : "initializing...");
    state.invoke(state.initial as T["state"], INIT_STATE);
  });

  onCleanup(() => {
    debug("unmounting...");
    status = MachineStatus.Stopped;

    for (const cleanup of effectCleanups.values()) {
      cleanup?.();
    }
    effectCleanups = new Map();
    currentTransition = null;

    action(machine.exit);
  });

  // Deferred by a microtask, upstream's design: an action that sends is not re-entrant with the
  // transition that triggered it. That also puts the body outside every reactive phase, which is
  // why the state read below needs no `untrack`.
  const send = (event: any) => {
    queueMicrotask(() => {
      if (status !== MachineStatus.Started) {
        return;
      }

      previousEvent = currentEvent;
      currentEvent = event;

      const currentState = state.get();

      const { transitions, source } = findTransition(machine, currentState, event.type as string);
      const transition = choose(transitions);
      if (!transition) {
        return;
      }

      currentTransition = transition;
      const target = resolveStateValue(machine, transition.target ?? currentState, source);

      debug("transition", event.type, transition.target || currentState, `(${transition.actions})`);

      if (target !== currentState) {
        // State change is high priority, and under Solid 2.0 that now needs saying: a plain write
        // is invisible to a plain read until the next flush (client build), so two events queued
        // back-to-back would both transition from the *pre*-transition state. `flush` drains here
        // exactly like the React adapter's `flushSync(() => state.set(target))`.
        flush(() => state.set(target));
      } else if (transition.reenter) {
        state.invoke(currentState, currentState);
      } else {
        action(transition.actions);
      }
    });
  };

  machine.watch?.(getParams());

  return {
    state: getState(),
    send,
    context: contextCells,
    prop,
    get scope() {
      return scope();
    },
    refs,
    computed,
    event: getEvent(),
    getStatus: () => status,
  } as unknown as Service<T>;
}
