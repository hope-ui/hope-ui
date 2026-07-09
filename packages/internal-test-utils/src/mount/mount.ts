import type { JSX } from "@solidjs/web";
import { render as solidRender } from "@solidjs/web";

export interface MountedComponent {
  container: HTMLElement;
  dispose: () => void;
}

/**
 * Mounts a Solid component tree into a detached, document-attached container for
 * browser-mode tests, and returns a `dispose()` that unmounts + removes it.
 */
export function mount(ui: () => JSX.Element): MountedComponent {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const disposeSolid = solidRender(ui, container);

  return {
    container,
    dispose() {
      disposeSolid();
      container.remove();
    },
  };
}
