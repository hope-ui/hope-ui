import { For, Show } from "solid-js";
import { PathLink } from "~/components/PathLink";
import { groupedNavFor } from "~/lib/content";

// The auto-generated, category-grouped list of a section's pages — the single
// piece of section navigation, rendered in two places: the desktop left sidebar
// (`DocsSection`) and the mobile drawer (`MobileNav`). Keeping it here means the
// growing set of 40+ component pages stays in sync across both without touching
// either shell. Structure and derivation live entirely in `lib/content.ts`.
export function SectionNav(props: {
  kind: string;
  // Called after a page link is activated — the mobile drawer passes its close
  // handler so tapping a page dismisses the drawer; the sidebar omits it.
  onNavigate?: () => void;
}) {
  return (
    <For each={groupedNavFor(props.kind)}>
      {(group) => (
        <div>
          <Show when={group.group}>
            {(name) => (
              <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                {name()}
              </p>
            )}
          </Show>
          <ul class="space-y-0.5">
            <For each={group.items}>
              {(item) => (
                <li>
                  <PathLink
                    to={item.path}
                    class="block rounded-md px-3 py-1.5 text-sm text-foreground-muted transition-colors hover:bg-surface-raised-hovered hover:text-foreground"
                    activeProps={{
                      class: "bg-primary/10 font-medium text-primary",
                    }}
                    activeOptions={{ exact: true }}
                    onClick={() => props.onNavigate?.()}
                  >
                    {item.title}
                  </PathLink>
                </li>
              )}
            </For>
          </ul>
        </div>
      )}
    </For>
  );
}
