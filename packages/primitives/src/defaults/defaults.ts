import { merge } from "solid-js";

/** `Props`, with every key that has a default made non-optional. */
export type WithDefaults<Props extends object, Defaults extends Partial<Props>> = Omit<
  Props,
  keyof Defaults
> & {
  [K in keyof Defaults & keyof Props]-?: Exclude<Props[K], undefined>;
};

/**
 * Applies default values to a props object, resolving each defaulted key with `??`.
 *
 * This exists because `merge({ modal: true }, props)` — the obvious way to express a
 * default — is wrong under SolidJS 2.0. `merge` resolves a key by *presence*, not by
 * value: a later source that has the key at all wins, even when its value is `undefined`.
 * So `<Dialog.Root modal={undefined}>` beats the default and produces a non-modal dialog,
 * while `<Dialog.Root>` (key absent) correctly gets `true`. Forwarding an unset optional
 * prop from a wrapper component — `<Dialog.Root modal={props.modal}>` — is the single most
 * common way a consumer wraps a headless component, and it hits the broken case every time.
 *
 * `withDefaults` reads each defaulted key through `props[key] ?? defaults[key]`, so only a
 * genuinely present, non-nullish value overrides the default. An explicit `false` or `0`
 * still wins, as it should.
 *
 * Reads stay lazy: the defaults are exposed as getters, so `props`' own getters are only
 * evaluated when the merged key is actually read, inside whatever tracking scope reads it.
 *
 * A `undefined` default value is meaningless here — omit the key instead.
 */
export function withDefaults<Props extends object, Defaults extends Partial<Props>>(
  props: Props,
  defaults: Defaults,
): WithDefaults<Props, Defaults> {
  const descriptors: PropertyDescriptorMap = {};

  for (const key of Object.keys(defaults)) {
    descriptors[key] = {
      get: () =>
        (props as Record<string, unknown>)[key] ?? (defaults as Record<string, unknown>)[key],
      enumerable: true,
      configurable: true,
    };
  }

  return merge(props, Object.defineProperties({}, descriptors)) as WithDefaults<Props, Defaults>;
}
