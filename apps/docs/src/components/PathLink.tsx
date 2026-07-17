import type { JSX } from "@solidjs/web";
import { Link } from "@tanstack/solid-router";
import type { Component } from "solid-js";

// TanStack's <Link to> is strictly typed to the generated route patterns
// (e.g. `/components/$slug`), but the content-driven nav builds concrete resolved
// paths (`/components/button`). This thin retype lets those plain-string paths
// through while keeping the real runtime Link — client navigation, intent
// preloading (defaultPreload), and active-state matching all still apply.
export const PathLink = Link as unknown as Component<{
  to: string;
  class?: string;
  activeProps?: { class?: string };
  activeOptions?: { exact?: boolean };
  children: JSX.Element;
}>;
