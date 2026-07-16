import { Dynamic } from "@solidjs/web";
import type { Component } from "solid-js";

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
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "li",
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

export function useMDXComponents(
  extra?: Record<string, Component<AnyProps>>,
): Record<string, Component<AnyProps>> {
  return extra ? { ...hostComponents, ...extra } : hostComponents;
}
