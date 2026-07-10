import { createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { withDefaults } from "./defaults";

describe("withDefaults", () => {
  it("applies the default when the key is absent", () => {
    const merged = withDefaults({} as { modal?: boolean }, { modal: true });
    expect(merged.modal).toBe(true);
  });

  it("applies the default when the key is present but undefined", () => {
    // The whole reason this primitive exists — see defaults.md.
    const merged = withDefaults({ modal: undefined } as { modal?: boolean }, { modal: true });
    expect(merged.modal).toBe(true);
  });

  it("lets an explicit falsy value override a truthy default", () => {
    expect(withDefaults({ modal: false }, { modal: true }).modal).toBe(false);
    expect(withDefaults({ count: 0 }, { count: 10 }).count).toBe(0);
  });

  it("leaves non-defaulted keys untouched", () => {
    const merged = withDefaults({ id: "x", modal: undefined } as { id: string; modal?: boolean }, {
      modal: true,
    });
    expect(merged.id).toBe("x");
    expect(merged.modal).toBe(true);
  });

  it("reads props lazily, so a reactive prop stays reactive", () => {
    // Two SolidJS 2.0 behaviors this test has to respect, neither obvious:
    //  - No `createRoot`: 2.0 throws [REACTIVE_WRITE_IN_OWNED_SCOPE] on a synchronous
    //    signal write inside a root's body, and `withDefaults` owns nothing anyway.
    //  - `flush()` around each write: solid-js's *client* build defers signal writes to a
    //    microtask, so a plain read straight after `setModal(false)` still sees the old
    //    value. (Its *server* build applies writes synchronously — the two builds disagree,
    //    and this project's unit project resolves the client one.)
    const [modal, setModal] = createSignal<boolean | undefined>(undefined);
    const merged = withDefaults(
      {
        get modal() {
          return modal();
        },
      },
      { modal: true },
    );

    expect(merged.modal).toBe(true); // falls back to the default
    flush(() => setModal(false));
    expect(merged.modal).toBe(false); // picks up the new value, no re-merge needed
    flush(() => setModal(undefined));
    expect(merged.modal).toBe(true); // and falls back again
  });

  it("does not evaluate props getters at call time", () => {
    let reads = 0;
    const props = {
      get modal(): boolean | undefined {
        reads++;
        return undefined;
      },
    };

    const merged = withDefaults(props, { modal: true });
    expect(reads).toBe(0);
    void merged.modal;
    expect(reads).toBe(1);
  });

  // The `merge` behavior this primitive exists to work around — a key resolved by presence,
  // not by value — is pinned in `../solid-contract.test.tsx`, alongside every other
  // undocumented SolidJS internal this codebase leans on. If stable changes it, that file
  // goes red first and `withDefaults` becomes unnecessary.
});
