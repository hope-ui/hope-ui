import { createFileRoute } from "@tanstack/solid-router";
import { ThemeCreator } from "~/components/theme-creator/ThemeCreator";
import { SITE } from "~/config";
import { seo } from "~/utils/seo";

// Standalone interactive page (like Home) — no content folder or sidebar, so it lives directly in
// PRIMARY_NAV, not DOC_SECTIONS. The app-wide <ThemeProvider preset={hope}> in __root already wraps
// the <Outlet/>, so the hope components in the preview get their recipes; the preview swaps only the
// `--hope-*` token *values* per subtree. `routeTree.gen.ts` regenerates via the TanStack vite plugin.
export const Route = createFileRoute("/theme-creator")({
  head: () => ({
    meta: seo({
      title: `Theme Creator — ${SITE.name}`,
      description:
        "Build a hope-ui theme visually: pick a color family per role and a corner radius, preview it live across real components, and copy a ready-to-paste theme.css.",
    }),
  }),
  component: ThemeCreator,
});
