const initialColorMode = `import { HopeThemeConfig, HopeProvider } from "@hope-ui/design-system"

// 1. Create a theme config
const config: HopeThemeConfig = {
  initialColorMode: "system", // 2. Add your color mode
  // rest of the config...
}

// 3. Pass the \`config\` prop to the \`HopeProvider\`
function App() {
  return (
    <HopeProvider config={config}>
      <MyApp />
    </HopeProvider>
  )
}`;

const useColorMode = `function ColorModeSwitcher() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Button onClick={toggleColorMode}>
      Toggle {colorMode() === 'light' ? 'dark' : 'light'}
    </Button>
  )
}`;

const useColorModeValue = `function StyleColorMode() {
  const { toggleColorMode } = useColorMode()

  const bg = useColorModeValue("$danger9", "$info9")
  const color = useColorModeValue("white", "$blackAlpha12")

  return (
    <>
      <Box mb="$4" p="$2" bg={bg()} color={color()}>
        This box's style will change based on the color mode.
      </Box>
      <Button size="sm" onClick={toggleColorMode}>
        Toggle Mode
      </Button>
    </>
  )
}`;

export const snippets = {
  initialColorMode,
  useColorMode,
  useColorModeValue,
};
