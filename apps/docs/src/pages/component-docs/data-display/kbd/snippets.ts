const importComponent = `import { Kbd } from "@hope-ui/solid"`;

const basicUsage = `<span>
  <Kbd>shift</Kbd> + <Kbd>H</Kbd>
</span>`;

const modifierPlus = `<span>
  <Kbd>shift</Kbd> + <Kbd>H</Kbd>
</span>`;

const modifierThen = `<span>
  <Kbd>shift</Kbd> then <Kbd>H</Kbd>
</span>`;

const modifierOr = `<span>
  <Kbd>alt</Kbd> or <Kbd>option</Kbd>
</span>`;

export const snippets = {
  importComponent,
  basicUsage,
  modifierPlus,
  modifierThen,
  modifierOr,
};
