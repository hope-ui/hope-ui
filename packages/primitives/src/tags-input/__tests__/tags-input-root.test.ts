import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import {
  type CreateTagsInputOptions,
  type CreateTagsInputReturn,
  createTagsInput,
  type TagsInputRejection,
} from "../tags-input-root";

// The root hook is pure policy over signals: no element ever registers, the direction warning
// returns early with no element, and `createListFocus`'s deferred `.focus()` never resolves one. So
// the whole state machine drives inside a `createRoot`, in the node `unit` project. The chip row's
// DOM behavior — roving focus, the keymap, the removal focus paths — is Phase 3/4's browser work.
//
// Writes are wrapped in `flush()` because a Solid 2.0 signal write is invisible to a plain read
// until the next flush, in the client build these tests resolve.
function setup<V>(options: CreateTagsInputOptions<V>): {
  api: CreateTagsInputReturn<V>;
  dispose: () => void;
} {
  let api!: CreateTagsInputReturn<V>;
  let dispose!: () => void;
  createRoot((d) => {
    dispose = d;
    api = createTagsInput<V>(options);
  });
  return { api, dispose };
}

/** Array access that asserts presence — under `noUncheckedIndexedAccess`, `list[i]` is `T | undefined`. */
function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value === undefined) {
    throw new Error(`no element at index ${index}`);
  }
  return value;
}

interface Email {
  address: string;
}

describe("createTagsInput — initial state", () => {
  it("starts empty and unconstrained", () => {
    const { api, dispose } = setup<string>({});
    expect(api.value()).toEqual([]);
    expect(api.max()).toBeUndefined();
    expect(api.isFull()).toBe(false);
    expect(api.delimiter()).toBe(",");
    expect(api.duplicateValue()).toBeUndefined();
    dispose();
  });

  it("seeds from defaultValue and resolves a chip's index from its value", () => {
    const { api, dispose } = setup({ defaultValue: ["apple", "banana"] });
    expect(api.value()).toEqual(["apple", "banana"]);
    expect(api.indexOfValue("banana")).toBe(1);
    expect(api.indexOfValue("cherry")).toBe(-1);
    dispose();
  });

  it("generates an id, and yields to an explicit one", () => {
    const { api, dispose } = setup<string>({});
    expect(api.id()).toMatch(/\S/);
    dispose();

    const explicit = setup<string>({ id: "tags" });
    expect(explicit.api.id()).toBe("tags");
    explicit.dispose();
  });
});

describe("createTagsInput — add", () => {
  it("adds one tag and consumes the field's text", () => {
    const { api, dispose } = setup<string>({});
    let result!: ReturnType<typeof api.add>;
    flush(() => {
      result = api.add("apple");
    });
    expect(api.value()).toEqual(["apple"]);
    expect(result.added).toEqual(["apple"]);
    expect(result.inputText).toBe("");
    expect(result.rejections).toEqual([]);
    dispose();
  });

  it("trims through the default parser", () => {
    const { api, dispose } = setup<string>({});
    flush(() => api.add("   apple   "));
    expect(api.value()).toEqual(["apple"]);
    dispose();
  });

  it("splits on the delimiter, honoring a custom one", () => {
    const { api, dispose } = setup<string>({});
    flush(() => api.add("apple,banana,cherry"));
    expect(api.value()).toEqual(["apple", "banana", "cherry"]);
    dispose();

    const piped = setup<string>({ delimiter: "|" });
    flush(() => piped.api.add("apple|banana"));
    expect(piped.api.value()).toEqual(["apple", "banana"]);
    // A comma is then just a character, not a separator.
    flush(() => piped.api.add("a,b"));
    expect(piped.api.value()).toEqual(["apple", "banana", "a,b"]);
    piped.dispose();
  });

  it("drops empty parts silently — typing `apple,` is a commit, not a commit plus a mistake", () => {
    const onReject = vi.fn();
    const { api, dispose } = setup<string>({ onReject });
    let result!: ReturnType<typeof api.add>;
    flush(() => {
      result = api.add("apple,");
    });
    expect(api.value()).toEqual(["apple"]);
    expect(result.rejections).toEqual([]);
    expect(onReject).not.toHaveBeenCalled();
    dispose();
  });

  it("fires onChange with the whole new list, in one write", () => {
    const onChange = vi.fn();
    const { api, dispose } = setup<string>({ defaultValue: ["apple"], onChange });
    flush(() => api.add("banana,cherry"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(["apple", "banana", "cherry"]);
    dispose();
  });

  it("refuses every mutation while disabled or read-only, leaving the field's text alone", () => {
    for (const gate of [{ disabled: true }, { readOnly: true }] as const) {
      const onReject = vi.fn();
      const { api, dispose } = setup<string>({ defaultValue: ["apple"], onReject, ...gate });
      let result!: ReturnType<typeof api.add>;
      flush(() => {
        result = api.add("banana");
      });
      expect(api.value()).toEqual(["apple"]);
      // Not a rejection: nothing was judged, the widget simply does not accept input.
      expect(onReject).not.toHaveBeenCalled();
      expect(result.inputText).toBe("banana");
      expect(api.isInteractive()).toBe(false);
      dispose();
    }
  });
});

describe("createTagsInput — the four onReject reasons (D4)", () => {
  /** Runs `add(text)` and returns what `onReject` saw, so each reason is asserted the same way. */
  function rejectionsFor(
    options: CreateTagsInputOptions<string>,
    text: string,
  ): { rejections: TagsInputRejection[]; inputText: string; value: string[] } {
    const rejections: TagsInputRejection[] = [];
    const { api, dispose } = setup<string>({
      ...options,
      onReject: (rejection) => rejections.push(rejection),
    });
    let inputText = "";
    flush(() => {
      inputText = api.add(text).inputText;
    });
    const value = api.value();
    dispose();
    return { rejections, inputText, value };
  }

  it('"empty" — the text normalizes to nothing, and the field is cleared', () => {
    const { rejections, inputText, value } = rejectionsFor({}, "   ");
    expect(rejections).toEqual([{ reason: "empty", text: "   " }]);
    expect(inputText).toBe("");
    expect(value).toEqual([]);
  });

  it('"invalid" — `parse` returned null, and the text is kept so the user can fix it', () => {
    const { rejections, inputText, value } = rejectionsFor(
      { parse: (text) => (text.includes("@") ? text.trim() : null) },
      "not-an-email",
    );
    expect(rejections).toEqual([{ reason: "invalid", text: "not-an-email" }]);
    expect(inputText).toBe("not-an-email");
    expect(value).toEqual([]);
  });

  it('"duplicate" — the text is dropped, because the value is already on screen', () => {
    const { rejections, inputText, value } = rejectionsFor({ defaultValue: ["apple"] }, "apple");
    expect(rejections).toEqual([{ reason: "duplicate", text: "apple" }]);
    expect(inputText).toBe("");
    expect(value).toEqual(["apple"]);
  });

  it('"max" — one rejection carrying the whole remainder, which the field keeps', () => {
    const { rejections, inputText, value } = rejectionsFor(
      { defaultValue: ["apple"], max: 3 },
      "banana,cherry,date,elderberry",
    );
    expect(rejections).toEqual([{ reason: "max", text: "date,elderberry" }]);
    expect(inputText).toBe("date,elderberry");
    expect(value).toEqual(["apple", "banana", "cherry"]);
  });

  it("keeps the invalid text and the max remainder together, in order", () => {
    const { rejections, inputText, value } = rejectionsFor(
      { max: 1, parse: (text) => (text === "bad" ? null : text.trim()) },
      "bad,apple,banana,cherry",
    );
    expect(rejections).toEqual([
      { reason: "invalid", text: "bad" },
      { reason: "max", text: "banana,cherry" },
    ]);
    expect(inputText).toBe("bad,banana,cherry");
    expect(value).toEqual(["apple"]);
  });
});

describe("createTagsInput — max partial-accept (D4)", () => {
  it("accepts up to the limit and hands the rest back", () => {
    const onReject = vi.fn();
    const { api, dispose } = setup<string>({ max: 3, onReject });
    let result!: ReturnType<typeof api.add>;
    flush(() => {
      result = api.add("a,b,c,d,e");
    });
    expect(api.value()).toEqual(["a", "b", "c"]);
    expect(result.added).toEqual(["a", "b", "c"]);
    expect(result.inputText).toBe("d,e");
    // One overflow, not one rejection per tag the user lost.
    expect(onReject).toHaveBeenCalledTimes(1);
    expect(api.isFull()).toBe(true);
    dispose();
  });

  it("refuses everything at max 0, and adds nothing when already full", () => {
    const { api, dispose } = setup<string>({ max: 0 });
    let result!: ReturnType<typeof api.add>;
    flush(() => {
      result = api.add("apple,banana");
    });
    expect(api.value()).toEqual([]);
    expect(result.added).toEqual([]);
    expect(result.inputText).toBe("apple,banana");
    expect(result.rejections).toEqual([{ reason: "max", text: "apple,banana" }]);
    dispose();
  });

  it("does not spend budget on duplicates", () => {
    const { api, dispose } = setup({ defaultValue: ["apple"], max: 2 });
    let result!: ReturnType<typeof api.add>;
    flush(() => {
      result = api.add("apple,banana");
    });
    expect(api.value()).toEqual(["apple", "banana"]);
    expect(result.rejections).toEqual([{ reason: "duplicate", text: "apple" }]);
    dispose();
  });
});

describe("createTagsInput — duplicates (D4)", () => {
  it("is literal by default: `Apple` and `apple` are two tags", () => {
    const { api, dispose } = setup<string>({});
    flush(() => api.add("Apple,apple"));
    expect(api.value()).toEqual(["Apple", "apple"]);
    dispose();
  });

  it("catches a duplicate inside one paste", () => {
    const { api, dispose } = setup<string>({});
    let result!: ReturnType<typeof api.add>;
    flush(() => {
      result = api.add("apple,banana,apple");
    });
    expect(api.value()).toEqual(["apple", "banana"]);
    expect(result.rejections).toEqual([{ reason: "duplicate", text: "apple" }]);
    dispose();
  });

  it("takes `isItemEqualToValue` as the seam to fold case", () => {
    const { api, dispose } = setup({
      defaultValue: ["Apple"],
      isItemEqualToValue: (a, b) => a.toLowerCase() === b.toLowerCase(),
    });
    let result!: ReturnType<typeof api.add>;
    flush(() => {
      result = api.add("apple");
    });
    expect(api.value()).toEqual(["Apple"]);
    expect(result.rejections).toEqual([{ reason: "duplicate", text: "apple" }]);
    dispose();
  });

  it("compares object tags through itemToValue", () => {
    const { api, dispose } = setup<Email>({
      defaultValue: [{ address: "a@b.c" }],
      itemToValue: (email) => email.address,
      parse: (text) => ({ address: text.trim() }),
    });
    let result!: ReturnType<typeof api.add>;
    flush(() => {
      result = api.add("a@b.c");
    });
    expect(api.value()).toHaveLength(1);
    expect(result.rejections).toEqual([{ reason: "duplicate", text: "a@b.c" }]);

    flush(() => api.add("d@e.f"));
    expect(api.value().map((email) => email.address)).toEqual(["a@b.c", "d@e.f"]);
    dispose();
  });
});

describe("createTagsInput — the data-duplicate lifecycle (D4)", () => {
  it("marks the existing chip, not the refused text", () => {
    const { api, dispose } = setup({ defaultValue: ["apple", "banana"] });
    flush(() => api.add("apple"));
    expect(api.duplicateValue()).toBe("apple");
    expect(api.isDuplicate("apple")).toBe(true);
    expect(api.isDuplicate("banana")).toBe(false);
    dispose();
  });

  it("clears on the next input event", () => {
    const { api, dispose } = setup({ defaultValue: ["apple"] });
    flush(() => api.add("apple"));
    expect(api.duplicateValue()).toBe("apple");

    flush(() => api.clearDuplicate());
    expect(api.duplicateValue()).toBeUndefined();
    expect(api.isDuplicate("apple")).toBe(false);
    dispose();
  });

  it("clears on the next successful add", () => {
    const { api, dispose } = setup({ defaultValue: ["apple"] });
    flush(() => api.add("apple"));
    expect(api.duplicateValue()).toBe("apple");

    flush(() => api.add("banana"));
    expect(api.duplicateValue()).toBeUndefined();
    dispose();
  });

  it("survives an add that only failed — the user has not typed since", () => {
    const { api, dispose } = setup({
      defaultValue: ["apple"],
      parse: (text) => (text === "bad" ? null : text.trim()),
    });
    flush(() => api.add("apple"));
    flush(() => api.add("bad"));
    expect(api.duplicateValue()).toBe("apple");
    dispose();
  });

  it("re-marks the second collision in one paste", () => {
    const { api, dispose } = setup({ defaultValue: ["apple", "banana"] });
    flush(() => api.add("apple,banana"));
    expect(api.duplicateValue()).toBe("banana");
    dispose();
  });
});

describe("createTagsInput — remove", () => {
  it("removes by index, by item and from the end", () => {
    const { api, dispose } = setup({ defaultValue: ["apple", "banana", "cherry"] });
    flush(() => api.removeAt(1));
    expect(api.value()).toEqual(["apple", "cherry"]);

    flush(() => api.remove("apple"));
    expect(api.value()).toEqual(["cherry"]);

    flush(() => api.removeLast());
    expect(api.value()).toEqual([]);
    dispose();
  });

  it("resolves `remove` through isItemEqualToValue rather than reference", () => {
    const { api, dispose } = setup<Email>({
      defaultValue: [{ address: "a@b.c" }, { address: "d@e.f" }],
      itemToValue: (email) => email.address,
      parse: (text) => ({ address: text.trim() }),
    });
    // A fresh object, equal by value — what a controlled consumer hands back each render.
    flush(() => api.remove({ address: "a@b.c" }));
    expect(api.value().map((email) => email.address)).toEqual(["d@e.f"]);
    dispose();
  });

  it("ignores an out-of-range index and an unknown item", () => {
    const onChange = vi.fn();
    const { api, dispose } = setup({ defaultValue: ["apple"], onChange });
    flush(() => api.removeAt(5));
    flush(() => api.removeAt(-1));
    flush(() => api.remove("banana"));
    expect(api.value()).toEqual(["apple"]);
    expect(onChange).not.toHaveBeenCalled();
    dispose();
  });

  it("refuses to remove a disabled tag, from either path", () => {
    const { api, dispose } = setup({
      defaultValue: ["apple", "locked"],
      isItemDisabled: (tag) => tag === "locked",
    });
    flush(() => api.removeAt(1));
    flush(() => api.remove("locked"));
    flush(() => api.removeLast());
    expect(api.value()).toEqual(["apple", "locked"]);
    dispose();
  });

  it("refuses every removal while disabled or read-only", () => {
    for (const gate of [{ disabled: true }, { readOnly: true }] as const) {
      const { api, dispose } = setup({ defaultValue: ["apple"], ...gate });
      flush(() => api.removeAt(0));
      flush(() => api.clear());
      expect(api.value()).toEqual(["apple"]);
      dispose();
    }
  });
});

describe("createTagsInput — clear", () => {
  it("empties the list in one write", () => {
    const onChange = vi.fn();
    const { api, dispose } = setup({ defaultValue: ["apple", "banana"], onChange });
    flush(() => api.clear());
    expect(api.value()).toEqual([]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([]);
    dispose();
  });

  it("keeps disabled tags, and stays silent when they are all that is left", () => {
    const onChange = vi.fn();
    const { api, dispose } = setup({
      defaultValue: ["apple", "locked"],
      isItemDisabled: (tag) => tag === "locked",
      onChange,
    });
    flush(() => api.clear());
    expect(api.value()).toEqual(["locked"]);

    onChange.mockClear();
    flush(() => api.clear());
    expect(onChange).not.toHaveBeenCalled();
    dispose();
  });
});

describe("createTagsInput — controlled and uncontrolled", () => {
  it("holds the list internally when no `value` is passed", () => {
    const onChange = vi.fn();
    const { api, dispose } = setup({ defaultValue: ["apple"], onChange });
    flush(() => api.add("banana"));
    expect(api.value()).toEqual(["apple", "banana"]);
    expect(onChange).toHaveBeenCalledWith(["apple", "banana"]);
    dispose();
  });

  it("reports the consumer's `value` and only asks, never writes, when controlled", () => {
    const onChange = vi.fn();
    let api!: CreateTagsInputReturn<string>;
    let dispose!: () => void;
    createRoot((d) => {
      dispose = d;
      api = createTagsInput<string>({ value: ["apple"], onChange });
    });

    flush(() => api.add("banana"));
    // The consumer never moved the prop, so the list did not move either.
    expect(api.value()).toEqual(["apple"]);
    expect(onChange).toHaveBeenCalledWith(["apple", "banana"]);

    flush(() => api.removeAt(0));
    expect(api.value()).toEqual(["apple"]);
    expect(onChange).toHaveBeenLastCalledWith([]);
    dispose();
  });

  it("follows the controlled prop as it moves", () => {
    const [controlled, setControlled] = createSignal(["apple"]);
    let api!: CreateTagsInputReturn<string>;
    let dispose!: () => void;
    createRoot((d) => {
      dispose = d;
      api = createTagsInput<string>({
        get value() {
          return controlled();
        },
        onChange: (next) => setControlled(next),
      });
    });

    flush(() => api.add("banana"));
    expect(api.value()).toEqual(["apple", "banana"]);
    expect(api.indexOfValue("banana")).toBe(1);
    dispose();
  });

  it("switches mode with the prop, since the branch is decided on every read", () => {
    const [controlled, setControlled] = createSignal<string[] | undefined>(["apple"]);
    let api!: CreateTagsInputReturn<string>;
    let dispose!: () => void;
    createRoot((d) => {
      dispose = d;
      api = createTagsInput<string>({
        get value() {
          return controlled();
        },
        defaultValue: ["seed"],
      });
    });
    expect(api.value()).toEqual(["apple"]);

    flush(() => setControlled(undefined));
    expect(api.value()).toEqual(["seed"]);

    flush(() => api.add("banana"));
    expect(api.value()).toEqual(["seed", "banana"]);
    dispose();
  });
});

describe("createTagsInput — a callable tag type", () => {
  // Solid 2.0 overloads `createSignal`: a function-valued argument becomes a *compute function*, so
  // it is invoked and its return stored. The tag array dodges that by being an array, and the
  // duplicate marker dodges it by holding the `itemToValue` **string** rather than the tag itself.
  type Command = () => string;

  it("stores callable tags without invoking them, and marks a duplicate by value", () => {
    const hello: Command = () => "hello";
    const { api, dispose } = setup<Command>({
      defaultValue: [hello],
      itemToValue: (command) => command(),
      parse: (text) => () => text.trim(),
    });

    expect(nth(api.value(), 0)).toBe(hello);

    flush(() => api.add("bye"));
    expect(api.value()).toHaveLength(2);
    expect(nth(api.value(), 1)()).toBe("bye");

    let result!: ReturnType<typeof api.add>;
    flush(() => {
      result = api.add("hello");
    });
    expect(result.rejections).toEqual([{ reason: "duplicate", text: "hello" }]);
    expect(api.duplicateValue()).toBe("hello");
    expect(api.isDuplicate(hello)).toBe(true);
    dispose();
  });
});

describe("createTagsInput — the D7 field pass-throughs", () => {
  it("defaults every flag off and emits no aria-invalid", () => {
    const { api, dispose } = setup<string>({});
    expect(api.disabled()).toBe(false);
    expect(api.readOnly()).toBe(false);
    expect(api.required()).toBe(false);
    expect(api.invalid()).toBe(false);
    expect(api.isInteractive()).toBe(true);
    expect(api.ariaInvalid()).toBeUndefined();
    expect(api.ariaDescribedBy()).toBeUndefined();
    dispose();
  });

  it("derives aria-invalid from `invalid`, and lets the consumer's win", () => {
    const derived = setup<string>({ invalid: true });
    expect(derived.api.ariaInvalid()).toBe("true");
    derived.dispose();

    const explicit = setup<string>({ invalid: true, "aria-invalid": "grammar" });
    expect(explicit.api.ariaInvalid()).toBe("grammar");
    explicit.dispose();
  });

  it("passes aria-describedby and `required` through untouched", () => {
    const { api, dispose } = setup<string>({ "aria-describedby": "hint", required: true });
    expect(api.ariaDescribedBy()).toBe("hint");
    expect(api.required()).toBe(true);
    dispose();
  });

  it("tracks a reactive flag rather than latching it", () => {
    const [disabled, setDisabled] = createSignal(false);
    let api!: CreateTagsInputReturn<string>;
    let dispose!: () => void;
    createRoot((d) => {
      dispose = d;
      api = createTagsInput<string>({
        get disabled() {
          return disabled();
        },
      });
    });
    expect(api.isInteractive()).toBe(true);
    flush(() => setDisabled(true));
    expect(api.isInteractive()).toBe(false);
    dispose();
  });
});

describe("createTagsInput — navigation wiring", () => {
  it("exposes the chips as a horizontal, non-wrapping run", () => {
    const { api, dispose } = setup({ defaultValue: ["apple", "banana", "cherry"] });
    expect(api.focus.items()).toHaveLength(3);
    expect(nth(api.focus.items(), 0).textValue()).toBe("apple");

    flush(() => api.navigation.last());
    expect(api.focus.activeIndex()).toBe(2);
    // `wrap: false` — the part hook peeks this to decide "go back to the text field instead".
    expect(api.navigation.peekNext()).toBe(-1);

    flush(() => api.navigation.prev());
    expect(api.focus.activeIndex()).toBe(1);
    dispose();
  });

  it("skips disabled chips", () => {
    const { api, dispose } = setup({
      defaultValue: ["apple", "locked", "cherry"],
      isItemDisabled: (tag) => tag === "locked",
    });
    flush(() => api.navigation.first());
    expect(api.focus.activeIndex()).toBe(0);
    flush(() => api.navigation.next());
    expect(api.focus.activeIndex()).toBe(2);
    dispose();
  });

  it("reads the chip label from itemToLabel", () => {
    const { api, dispose } = setup<Email>({
      defaultValue: [{ address: "a@b.c" }],
      itemToValue: (email) => email.address,
      itemToLabel: (email) => email.address.split("@")[0] ?? "",
      parse: (text) => ({ address: text.trim() }),
    });
    expect(nth(api.focus.items(), 0).textValue()).toBe("a");
    dispose();
  });

  it("drops the chip highlight when focus returns to the text field (D10)", () => {
    const { api, dispose } = setup({ defaultValue: ["apple", "banana"] });
    flush(() => api.navigation.first());
    expect(api.focus.activeIndex()).toBe(0);

    // The DOM half — actually focusing the input — is a browser concern; what matters here is that
    // the index is cleared *first*, so `createListFocus`'s re-homing effect returns early on the
    // removal that follows.
    flush(() => api.focusInput());
    expect(api.focus.activeIndex()).toBe(-1);
    dispose();
  });

  it("mirrors the keymap against an explicit dir", () => {
    const { api, dispose } = setup({ defaultValue: ["apple"], dir: "rtl" });
    expect(api.direction()).toBe("rtl");
    dispose();
  });
});

describe("createTagsInput — the D3 conditional parse requirement", () => {
  it("requires `parse` for a non-string tag type and not for `string`", () => {
    // @ts-expect-error — the directive IS the assertion: `pnpm typecheck` fails the moment this
    // starts compiling. Without it an object tag would silently receive `text.trim()` as its `V`.
    const withoutParse: CreateTagsInputOptions<Email> = { itemToValue: (email) => email.address };

    const withParse: CreateTagsInputOptions<Email> = {
      itemToValue: (email) => email.address,
      parse: (text) => (text.includes("@") ? { address: text.trim() } : null),
    };
    const stringTags: CreateTagsInputOptions<string> = { defaultValue: ["apple"] };

    expect([withoutParse, withParse, stringTags]).toHaveLength(3);
  });
});
