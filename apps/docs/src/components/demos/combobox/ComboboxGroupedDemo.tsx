import { Combobox } from "@hope-ui/components/combobox";
import { type Accessor, For, Show } from "solid-js";
import {
  BASKETS,
  type Basket,
  type Fruit,
  FruitControl,
  FruitItem,
  itemToLabel,
  itemToValue,
  Stage,
} from "./data";

// Live demo for "Groups and separators". `items` holds the **group entries** and `groupToItems`
// flattens them into navigation order, so the arrows traverse both sections as one list — straight
// across the boundary, skipping the labels and the hairline.
//
// The callback then goes one level up: it runs once per **surviving** group, and its third argument
// is that group's **filtered** items. Type `berry` and Citrus disappears entirely, heading included;
// type `orange` and Berries does. Reaching into `basket.fruits` instead would render every row the
// query just removed — and capturing the array rather than the accessor would go stale the moment a
// surviving group's rows changed, because `<For>` reuses a group whose identity did not change.
export function ComboboxGroupedDemo() {
  return (
    <Stage>
      <Combobox.Root
        items={BASKETS}
        groupToItems={(basket: Basket) => basket.fruits}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
      >
        <FruitControl label="Choose a fruit" placeholder="Try “berry”…" />
        <Combobox.Portal>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.List>
                {(basket: Basket, index, fruits: Accessor<Fruit[]>) => (
                  <>
                    <Show when={index() > 0}>
                      <Combobox.Separator />
                    </Show>
                    <Combobox.Group>
                      <Combobox.GroupLabel>{basket.kind}</Combobox.GroupLabel>
                      <For each={fruits()}>{(fruit) => <FruitItem fruit={fruit} />}</For>
                    </Combobox.Group>
                  </>
                )}
              </Combobox.List>
              <Combobox.Empty>No fruit matches that.</Combobox.Empty>
              <Combobox.Status />
            </Combobox.Content>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </Stage>
  );
}
