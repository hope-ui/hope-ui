// The `combobox/` barrel: the `createCombobox` hook family — the shared kernel of Select and
// Combobox — exported as the single subpath `@hope-ui/primitives/combobox`. Type-first, no namespace
// object (that's the component layer).
//
// There is deliberately no `createComboboxItem`, `createComboboxLabel` or `createComboboxPortal`:
// an option is `createListboxItem(state.list, …)` unchanged, labelling is the consumer's
// `aria-label`/`aria-labelledby` on the trigger, and a portal part needs no hook.
//
// Two focus owners, one pattern: `createComboboxTrigger` puts `role="combobox"` on Select's
// `<button>`, `createComboboxInput` puts it on Combobox's `<input>`. Combobox's own *chevron* is
// `createComboboxToggle` — a plain, tab-order-excluded button, not a second combobox.
export {
  type CreateComboboxClearProps,
  type CreateComboboxClearReturn,
  createComboboxClear,
} from "./combobox-clear";
export {
  type CreateComboboxContentReturn,
  createComboboxContent,
} from "./combobox-content";
export {
  type CreateComboboxInputProps,
  type CreateComboboxInputReturn,
  createComboboxInput,
} from "./combobox-input";
export {
  type CreateComboboxListReturn,
  createComboboxList,
} from "./combobox-list";
export {
  type CreateComboboxPositionerReturn,
  createComboboxPositioner,
} from "./combobox-positioner";
export {
  type ComboboxFocusStrategy,
  type CreateComboboxOptions,
  type CreateComboboxReturn,
  createCombobox,
  type SelectionValue,
} from "./combobox-root";
export {
  type CreateComboboxStatusReturn,
  createComboboxStatus,
} from "./combobox-status";
export {
  type CreateComboboxToggleProps,
  type CreateComboboxToggleReturn,
  createComboboxToggle,
} from "./combobox-toggle";
export {
  type CreateComboboxTriggerProps,
  type CreateComboboxTriggerReturn,
  createComboboxTrigger,
} from "./combobox-trigger";
export {
  type CreateComboboxValueReturn,
  createComboboxValue,
} from "./combobox-value";
