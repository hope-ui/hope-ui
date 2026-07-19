import { describe, expect, it } from "vitest";
import { renderFixture } from "./button-icons.ssr-entry";

describe("Button (icon components) SSR", () => {
  it("byte snapshot", async () => {
    const html = await renderFixture();
    expect(html).toMatchInlineSnapshot(
      `"<button _hk=00l0 type="button" class="relative inline-flex items-center justify-center whitespace-nowrap font-medium select-none border bg-clip-padding outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo data-pressed:translate-y-px data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:shadow-none data-disabled:opacity-disabled aria-busy:cursor-progress aria-busy:pointer-events-none aria-busy:shadow-none aria-busy:opacity-loading h-8 gap-1.5 text-sm rounded-lg has-data-[slot=button-start-decorator]:ps-2.5 has-data-[slot=button-end-decorator]:pe-2.5 bg-surface-raised text-foreground border-subtle shadow-xs hover:not-data-pressed:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed px-3" data-slot="button" ><span _hk=00a0 data-slot="button-start-decorator" class="inline-flex shrink-0 items-center justify-center [&amp;_svg]:size-5"><svg _hk=0020 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg></span><span _hk=00b data-slot="button-label" class="inline-flex items-center">Add item</span><span _hk=00g0 data-slot="button-end-decorator" class="inline-flex shrink-0 items-center justify-center [&amp;_svg]:size-5"><svg _hk=0040 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg></span></button>"`,
    );
  });
});
