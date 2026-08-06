import { createSignal } from "solid-js";

// The site's single light/dark source of truth. It used to be a local signal inside SiteHeader's
// toggle, which was fine while the header owned the only switch — the Theme Creator's live preview
// now has one too, and two independent signals meant the preview could sit in light mode while the
// page around it was dark. Both switches read and write this module instead, so there is one mode.
//
// The signal is module scope on purpose. The docs site is prerendered (SSG) and this is never
// written on the server: it seeds to "light", the server emits the light markup, and the stored
// preference is only applied after mount by `initColorMode`. So the hydrated markup always matches
// what was rendered, and the swap to the reader's real mode happens one tick later.

export type ColorMode = "light" | "dark";

const STORAGE_KEY = "hope-docs-theme";

const [colorMode, setSignal] = createSignal<ColorMode>("light");

export { colorMode };

/** `.dark` on `<html>` is what the hope preset's `dark` variant keys on. */
function applyToDocument(mode: ColorMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

/**
 * Adopts the stored preference — or the OS setting when there is none — and paints it. Client-only:
 * call it from `onSettled`, never during render, or the server and the client disagree.
 */
export function initColorMode() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const mode: ColorMode =
    stored === "dark" || stored === "light"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  applyToDocument(mode);
  setSignal(mode);
}

/** The one write path: paint it, remember it, publish it. Reached only from a user action. */
export function setColorMode(mode: ColorMode) {
  applyToDocument(mode);
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // localStorage may be unavailable (private mode, disabled). Persistence is best-effort.
  }
  setSignal(mode);
}

export function toggleColorMode() {
  setColorMode(colorMode() === "dark" ? "light" : "dark");
}
