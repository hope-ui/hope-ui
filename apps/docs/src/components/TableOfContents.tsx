import type { MarkdownHeading } from "astro";
import { createEffect, createSignal, For, mergeProps } from "solid-js";

interface TableOfContentsProps {
  headings?: MarkdownHeading[];
}

export default function TableOfContents(props: TableOfContentsProps) {
  props = mergeProps({ headings: [] }, props);

  let itemOffsets: any[] = [];
  const [activeId, setActiveId] = createSignal<string | undefined>(undefined);

  createEffect(() => {
    const getItemOffsets = () => {
      const titles = document.querySelectorAll("article :is(h1, h2, h3, h4)");
      itemOffsets = Array.from(titles).map(title => ({
        id: title.id,
        topOffset: title.getBoundingClientRect().top + window.scrollY,
      }));
    };

    getItemOffsets();
    window.addEventListener("resize", getItemOffsets);

    return () => {
      window.removeEventListener("resize", getItemOffsets);
    };
  }, []);

  return (
    <>
      <h2 class="heading">On this page</h2>
      <ul>
        <li class={`heading-link depth-2 ${activeId() === "overview" ? "active" : ""}`.trim()}>
          <a href="#overview">Overview</a>
        </li>
        <For each={props.headings?.filter(({ depth }) => depth > 1 && depth < 4)}>
          {heading => (
            <li
              class={`heading-link depth-${heading.depth} ${
                activeId() === heading.slug ? "active" : ""
              }`.trim()}
            >
              <a href={`#${heading.slug}`}>{heading.text}</a>
            </li>
          )}
        </For>
      </ul>
    </>
  );
}
