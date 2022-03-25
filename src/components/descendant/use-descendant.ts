import type { Context } from "solid-js";
import { createContext, createEffect, createSignal, onCleanup, useContext } from "solid-js";

import { cast } from "@/utils/function";

import { DescendantOptions, DescendantsManager } from "./descendant";

/**
 * Custom hook that initializes the DescendantsManager.
 *
 * @internal
 */
function createDescendantsManager<T extends HTMLElement = HTMLElement, K = {}>() {
  const descendantsManager = new DescendantsManager<T, K>();

  onCleanup(() => {
    descendantsManager.destroy();
  });

  return descendantsManager;
}

/* -------------------------------------------------------------------------------------------------
 * Descendants context to be used in component-land.
 *
 * - Mount the `DescendantsContextProvider` at the root of the component
 * - Call `useDescendantsContext` anywhere you need access to the descendants information
 * -----------------------------------------------------------------------------------------------*/

const DescendantsContext = createContext<DescendantsManager<HTMLElement, {}>>();

function useDescendantsContext() {
  const context = useContext(DescendantsContext);

  if (!context) {
    throw new Error("[Hope UI]: useDescendantsContext must be used within a `<DescendantsProvider />` component");
  }

  return context;
}

/**
 * This hook provides information to a descendant such as:
 * - Its index compared to other descendants
 * - ref callback to register the descendant
 * - Its enabled index compared to other enabled descendants
 *
 * @internal
 */
function useDescendant<T extends HTMLElement = HTMLElement, K = {}>(options?: DescendantOptions<K>) {
  const descendantsManager = useDescendantsContext();

  const [index, setIndex] = createSignal(-1);

  let ref: T | null = null;

  const enabledIndex = () => descendantsManager.enabledIndexOf(ref);

  const assignRef = (el: T) => {
    if (options) {
      descendantsManager.register(options)?.(el);
    } else {
      descendantsManager.register(el);
    }

    ref = el;
  };

  const setDisabled = (disabled: boolean) => {
    descendantsManager.setDisabled(index(), disabled);
  };

  createEffect(() => {
    if (!ref) {
      return;
    }

    const dataIndex = Number(ref.dataset["index"]);

    if (index() != dataIndex && !Number.isNaN(dataIndex)) {
      setIndex(dataIndex);
    }
  });

  onCleanup(() => {
    if (!ref) {
      return;
    }

    descendantsManager.unregister(ref);
  });

  return {
    descendantsManager,
    assignRef,
    index,
    enabledIndex,
    setDisabled,
  };
}

/* -------------------------------------------------------------------------------------------------
 * Function that provides strongly typed versions of the context provider and hooks above.
 * To be used in component-land
 * -----------------------------------------------------------------------------------------------*/

export function createDescendantContext<T extends HTMLElement = HTMLElement, K = {}>() {
  type ContextProviderType = Context<DescendantsManager<T, K>>;
  const ContextProvider = cast<ContextProviderType>(DescendantsContext).Provider;

  const _useDescendantsContext = () => cast<DescendantsManager<T, K>>(useDescendantsContext());

  const _createDescendantsManager = () => createDescendantsManager<T, K>();

  const _useDescendant = (options?: DescendantOptions<K>) => useDescendant<T, K>(options);

  return [
    // context provider.
    ContextProvider,

    // call this when you need to read from context.
    _useDescendantsContext,

    // descendants state information, to be called and passed to `ContextProvider`.
    _createDescendantsManager,

    // descendant index information.
    _useDescendant,
  ] as const;
}
