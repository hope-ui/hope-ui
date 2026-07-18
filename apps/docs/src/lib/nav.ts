// The site's primary sections — the top-bar tabs on desktop and the section
// switcher inside the mobile drawer share this one list, so a new top-level
// section is added in exactly one place. `to` values are the section index
// routes; `label` is the display name. There is deliberately no "Home" entry —
// the brand wordmark links there (see SiteHeader).
export const PRIMARY_NAV = [
  { to: "/get-started", label: "Get started" },
  { to: "/components", label: "Components" },
  { to: "/changelog", label: "Changelog" },
] as const;

// The content-folder key for each primary section — matches the section names
// `lib/content.ts` derives from `content/<section>/…` and the `kind` a
// `DocsSection`/`SectionNav` is given. Used to turn a pathname into the section
// whose page list the mobile drawer should show.
const DOC_SECTIONS = new Set(["get-started", "components", "changelog"]);

/**
 * The docs section a pathname belongs to (`/components/button` -> `"components"`,
 * `/components` -> `"components"`), or `undefined` for the home page and any route
 * outside a docs section. Drives which section's page list the mobile drawer renders.
 */
export function sectionFromPathname(pathname: string): string | undefined {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && DOC_SECTIONS.has(segment) ? segment : undefined;
}
