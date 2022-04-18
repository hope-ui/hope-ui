const importGlobalCssFunction = `import { globalCss } from "@hope-ui/design-system"`;

const usingGlobalCssFunction = `import { globalCss } from "@hope-ui/design-system"

const globalStyles = globalCss({
  '*': { 
    margin: 0, 
    padding: 0 
  },
});

function App() {
  globalStyles();

  return <MyApp />
}`;

export const snippets = {
  importGlobalCssFunction,
  usingGlobalCssFunction,
};
