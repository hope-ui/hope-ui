import type { JSX } from "@solidjs/web";
import { Link } from "@tanstack/solid-router";

export function NotFound({ children }: { children?: JSX.Element }) {
  return (
    <div class="space-y-2 p-2">
      <div class="text-foreground-muted">
        {children || <p>The page you are looking for does not exist.</p>}
      </div>
      <p class="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => window.history.back()}
          class="bg-neutral text-on-neutral px-2 py-1 rounded uppercase font-black text-sm"
        >
          Go back
        </button>
        <Link
          to="/"
          class="bg-primary text-on-primary px-2 py-1 rounded uppercase font-black text-sm"
        >
          Start Over
        </Link>
      </p>
    </div>
  );
}
