import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Tree } from "./calendar.ssr-entry";

// `Tree` (from `calendar.ssr-entry.tsx`) is the single source of truth for the round-trip tree:
// `calendar.browser.test.tsx` hydrates the very same render. Hydration keys are allocated by walking
// the tree, so sharing one definition keeps the two halves structurally identical by construction.
// See the entry for why the render is deterministic (fixed locale / timeZone / focused month).

describe("Calendar SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(typeof html).toBe("string");
  });

  it("renders the group, heading, weekday headers and day cells", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toContain('role="group"');
    expect(html).toContain('role="grid"');
    expect(html).toContain("January 2020");
    // Weekday column headers (short names, full name in aria-label).
    expect(html).toContain('scope="col"');
    expect(html).toContain('aria-label="Sunday"');
    // A day cell with its full localized aria-label.
    expect(html).toContain("Wednesday, January 1, 2020");
  });

  it("gives the focused date the roving tab stop in the server markup", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    // The focused cell (Jan 15) is tabbable; the SSR markup carries a valid grid without JS.
    expect(html).toMatch(/tabindex="0"/);
    expect(html).toContain("data-focused");
  });

  it("matches its server output byte for byte", async () => {
    // Byte-for-byte because `hydrate()` matches on the `_hk` attribute, so "contains the right text"
    // is not enough. An **inline** snapshot, not a committed `.html` file, so a hydration subject
    // adds zero committed fixture files at any scale. The hydration-fixture bridge renders this same
    // `<Tree />` fresh into the `browser` project (see `vitest-hydration-bridge.ts`), so the snapshot
    // below and what the browser test hydrates cannot drift. Regenerate deliberately with
    // `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<div _hk=20h010 role="group" aria-label="Calendar" class="" ><div _hk=20h0120 ><button _hk=20h01220 type="button" aria-label="Previous month" >‹</button><button _hk=20h01240 type="button" id="205" >January 2020</button><button _hk=20h01260 type="button" aria-label="Next month" >›</button></div><table _hk=20h01d0 role="grid" aria-labelledby="205" data-view="month" tabindex="-1" ><thead _hk=20h01910 ><tr _hk=20h019120 ><th _hk=20h019121010 scope="col" aria-label="Sunday" >Sun</th><th _hk=20h019121110 scope="col" aria-label="Monday" >Mon</th><th _hk=20h019121210 scope="col" aria-label="Tuesday" >Tue</th><th _hk=20h019121310 scope="col" aria-label="Wednesday" >Wed</th><th _hk=20h019121410 scope="col" aria-label="Thursday" >Thu</th><th _hk=20h019121510 scope="col" aria-label="Friday" >Fri</th><th _hk=20h019121610 scope="col" aria-label="Saturday" >Sat</th></tr></thead><tbody _hk=20h01b0 ><tr _hk=20h01b1010 ><td _hk=20h01b1011060 role="gridcell" data-outside-month ><button _hk=20h01b1011040 type="button" tabindex="-1" aria-label="Sunday, December 29, 2019" >29</button></td><td _hk=20h01b1011160 role="gridcell" data-outside-month ><button _hk=20h01b1011140 type="button" tabindex="-1" aria-label="Monday, December 30, 2019" >30</button></td><td _hk=20h01b1011260 role="gridcell" data-outside-month ><button _hk=20h01b1011240 type="button" tabindex="-1" aria-label="Tuesday, December 31, 2019" >31</button></td><td _hk=20h01b1011360 role="gridcell" ><button _hk=20h01b1011340 type="button" tabindex="-1" aria-label="Wednesday, January 1, 2020" >1</button></td><td _hk=20h01b1011460 role="gridcell" ><button _hk=20h01b1011440 type="button" tabindex="-1" aria-label="Thursday, January 2, 2020" >2</button></td><td _hk=20h01b1011560 role="gridcell" ><button _hk=20h01b1011540 type="button" tabindex="-1" aria-label="Friday, January 3, 2020" >3</button></td><td _hk=20h01b1011660 role="gridcell" ><button _hk=20h01b1011640 type="button" tabindex="-1" aria-label="Saturday, January 4, 2020" >4</button></td></tr><tr _hk=20h01b1110 ><td _hk=20h01b1111060 role="gridcell" ><button _hk=20h01b1111040 type="button" tabindex="-1" aria-label="Sunday, January 5, 2020" >5</button></td><td _hk=20h01b1111160 role="gridcell" ><button _hk=20h01b1111140 type="button" tabindex="-1" aria-label="Monday, January 6, 2020" >6</button></td><td _hk=20h01b1111260 role="gridcell" ><button _hk=20h01b1111240 type="button" tabindex="-1" aria-label="Tuesday, January 7, 2020" >7</button></td><td _hk=20h01b1111360 role="gridcell" ><button _hk=20h01b1111340 type="button" tabindex="-1" aria-label="Wednesday, January 8, 2020" >8</button></td><td _hk=20h01b1111460 role="gridcell" ><button _hk=20h01b1111440 type="button" tabindex="-1" aria-label="Thursday, January 9, 2020" >9</button></td><td _hk=20h01b1111560 role="gridcell" ><button _hk=20h01b1111540 type="button" tabindex="-1" aria-label="Friday, January 10, 2020" >10</button></td><td _hk=20h01b1111660 role="gridcell" ><button _hk=20h01b1111640 type="button" tabindex="-1" aria-label="Saturday, January 11, 2020" >11</button></td></tr><tr _hk=20h01b1210 ><td _hk=20h01b1211060 role="gridcell" ><button _hk=20h01b1211040 type="button" tabindex="-1" aria-label="Sunday, January 12, 2020" >12</button></td><td _hk=20h01b1211160 role="gridcell" ><button _hk=20h01b1211140 type="button" tabindex="-1" aria-label="Monday, January 13, 2020" >13</button></td><td _hk=20h01b1211260 role="gridcell" ><button _hk=20h01b1211240 type="button" tabindex="-1" aria-label="Tuesday, January 14, 2020" >14</button></td><td _hk=20h01b1211360 role="gridcell" data-focused ><button _hk=20h01b1211340 type="button" tabindex="0" aria-label="Wednesday, January 15, 2020" >15</button></td><td _hk=20h01b1211460 role="gridcell" ><button _hk=20h01b1211440 type="button" tabindex="-1" aria-label="Thursday, January 16, 2020" >16</button></td><td _hk=20h01b1211560 role="gridcell" ><button _hk=20h01b1211540 type="button" tabindex="-1" aria-label="Friday, January 17, 2020" >17</button></td><td _hk=20h01b1211660 role="gridcell" ><button _hk=20h01b1211640 type="button" tabindex="-1" aria-label="Saturday, January 18, 2020" >18</button></td></tr><tr _hk=20h01b1310 ><td _hk=20h01b1311060 role="gridcell" ><button _hk=20h01b1311040 type="button" tabindex="-1" aria-label="Sunday, January 19, 2020" >19</button></td><td _hk=20h01b1311160 role="gridcell" ><button _hk=20h01b1311140 type="button" tabindex="-1" aria-label="Monday, January 20, 2020" >20</button></td><td _hk=20h01b1311260 role="gridcell" ><button _hk=20h01b1311240 type="button" tabindex="-1" aria-label="Tuesday, January 21, 2020" >21</button></td><td _hk=20h01b1311360 role="gridcell" ><button _hk=20h01b1311340 type="button" tabindex="-1" aria-label="Wednesday, January 22, 2020" >22</button></td><td _hk=20h01b1311460 role="gridcell" ><button _hk=20h01b1311440 type="button" tabindex="-1" aria-label="Thursday, January 23, 2020" >23</button></td><td _hk=20h01b1311560 role="gridcell" ><button _hk=20h01b1311540 type="button" tabindex="-1" aria-label="Friday, January 24, 2020" >24</button></td><td _hk=20h01b1311660 role="gridcell" ><button _hk=20h01b1311640 type="button" tabindex="-1" aria-label="Saturday, January 25, 2020" >25</button></td></tr><tr _hk=20h01b1410 ><td _hk=20h01b1411060 role="gridcell" ><button _hk=20h01b1411040 type="button" tabindex="-1" aria-label="Sunday, January 26, 2020" >26</button></td><td _hk=20h01b1411160 role="gridcell" ><button _hk=20h01b1411140 type="button" tabindex="-1" aria-label="Monday, January 27, 2020" >27</button></td><td _hk=20h01b1411260 role="gridcell" ><button _hk=20h01b1411240 type="button" tabindex="-1" aria-label="Tuesday, January 28, 2020" >28</button></td><td _hk=20h01b1411360 role="gridcell" ><button _hk=20h01b1411340 type="button" tabindex="-1" aria-label="Wednesday, January 29, 2020" >29</button></td><td _hk=20h01b1411460 role="gridcell" ><button _hk=20h01b1411440 type="button" tabindex="-1" aria-label="Thursday, January 30, 2020" >30</button></td><td _hk=20h01b1411560 role="gridcell" ><button _hk=20h01b1411540 type="button" tabindex="-1" aria-label="Friday, January 31, 2020" >31</button></td><td _hk=20h01b1411660 role="gridcell" data-outside-month ><button _hk=20h01b1411640 type="button" tabindex="-1" aria-label="Saturday, February 1, 2020" >1</button></td></tr></tbody></table></div>"`,
    );
  });
});
