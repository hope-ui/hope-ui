import { describe, expect, it } from "vitest";
import { type RecipeRegistry, THEMING_CONTRACT_VERSION } from "../recipe-registry";
import type { AlertRecipeVariants, AlertSlot } from "../recipes/alert";
import type { BadgeRecipeVariants, BadgeSlot } from "../recipes/badge";
import type { ButtonRecipeVariants, ButtonSlot } from "../recipes/button";
import type { CalendarRecipeVariants, CalendarSlot } from "../recipes/calendar";
import type { CloseButtonRecipeVariants, CloseButtonSlot } from "../recipes/close-button";
import type { ComboboxRecipeVariants, ComboboxSlot } from "../recipes/combobox";
import type { DialogRecipeVariants, DialogSlot } from "../recipes/dialog";
import type { ListboxRecipeVariants, ListboxSlot } from "../recipes/listbox";
import type { PopoverRecipeVariants, PopoverSlot } from "../recipes/popover";
import type { SelectRecipeVariants, SelectSlot } from "../recipes/select";
import type { SlotClassFn } from "../slot-recipe";

// A conforming theme must provide every recipe the registry names. This is a compile-time
// assignability check — `pnpm typecheck` is what runs it, not the test runner.
const _theme = {
  alert: (props?: AlertRecipeVariants): Record<AlertSlot, SlotClassFn> => ({
    root: () => `alert alert--${props?.variant ?? "default"}`,
    icon: () => "alert__icon",
    content: () => "alert__content",
    title: () => "alert__title",
    description: () => "alert__description",
    actions: () => "alert__actions",
    closeTrigger: () => "alert__close",
  }),
  badge: (props?: BadgeRecipeVariants): Record<BadgeSlot, SlotClassFn> => ({
    root: () => `badge badge--${props?.variant ?? "soft"}`,
    label: () => "badge__label",
    startDecorator: () => "badge__start",
    endDecorator: () => "badge__end",
    dot: () => "badge__dot",
  }),
  button: (props?: ButtonRecipeVariants): Record<ButtonSlot, SlotClassFn> => ({
    root: () => `btn btn--${props?.variant ?? "default"}`,
    label: () => "btn__label",
    startDecorator: () => "btn__start",
    endDecorator: () => "btn__end",
    loader: () => "btn__loader",
  }),
  calendar: (props?: CalendarRecipeVariants): Record<CalendarSlot, SlotClassFn> => ({
    root: () => `calendar calendar--${props?.size ?? "md"}`,
    header: () => "calendar__header",
    heading: () => "calendar__heading",
    prevButton: () => "calendar__prev-button",
    nextButton: () => "calendar__next-button",
    grid: () => "calendar__grid",
    weekday: () => "calendar__weekday",
    cell: () => "calendar__cell",
    cellTrigger: () => "calendar__cell-trigger",
  }),
  closeButton: (props?: CloseButtonRecipeVariants): Record<CloseButtonSlot, SlotClassFn> => ({
    root: () => `close close--${props?.size ?? "sm"}`,
    icon: () => "close__icon",
  }),
  combobox: (props?: ComboboxRecipeVariants): Record<ComboboxSlot, SlotClassFn> => ({
    control: () => `combobox__control combobox__control--${props?.size ?? "md"}`,
    input: () => "combobox__input",
    clear: () => "combobox__clear",
    trigger: () => "combobox__trigger",
    icon: () => "combobox__icon",
    positioner: () => "combobox__positioner",
    content: () => "combobox__content",
    list: () => "combobox__list",
    empty: () => "combobox__empty",
    status: () => "combobox__status",
    group: () => "combobox__group",
    groupLabel: () => "combobox__group-label",
    separator: () => "combobox__separator",
    item: () => "combobox__item",
    itemText: () => "combobox__item-text",
    itemIndicator: () => "combobox__item-indicator",
  }),
  dialog: (props?: DialogRecipeVariants): Record<DialogSlot, SlotClassFn> => ({
    backdrop: () => "dialog__backdrop",
    positioner: () => "dialog__positioner",
    content: () => `dialog__content dialog__content--${props?.size ?? "md"}`,
    header: () => "dialog__header",
    body: () => "dialog__body",
    footer: () => "dialog__footer",
    title: () => "dialog__title",
    description: () => "dialog__description",
    closeTrigger: () => "dialog__close-trigger",
  }),
  listbox: (props?: ListboxRecipeVariants): Record<ListboxSlot, SlotClassFn> => ({
    root: () => `listbox listbox--${props?.size ?? "md"}`,
    item: () => "listbox__item",
    itemIndicator: () => "listbox__item-indicator",
    group: () => "listbox__group",
    groupLabel: () => "listbox__group-label",
    separator: () => "listbox__separator",
  }),
  popover: (props?: PopoverRecipeVariants): Record<PopoverSlot, SlotClassFn> => ({
    positioner: () => "popover__positioner",
    content: () => `popover__content popover__content--${props?.size ?? "md"}`,
    arrow: () => "popover__arrow",
    header: () => "popover__header",
    title: () => "popover__title",
    description: () => "popover__description",
    closeTrigger: () => "popover__close-trigger",
  }),
  select: (props?: SelectRecipeVariants): Record<SelectSlot, SlotClassFn> => ({
    trigger: () => `select__trigger select__trigger--${props?.size ?? "md"}`,
    value: () => "select__value",
    icon: () => "select__icon",
    positioner: () => "select__positioner",
    content: () => "select__content",
    list: () => "select__list",
    group: () => "select__group",
    groupLabel: () => "select__group-label",
    separator: () => "select__separator",
    item: () => "select__item",
    itemText: () => "select__item-text",
    itemIndicator: () => "select__item-indicator",
  }),
} satisfies RecipeRegistry;
void _theme;

describe("RecipeRegistry contract", () => {
  it("pins the contract version", () => {
    expect(THEMING_CONTRACT_VERSION).toBe(1);
  });
});
