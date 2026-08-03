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
 * The obvious spelling — `merge({ modal: true }, props)` — is wrong under SolidJS 2.0. `merge`
 * resolves a key by *presence*, not by value: a later source wins as soon as it has the key at
 * all, even when the value is `undefined`. So `<Dialog.Root modal={undefined}>` beats the default
 * and renders a non-modal dialog, which is exactly what a wrapper forwarding an unset optional
 * prop (`modal={props.modal}`) produces. Reading `props[key] ?? defaults[key]` instead means only
 * a present, non-nullish value overrides; an explicit `false` or `0` still wins.
 *
 * Defaults are exposed as getters, so reads stay lazy and happen inside whatever reactive scope
 * reads them. A default value of `undefined` is meaningless — omit the key instead.
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
