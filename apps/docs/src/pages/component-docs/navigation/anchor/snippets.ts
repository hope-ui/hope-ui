const importComponent = `import { Anchor } from "@hope-ui/solid"`;

const basicUsage = `<Anchor>Hope UI</Anchor>`;

const externalLink = `<Anchor href="https://hope-ui.com" external>
  Hope UI <IconExternalLink ml="2px" verticalAlign="text-bottom" />
</Anchor>`;

const anchorWithInlineText = `<Text>
  Did you know that{" "}
  <Anchor color="$primary10" href="#">
    Anchors can live inline with text
  </Anchor>
</Text>`;

const usageWithRoutingLibrary = `// 1. import the \`Link\` component
import { Link } from "solid-app-router"

// 2. Then use it like this
<Anchor as={Link} href="/home">Home</Anchor>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Anchor: {
      baseStyle: SystemStyleObject,
      defaultProps: ThemeableAnchorOptions
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  externalLink,
  anchorWithInlineText,
  usageWithRoutingLibrary,
  theming,
};
