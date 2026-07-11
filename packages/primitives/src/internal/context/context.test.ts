import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";
import { createComponentContext } from "./context";

describe("createComponentContext", () => {
  it("provides the value to sub-components reading via the returned hook", () => {
    const [FooContext, useFooContext] = createComponentContext<string>("Foo");
    let read: string | undefined;

    createRoot((dispose) => {
      const resolveChildren = FooContext({
        value: "bar",
        get children() {
          read = useFooContext();
          return null;
        },
      });
      // The Provider wraps `children` in a lazy memo (see solid-js's `createContext`
      // implementation) — it only actually evaluates `props.children` once its
      // returned accessor is read, the same way it would once inserted into real DOM.
      // Its runtime shape (a callable accessor) isn't expressible in the public
      // `JSX.Element` type, hence the cast.
      (resolveChildren as unknown as () => void)();
      dispose();
    });

    expect(read).toBe("bar");
  });

  it("throws a friendly error when read outside a matching provider", () => {
    const [, useFooContext] = createComponentContext("Foo");

    createRoot((dispose) => {
      expect(() => useFooContext()).toThrow(
        "Foo sub-components must be rendered inside a Foo root component.",
      );
      dispose();
    });
  });
});
