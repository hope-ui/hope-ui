declare module "*.mdx" {
  import type { Component } from "solid-js";

  // A heading in the page's table of contents, as emitted by
  // @stefanprobst/rehype-extract-toc (nested by heading depth).
  export type TocEntry = {
    value: string;
    depth: number;
    id?: string;
    children?: TocEntry[];
  };

  const MDXComponent: Component;
  export default MDXComponent;

  // Injected by @stefanprobst/rehype-extract-toc/mdx (rehype plugin in
  // vite.config.ts). Always defined — an empty array when the page has no
  // headings — so consumers can pass it straight through.
  export const tableOfContents: TocEntry[];
}
