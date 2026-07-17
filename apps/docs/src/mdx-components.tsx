import { Dynamic } from "@solidjs/web";
import type { Component } from "solid-js";
import { CodeBlock } from "~/components/CodeBlock";
import { Preview } from "~/components/Preview";

// MDX funnels every intrinsic element through `_components.<tag>` and calls it
// as a component. Its built-in defaults map each tag to a STRING ("h1"), which
// works for a React-style jsx() runtime but not for Solid's compiler, which
// calls the value as a function — calling "h1" throws / renders nothing.
//
// This provider replaces those string defaults with real Solid components that
// render the host element via <Dynamic>.
type AnyProps = Record<string, unknown>;

const HTML_TAGS = [
  "a",
  "blockquote",
  "br",
  "code",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "li",
  "mark",
  "ol",
  "p",
  "pre",
  "strong",
  "ul",
  "span",
  "div",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "del",
  "input",
] as const;

const hostComponents: Record<string, Component<AnyProps>> = {};
for (const tag of HTML_TAGS) {
  hostComponents[tag] = (props) => <Dynamic component={tag} {...props} />;
}

// Code blocks: swap the bare <pre> passthrough for the copy-button wrapper.
hostComponents.pre = CodeBlock as Component<AnyProps>;

// Doc primitives usable in any .mdx without an explicit import (MDX routes any
// capitalized name it can't resolve locally through this provider). `Preview` is
// the centered live-demo canvas that fuses with a following code block.
hostComponents.Preview = Preview as Component<AnyProps>;

// rehype-pretty-code wraps every code block in <figure data-rehype-pretty-code-figure>.
// It's the only source of <figure> here (markdown images don't produce one), so always
// mark it `not-prose` — otherwise @tailwindcss/typography restyles the highlighted
// <pre>/<code> and fights Shiki. The incoming class (if any) is preserved.
hostComponents.figure = (props) => (
  <Dynamic
    component="figure"
    {...props}
    class={["not-prose", props.class].filter(Boolean).join(" ")}
  />
);

export function useMDXComponents(
  extra?: Record<string, Component<AnyProps>>,
): Record<string, Component<AnyProps>> {
  return extra ? { ...hostComponents, ...extra } : hostComponents;
}
