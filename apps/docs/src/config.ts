// Single source of truth for the docs site's identity — the product name, one-line
// description, and version. Edit these here and every consumer (header wordmark + version
// badge, page <title>/meta, homepage hero, footer) picks the change up.
//
// Why is `version` here rather than read from a package.json? The published `@hope-ui/*`
// packages are all still `0.0.0` (unreleased — see the "no changesets until stable"
// policy), so the version shown in the docs is a marketing/product version maintained by
// hand. When the packages start publishing real versions, `version` can switch to
// importing the `version` field from the relevant package.json.
export const SITE = {
  /** Canonical brand name — the header wordmark, page titles, and homepage hero. */
  name: "hope-ui",
  /** One-line product description — SEO meta, homepage tagline, and footer. */
  description: "Elegant, themeable, accessible components for SolidJS.",
  /** Product version shown in the header badge. */
  version: "early-preview",
} as const;
