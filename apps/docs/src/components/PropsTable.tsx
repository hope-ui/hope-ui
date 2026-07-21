import type { JSX } from "@solidjs/web";
import { DataTable } from "./DataTable";

// The API props table: three columns — Prop, Default, and Type — where the Type
// cell stacks the type signature *above* its description rather than beside it,
// so long descriptions get the full column width and the table stays readable on
// narrow viewports. Built over `DataTable`, so it shares the table chrome,
// em-dash empties, and code styling.

/** One documented prop: its name, type, optional default, and optional description. */
export type PropRow = {
  prop: string;
  type: string;
  default?: string;
  description?: string;
};

export function PropsTable(props: { rows: PropRow[] }): JSX.Element {
  return (
    <DataTable
      columns={[
        { key: "prop", label: "Prop", code: true },
        { key: "default", label: "Default", code: true },
        { key: "type", label: "Type" },
      ]}
      rows={props.rows.map((row) => ({
        prop: row.prop,
        default: row.default,
        // Type on top (mono, emphasized), description stacked below (muted, wraps).
        type: (
          <div class="flex flex-col gap-1.5">
            <code class="w-fit whitespace-nowrap rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground">
              {row.type}
            </code>
            {row.description ? <span>{row.description}</span> : null}
          </div>
        ),
      }))}
    />
  );
}
