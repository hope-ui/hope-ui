import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => <Button>Click me</Button>);
    expect(typeof html).toBe("string");
  });

  it("renders the button label and disabled state", async () => {
    const html = await renderToStringAsync(() => <Button disabled>Click me</Button>);
    expect(html).toContain("Click me");
    expect(html).toMatch(/disabled/);
    expect(html).toMatch(/aria-disabled="true"/);
  });
});
