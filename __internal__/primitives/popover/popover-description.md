# `createPopoverDescription`

The description part of the [popover hook family](popover-root.md). Describes the popup.

```ts
function createPopoverDescription(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLParagraphElement>,
): { props: JSX.HTMLAttributes<HTMLParagraphElement> };
```

Mirrors [`createPopoverTitle`](popover-title.md) exactly — `withDefaults` over a generated
`createUniqueId`, registered through `createRegisteredId`, returning the **merged** props — against
the popup's `aria-describedby` instead of its `aria-labelledby`. **Call from the description's own
owner scope.**

Unlike the title, an absent description is not an accessibility failure: `role="dialog"` needs a name,
not a description. The generated-id default is still the right shape, because the two parts differing
in how they resolve an unset `id` would be a trap for whoever reads one and assumes the other.

That mirroring is also the hazard: `register: state.setTitleId` in this file type-checks and passes
every title assertion. `popover-description.browser.test.tsx` pins `state.descriptionId()` by name.

<!-- no-rejected-alternatives: mirrors createPopoverTitle exactly; popover-title.md owns the contested id-resolution decision -->

