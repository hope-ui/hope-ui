const npmInstall = "npm install @hope-ui/solid @stitches/core solid-transition-group";
const yarnAdd = "yarn add @hope-ui/solid @stitches/core solid-transition-group";
const pnpmAdd = "pnpm add @hope-ui/solid @stitches/core solid-transition-group";

const providerSetup = `// 1. import \`HopeProvider\` component
import { HopeProvider } from '@hope-ui/solid'

// 2. Wrap HopeProvider at the root of your app
function App() {
  return (
    <HopeProvider>
      <MyApp />
    </HopeProvider>
  )
}`;

const customizeTheme = `// 1. Import the \`HopeThemeConfig\` type
import { HopeThemeConfig, HopeProvider } from '@hope-ui/solid'

// 2. Create a theme config to include custom colors, fonts, etc
const config: HopeThemeConfig = {
  lightTheme: {
    colors: {
      primary9: "salmon"
    }
  }
}

// 3. Pass the \`config\` prop to the \`HopeProvider\`
function App() {
  return (
    <HopeProvider config={config}>
      <MyApp />
    </HopeProvider>
  )
}`;

export const snippets = {
  npmInstall,
  yarnAdd,
  pnpmAdd,
  providerSetup,
  customizeTheme,
};
