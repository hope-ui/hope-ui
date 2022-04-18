const importCssFunction = `import { css } from "@hope-ui/design-system"`;

const usingCssFunction = `import { css } from "@hope-ui/design-system"

const myButtonStyles = css({
  backgroundColor: "gainsboro",
  borderRadius: "9999px",
  fontSize: "13px",
  padding: "10px 15px",
  "&:hover": {
    backgroundColor: "lightgray",
  },
})

function MyButton() {
  return <button class={myButtonStyles()}>Button</button>
}`;

export const snippets = {
  importCssFunction,
  usingCssFunction,
};
