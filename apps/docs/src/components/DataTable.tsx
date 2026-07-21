import type { JSX } from "@solidjs/web";

// A compact, themeable data table for docs — the slots, keyboard, and misc
// reference tables render through this one generic component. The API props
// table has its own wrapper (`PropsTable`) built on top of this.
//
// Why a component rather than a markdown table: this MDX pipeline has no
// `remark-gfm`, so pipe-syntax tables never parse. Authoring the table as JSX (a
// capitalized component the MDX imports) sidesteps that entirely, and gives full
// control over styling with hope's semantic tokens.
//
// It is marked `not-prose` and owns its own styling, so @tailwindcss/typography
// never restyles the cells; the horizontal `overflow-x-auto` wrapper keeps a wide
// table from pushing the page body sideways on narrow viewports.

/** One column: its data `key`, header `label`, and whether string cells render as `<code>`. */
export type Column = { key: string; label: string; code?: boolean };

/** One row: a value per column key. A missing/empty value renders as an em dash. */
export type Row = Record<string, string | JSX.Element>;

// Cells default to plain strings (deterministic, hydration-safe). A `code` column
// wraps a bare string in mono `<code>`; an already-built JSX cell passes through.
function renderCell(value: string | JSX.Element | undefined, code: boolean): JSX.Element {
  if (value == null || value === "") {
    return <span class="text-foreground-subtle">—</span>;
  }
  if (code && typeof value === "string") {
    return (
      <code class="whitespace-nowrap rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground">
        {value}
      </code>
    );
  }
  return value;
}

export function DataTable(props: { columns: Column[]; rows: Row[] }): JSX.Element {
  return (
    <div class="not-prose my-6 overflow-x-auto rounded-lg border border-subtle">
      <table class="w-full border-collapse text-left text-sm">
        <thead>
          <tr class="border-b border-subtle bg-surface-raised">
            {props.columns.map((col) => (
              <th class="px-4 py-2.5 font-semibold text-foreground">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody class="bg-surface">
          {props.rows.map((row) => (
            <tr class="border-b border-subtle align-top last:border-0">
              {props.columns.map((col) => (
                <td class="px-4 py-2.5 leading-relaxed text-foreground-muted">
                  {renderCell(row[col.key], col.code ?? false)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
