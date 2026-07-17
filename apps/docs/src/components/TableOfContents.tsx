import { createSignal, For, onSettled, Show } from "solid-js";

// Mirrors the shape emitted by @stefanprobst/rehype-extract-toc (and the ambient
// `tableOfContents` export declared in src/mdx.d.ts). Structurally compatible, so
// the module's export flows straight into `entries`.
export type TocEntry = {
  value: string;
  depth: number;
  id?: string;
  children?: TocEntry[];
};

// Flatten the nested heading tree into an in-order list, keeping only entries
// that have an id (anchor target) and skipping the page-title h1 — the ToC lists
// the sections below it.
function flatten(entries: TocEntry[]): TocEntry[] {
  const out: TocEntry[] = [];
  const walk = (list: TocEntry[]) => {
    for (const entry of list) {
      if (entry.id && entry.depth >= 2) {
        out.push(entry);
      }
      if (entry.children?.length) {
        walk(entry.children);
      }
    }
  };
  walk(entries);
  return out;
}

// A sticky "On this page" sidebar generated from an MDX module's `tableOfContents`
// export. The list itself is server-rendered (pure SSG); scroll-spy is a
// client-only enhancement wired in `onSettled` (never runs during SSR).
export function TableOfContents(props: { entries: TocEntry[]; class?: string }) {
  // `entries` comes from a static module import and never changes, so read it once.
  const items = flatten(props.entries);
  const [activeId, setActiveId] = createSignal<string | undefined>(items[0]?.id);

  onSettled(() => {
    const headings = items
      .map((item) => document.getElementById(item.id as string))
      .filter((el): el is HTMLElement => el != null);
    if (headings.length === 0) {
      return;
    }

    // Active = the last heading scrolled past an activation line near the top of
    // the viewport. This is robust on short pages (where an IntersectionObserver
    // band can be unreachable for the final section) and always resolves to one
    // item. At the very bottom of the page, pin the last heading.
    const ACTIVATION_OFFSET = 120;
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = headings[0].id;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= ACTIVATION_OFFSET) {
          current = heading.id;
        } else {
          break;
        }
      }
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        current = headings[headings.length - 1].id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // Solid 2.0: `onSettled` forbids `onCleanup` inside it — return the teardown.
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  });

  return (
    <Show when={items.length > 0}>
      <aside class={props.class}>
        <nav aria-label="Table of contents" class="sticky top-6 text-sm">
          <p class="mb-3 font-semibold text-gray-900 dark:text-gray-100">On this page</p>
          <ul class="border-l border-gray-200 dark:border-gray-800">
            <For each={items}>
              {(item) => (
                <li>
                  <a
                    href={`#${item.id}`}
                    // Reactive class string: `classList` is not honored in this
                    // Solid 2.0 build, so the active/idle classes are composed here.
                    class={`block py-1 leading-snug transition-colors ${
                      activeId() === item.id
                        ? "text-primary font-medium"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    }`}
                    style={{ "padding-left": `${(item.depth - 2) * 0.75 + 0.75}rem` }}
                  >
                    {item.value}
                  </a>
                </li>
              )}
            </For>
          </ul>
        </nav>
      </aside>
    </Show>
  );
}
