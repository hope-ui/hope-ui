const importGlobalCssFunction = `import { globalCss } from "@hope-ui/solid"`;

const usingGlobalCssFunction = `import { globalCss } from "@hope-ui/solid"

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
