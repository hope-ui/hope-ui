import { describe, expect, it } from "vitest";
import { normalizeProps } from "../normalize-props";

describe("normalizeProps", () => {
  it("renames the React-flavored prop names Zag emits to their Solid spellings", () => {
    const handler = () => {};

    const props = normalizeProps.element({
      onFocus: handler,
      onBlur: handler,
      onDoubleClick: handler,
      onChange: handler,
      className: "primary",
      htmlFor: "field",
      defaultChecked: true,
      defaultValue: "seed",
    } as any) as Record<string, unknown>;

    expect(props).toEqual({
      onFocusIn: handler,
      onFocusOut: handler,
      onDblClick: handler,
      onInput: handler,
      class: "primary",
      for: "field",
      checked: true,
      value: "seed",
    });
  });

  it("passes unmapped props through untouched", () => {
    const props = normalizeProps.element({
      id: "trigger",
      "data-state": "open",
      onClick: undefined,
    } as any) as Record<string, unknown>;

    expect(props).toEqual({
      id: "trigger",
      "data-state": "open",
      onClick: undefined,
    });
  });

  it("stringifies boolean `aria-*` values, in both directions", () => {
    // Zag emits ARIA state as real booleans. Solid's `setAttribute` writes `true` as `""` and
    // removes the attribute for `false`, so an unconverted boolean ships either an invalid
    // enumerated value (axe: `aria-valid-attr-value`) or no state at all. A deviation from
    // upstream — see `normalize-props.md`.
    expect(
      normalizeProps.element({
        "aria-expanded": false,
        "aria-modal": true,
      } as any),
    ).toEqual({
      "aria-expanded": "false",
      "aria-modal": "true",
    });
  });

  it("leaves non-`aria-` booleans and non-boolean `aria-` values alone", () => {
    expect(
      normalizeProps.element({
        "data-open": true,
        disabled: false,
        "aria-label": "Close",
        "aria-level": 2,
      } as any),
    ).toEqual({
      "data-open": true,
      disabled: false,
      "aria-label": "Close",
      "aria-level": 2,
    });
  });

  it("drops `readOnly={false}` but keeps `readOnly={true}`", () => {
    // Solid reflects `readonly=""` for any present value, so a `false` has to be removed
    // entirely rather than forwarded.
    expect(normalizeProps.element({ readOnly: false } as any)).toEqual({});
    expect(normalizeProps.element({ readOnly: true } as any)).toEqual({
      readOnly: true,
    });
  });

  it("turns a camelCased style object into hyphenated CSS properties", () => {
    const props = normalizeProps.element({
      style: {
        marginTop: "4px",
        backgroundImage: "url(a.png)",
        msOverflowStyle: "none",
        "--custom-token": "12px",
        zIndex: 3,
      },
    } as any) as { style: Record<string, unknown> };

    expect(props.style).toEqual({
      "margin-top": "4px",
      "background-image": "url(a.png)",
      "-ms-overflow-style": "none",
      "--custom-token": "12px",
      "z-index": 3,
    });
  });

  it("drops style values that are neither strings nor numbers", () => {
    const props = normalizeProps.element({
      style: {
        color: "red",
        display: undefined,
        hidden: null,
        nested: { a: 1 },
      },
    } as any) as { style: Record<string, unknown> };

    expect(props.style).toEqual({ color: "red" });
  });

  it("leaves a non-object `style` alone", () => {
    const props = normalizeProps.element({
      style: "color: red",
    } as any) as Record<string, unknown>;

    expect(props.style).toBe("color: red");
  });

  it("maps string children to textContent and drops every other child", () => {
    expect(normalizeProps.element({ children: "Close" } as any)).toEqual({
      textContent: "Close",
    });
    expect(normalizeProps.element({ children: 42 } as any)).toEqual({});
  });
});
