const importHopeFactory = `import { hope } from "@hope-ui/solid"`;

const hopeJsxElements = `<hope.button 
  px="$3" 
  py="$2" 
  bg="$success7"
  rounded="$md" 
  _hover={{ bg: "$success8" }}
>
  Click me
</hope.button>`;

const hopeFactoryFunction = `import { hope } from "@hope-ui/solid"
import { Link } from "solid-app-router"

const HopeLink = hope(Link)

function Example() {
  return <HopeLink href="#" bg="$danger3" fontSize="12px" />
}`;

const attachingStyles = `const HopeLink = hope(Link, {
  baseClass: "my-link",
  baseStyle: {
    color: "$primary9"
  }
})
`;

const attachingStylesJsxElement = `const Card = hope("div", {
  baseClass: "my-card",
  baseStyle: {
    shadow: "$lg",
    rounded: "$lg",
    bg: "white",
  },
})`;

export const snippets = {
  importHopeFactory,
  hopeJsxElements,
  hopeFactoryFunction,
  attachingStyles,
  attachingStylesJsxElement,
};
