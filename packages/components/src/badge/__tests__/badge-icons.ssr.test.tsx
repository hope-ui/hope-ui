import { describe, expect, it } from "vitest";
import { renderFixture } from "./badge-icons.ssr-entry";

describe("Badge (icon components) SSR", () => {
  it("byte snapshot", async () => {
    const html = await renderFixture();
    expect(html).toMatchInlineSnapshot(
      `"<span _hk=00j0 class="inline-flex items-center justify-center whitespace-nowrap align-middle font-medium select-none border h-5 gap-1 px-2 text-xs has-data-[slot=badge-start-decorator]:ps-1.5 has-data-[slot=badge-end-decorator]:pe-1.5 rounded-md bg-neutral-soft text-neutral-emphasis border-neutral-soft" data-slot="badge" ><span _hk=00b0 data-slot="badge-start-decorator" class="inline-flex shrink-0 items-center justify-center [&amp;_svg]:size-3.5"><svg _hk=0000 viewBox="0 0 8 8" aria-hidden="true"><circle cx="4" cy="4" r="3"></circle></svg></span><span _hk=00e0 data-slot="badge-label" class="inline-flex items-center">Live</span><span _hk=00h0 data-slot="badge-end-decorator" class="inline-flex shrink-0 items-center justify-center [&amp;_svg]:size-3.5"><svg _hk=0040 viewBox="0 0 8 8" aria-hidden="true"><circle cx="4" cy="4" r="3"></circle></svg></span></span>"`,
    );
  });
});
