import { Alert } from "@hope-ui/components/alert";
import type { JSX } from "@solidjs/web";

// Live demo for the "Polymorphism" section. The `render` prop swaps Alert.Root's host
// element while keeping all of its computed props and styling — here rendering a semantic
// <section> landmark instead of the default <div>. Lives in a demo (not inline in the MDX)
// because MDX routes lowercase host tags through its components provider, which doesn't
// whitelist <section>; a real .tsx file compiles it normally.
//
// Alert.Root's computed props are typed for its default <div>, so spreading them onto a
// different host element needs an `as unknown as` cast to satisfy TypeScript — the runtime
// behavior is unaffected (see the Badge polymorphism note in the docs).
export function AlertPolymorphismDemo() {
  return (
    <div class="not-prose w-full max-w-md">
      <Alert.Root
        variant="soft"
        colorScheme="info"
        title="Rendered as a section"
        description="Root is a <section> here, keeping all of Alert's props and styling."
        render={(props) => <section {...(props as unknown as JSX.HTMLAttributes<HTMLElement>)} />}
      />
    </div>
  );
}
