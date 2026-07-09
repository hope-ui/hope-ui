# `createPresence`

Tracks mount/unmount timing across an exit CSS transition or animation, so a component
can stay in the DOM long enough for an authored exit animation to finish before actually
unmounting. Built fresh for solid-zero, modeled on Base UI's transition-status handling.

## API

```ts
function createPresence(options: {
  present: Accessor<boolean>;
  ref: Accessor<HTMLElement | null | undefined>;
}): {
  mounted: Accessor<boolean>;
  status: Accessor<"entering" | "entered" | "exiting" | "exited">;
};
```

- `present` — whether the content *should* be present.
- `ref` — the rendered element. Used only when `present` becomes `false`, to read its
  computed `transition-duration`/`animation-duration` and decide whether to wait for an
  end event before unmounting.
- `mounted` — whether the consumer should render its DOM output at all. Gate rendering
  on this, not on `present` directly, so the exit animation has something to animate.
- `status` — drives a `data-status` attribute for CSS: `"entering"` on the first frame
  after becoming present, flipping to `"entered"` on the next animation frame (so a CSS
  transition keyed off the `entering`→`entered` attribute change actually fires);
  `"exiting"` immediately when `present` becomes `false`; `"exited"` once unmounted.

## Behavior

If the rendered element has no authored `transition`/`animation` duration,
`getComputedStyle` reports `0s` and unmounting is immediate — this primitive never waits
indefinitely for an end event that a plain (unstyled) headless consumer will never fire.

## SSR

All `window`/DOM access happens inside `createEffect`. Never runs during SSR — the
initial `mounted`/`status` signal values are computed from `present()` synchronously
(no DOM read), so SSR output reflects the initial `present` state correctly.

## Example

```tsx
function Popup(props: { open: boolean }) {
  let ref: HTMLDivElement | undefined;
  const { mounted, status } = createPresence({ present: () => props.open, ref: () => ref });

  return (
    <Show when={mounted()}>
      <div ref={ref} data-status={status()}>
        content
      </div>
    </Show>
  );
}
```

```css
[data-status="entering"] { opacity: 0; }
[data-status="entered"] { opacity: 1; transition: opacity 150ms; }
[data-status="exiting"] { opacity: 0; transition: opacity 150ms; }
```
