import type { JSX } from "@solidjs/web";

// The part hierarchy of a compound component, drawn as a monospace tree — clearer than a
// comma-separated sentence for showing which parts nest inside which. Authored as structured
// data (a nested `AnatomyNode`) so the box-drawing connectors are computed, never hand-typed,
// and stay correct when a part is added or moved.
//
// Marked `not-prose` and owns its styling (like `DataTable`/`PropsTable`), so
// @tailwindcss/typography never restyles it; the `overflow-x-auto` wrapper keeps a wide tree
// from pushing the page body sideways on narrow viewports.

/** One node in the tree: a part `name`, an optional `note` (e.g. "auto"), and nested `children`. */
export type AnatomyNode = {
  name: string;
  note?: string;
  children?: AnatomyNode[];
};

type Line = { prefix: string; name: string; note?: string };

// Flatten the tree to lines, computing each line's box-drawing prefix. The root prints with no
// connector; every other node gets `├── ` (or `└── ` when last), and descendants inherit `│   `
// for still-open ancestors or `    ` past a closed one — the classic `tree(1)` layout.
function flatten(node: AnatomyNode, prefix: string, isRoot: boolean, isLast: boolean, acc: Line[]) {
  const connector = isRoot ? "" : isLast ? "└── " : "├── ";
  acc.push({ prefix: prefix + connector, name: node.name, note: node.note });
  const childPrefix = isRoot ? "" : prefix + (isLast ? "    " : "│   ");
  const children = node.children ?? [];
  children.forEach((child, index) => {
    flatten(child, childPrefix, false, index === children.length - 1, acc);
  });
}

export function Anatomy(props: { root: AnatomyNode }): JSX.Element {
  const lines: Line[] = [];
  flatten(props.root, "", true, true, lines);

  return (
    <div class="not-prose my-6 overflow-x-auto rounded-lg border border-subtle bg-surface-sunken p-4">
      <div class="font-mono text-sm leading-7 text-foreground">
        {lines.map((line) => (
          <div class="whitespace-pre">
            <span class="text-foreground-subtle">{line.prefix}</span>
            <span class="font-medium text-foreground">{line.name}</span>
            {line.note ? (
              <span class="text-foreground-subtle italic">{`  ${line.note}`}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
