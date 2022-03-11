import { createEffect, onCleanup } from "solid-js";

export interface UseElementEventProps<Key> {
  element?: HTMLElement | Window | Document | undefined;
  eventName?: Key;
  handler?: (event: Event) => void;
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
}

export function useEvent<Key extends string>(props: UseElementEventProps<Key>) {
  const onEmit = (event: Event) => {
    props.handler?.(event);
  };

  const _active = (element: any, key?: Key, capture?: boolean, passive?: boolean) => {
    if (key && element && element.addEventListener) {
      element.addEventListener(key, onEmit, {
        capture,
        passive,
      });
    }
  };

  const active = () => {
    const { element, eventName, capture, passive } = props;
    _active(element, eventName, capture, passive);
  };

  const _inactive = (element: any, key?: Key) => {
    if (key && element && element.removeEventListener) {
      element.removeEventListener(key, onEmit);
    }
  };

  const inactive = () => {
    const { element, eventName } = props;
    _inactive(element, eventName);
  };

  createEffect((prev: any) => {
    const { element, eventName, capture, passive } = props;
    if (prev) {
      _inactive(prev.element, prev.eventName);
    }
    _active(element, eventName, capture, passive);
    return {
      element,
      eventName,
    };
  });

  onCleanup(() => {
    const { element, eventName } = props;
    _inactive(element, eventName);
  });

  return {
    active,
    inactive,
  };
}
