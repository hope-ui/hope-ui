import { Select } from "@hope-ui/components/select";
import { createUniqueId } from "solid-js";
import type { Family } from "./theme-config";

// One role's color picker, built on hope-ui's own `Select`. It replaced a hand-rolled grid of
// `<input type="radio">` swatches: the widget the grid was imitating now ships, so the page dogfoods
// it instead — and the list gets what the grid never had, a scrolling popup that doesn't grow the
// control panel with every family, and typeahead (type "vio" to jump to violet).
//
// Each swatch is filled with `var(--color-<family>-500)`; the docs app keeps the whole palette alive
// (see styles/palette-keepalive.css) so every family resolves. This is site chrome, so it renders in
// the site's own theme, not the one being built — hence no portal `mount` override here.

/** The color chip plus the family name, shared by the trigger and every option row. */
function FamilySwatch(props: { family: Family }) {
  return (
    <span class="flex min-w-0 items-center gap-2">
      <span
        class="size-4 shrink-0 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/15"
        style={{ "background-color": `var(--color-${props.family}-500)` }}
      />
      <span class="truncate">{props.family}</span>
    </span>
  );
}

export function RolePicker<F extends Family>(props: {
  /** Group heading, e.g. "Primary". */
  label: string;
  /** One-line purpose. */
  hint: string;
  /** The families to offer. */
  families: readonly F[];
  /** The selected family. */
  value: F;
  onChange: (family: F) => void;
}) {
  // `Select` ships no `Label` part and a nameless `role="combobox"` is an accessibility violation,
  // so the visible heading names the trigger by id. The trigger prepends its own `Select.Value` id,
  // which is what makes a screen reader announce the current family before the role's name.
  const labelId = createUniqueId();

  return (
    <div class="min-w-0">
      <span id={labelId} class="text-sm font-semibold text-foreground">
        {props.label}
      </span>
      <p class="mt-0.5 text-xs text-foreground-muted">{props.hint}</p>

      <Select.Root
        items={props.families}
        value={props.value}
        // Single mode hands back a scalar, and `null` only when a selection is cleared — which no
        // path here does, since picking a row replaces the selection rather than toggling it.
        onChange={(family) => {
          if (family != null) {
            props.onChange(family);
          }
        }}
      >
        <Select.Trigger class="mt-2 w-full" aria-labelledby={labelId}>
          <Select.Value>{(families: F[]) => <FamilySwatch family={families[0]} />}</Select.Value>
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Content>
              <Select.List>
                {(family: F) => (
                  <Select.Item item={family}>
                    <Select.ItemText>
                      <FamilySwatch family={family} />
                    </Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                )}
              </Select.List>
            </Select.Content>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
