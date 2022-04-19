import { Alert, AlertDescription, Anchor, hope, Text } from "@hope-ui/solid";
import Prism from "prismjs";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ColorScale, ColorScaleItem } from "@/components/ColorScale";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";

import { snippets } from "./snippets";

export default function DefaultTheme() {
  const previousLink: ContextualNavLink = {
    href: "/docs/features/hope-factory",
    label: "Hope factory",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/theming/customize-theme",
    label: "Customize theme",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#usage", label: "Usage" },
    { href: "#colors", label: "Colors" },
    { href: "#black-alpha", label: "Black alpha", indent: true },
    { href: "#white-alpha", label: "White alpha", indent: true },
    { href: "#primary", label: "Primary", indent: true },
    { href: "#accent", label: "Accent", indent: true },
    { href: "#neutral", label: "Neutral", indent: true },
    { href: "#success", label: "Success", indent: true },
    { href: "#info", label: "Info", indent: true },
    { href: "#warning", label: "Warning", indent: true },
    { href: "#danger", label: "Danger", indent: true },
    { href: "#typography", label: "Typography" },
    { href: "#space", label: "Space" },
    { href: "#sizes", label: "Sizes" },
    { href: "#radii", label: "Radii (Border radius)" },
    { href: "#shadows", label: "Shadows" },
    { href: "#z-indices", label: "z-index values" },
  ];

  const colors: {
    blackAlpha: ColorScaleItem[];
    whiteAlpha: ColorScaleItem[];
    primary: ColorScaleItem[];
    accent: ColorScaleItem[];
    neutral: ColorScaleItem[];
    success: ColorScaleItem[];
    info: ColorScaleItem[];
    warning: ColorScaleItem[];
    danger: ColorScaleItem[];
  } = {
    blackAlpha: [
      { name: "Black alpha 1", token: "blackAlpha1" },
      { name: "Black alpha 2", token: "blackAlpha2" },
      { name: "Black alpha 3", token: "blackAlpha3" },
      { name: "Black alpha 4", token: "blackAlpha4" },
      { name: "Black alpha 5", token: "blackAlpha5" },
      { name: "Black alpha 6", token: "blackAlpha6" },
      { name: "Black alpha 7", token: "blackAlpha7" },
      { name: "Black alpha 8", token: "blackAlpha8" },
      { name: "Black alpha 9", token: "blackAlpha9" },
      { name: "Black alpha 10", token: "blackAlpha10" },
      { name: "Black alpha 11", token: "blackAlpha11" },
      { name: "Black alpha 12", token: "blackAlpha12" },
    ],
    whiteAlpha: [
      { name: "White alpha 1", token: "whiteAlpha1" },
      { name: "White alpha 2", token: "whiteAlpha2" },
      { name: "White alpha 3", token: "whiteAlpha3" },
      { name: "White alpha 4", token: "whiteAlpha4" },
      { name: "White alpha 5", token: "whiteAlpha5" },
      { name: "White alpha 6", token: "whiteAlpha6" },
      { name: "White alpha 7", token: "whiteAlpha7" },
      { name: "White alpha 8", token: "whiteAlpha8" },
      { name: "White alpha 9", token: "whiteAlpha9" },
      { name: "White alpha 10", token: "whiteAlpha10" },
      { name: "White alpha 11", token: "whiteAlpha11" },
      { name: "White alpha 12", token: "whiteAlpha12" },
    ],
    primary: [
      { name: "Primary 1", token: "primary1" },
      { name: "Primary 2", token: "primary2" },
      { name: "Primary 3", token: "primary3" },
      { name: "Primary 4", token: "primary4" },
      { name: "Primary 5", token: "primary5" },
      { name: "Primary 6", token: "primary6" },
      { name: "Primary 7", token: "primary7" },
      { name: "Primary 8", token: "primary8" },
      { name: "Primary 9", token: "primary9" },
      { name: "Primary 10", token: "primary10" },
      { name: "Primary 11", token: "primary11" },
      { name: "Primary 12", token: "primary12" },
    ],
    accent: [
      { name: "Accent 1", token: "accent1" },
      { name: "Accent 2", token: "accent2" },
      { name: "Accent 3", token: "accent3" },
      { name: "Accent 4", token: "accent4" },
      { name: "Accent 5", token: "accent5" },
      { name: "Accent 6", token: "accent6" },
      { name: "Accent 7", token: "accent7" },
      { name: "Accent 8", token: "accent8" },
      { name: "Accent 9", token: "accent9" },
      { name: "Accent 10", token: "accent10" },
      { name: "Accent 11", token: "accent11" },
      { name: "Accent 12", token: "accent12" },
    ],
    neutral: [
      { name: "Neutral 1", token: "neutral1" },
      { name: "Neutral 2", token: "neutral2" },
      { name: "Neutral 3", token: "neutral3" },
      { name: "Neutral 4", token: "neutral4" },
      { name: "Neutral 5", token: "neutral5" },
      { name: "Neutral 6", token: "neutral6" },
      { name: "Neutral 7", token: "neutral7" },
      { name: "Neutral 8", token: "neutral8" },
      { name: "Neutral 9", token: "neutral9" },
      { name: "Neutral 10", token: "neutral10" },
      { name: "Neutral 11", token: "neutral11" },
      { name: "Neutral 12", token: "neutral12" },
    ],
    success: [
      { name: "Success 1", token: "success1" },
      { name: "Success 2", token: "success2" },
      { name: "Success 3", token: "success3" },
      { name: "Success 4", token: "success4" },
      { name: "Success 5", token: "success5" },
      { name: "Success 6", token: "success6" },
      { name: "Success 7", token: "success7" },
      { name: "Success 8", token: "success8" },
      { name: "Success 9", token: "success9" },
      { name: "Success 10", token: "success10" },
      { name: "Success 11", token: "success11" },
      { name: "Success 12", token: "success12" },
    ],
    info: [
      { name: "Info 1", token: "info1" },
      { name: "Info 2", token: "info2" },
      { name: "Info 3", token: "info3" },
      { name: "Info 4", token: "info4" },
      { name: "Info 5", token: "info5" },
      { name: "Info 6", token: "info6" },
      { name: "Info 7", token: "info7" },
      { name: "Info 8", token: "info8" },
      { name: "Info 9", token: "info9" },
      { name: "Info 10", token: "info10" },
      { name: "Info 11", token: "info11" },
      { name: "Info 12", token: "info12" },
    ],
    warning: [
      { name: "Warning 1", token: "warning1" },
      { name: "Warning 2", token: "warning2" },
      { name: "Warning 3", token: "warning3" },
      { name: "Warning 4", token: "warning4" },
      { name: "Warning 5", token: "warning5" },
      { name: "Warning 6", token: "warning6" },
      { name: "Warning 7", token: "warning7" },
      { name: "Warning 8", token: "warning8" },
      { name: "Warning 9", token: "warning9" },
      { name: "Warning 10", token: "warning10" },
      { name: "Warning 11", token: "warning11" },
      { name: "Warning 12", token: "warning12" },
    ],
    danger: [
      { name: "Danger 1", token: "danger1" },
      { name: "Danger 2", token: "danger2" },
      { name: "Danger 3", token: "danger3" },
      { name: "Danger 4", token: "danger4" },
      { name: "Danger 5", token: "danger5" },
      { name: "Danger 6", token: "danger6" },
      { name: "Danger 7", token: "danger7" },
      { name: "Danger 8", token: "danger8" },
      { name: "Danger 9", token: "danger9" },
      { name: "Danger 10", token: "danger10" },
      { name: "Danger 11", token: "danger11" },
      { name: "Danger 12", token: "danger12" },
    ],
  };

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout
      previousLink={previousLink}
      nextLink={nextLink}
      contextualNavLinks={contextualNavLinks}
    >
      <PageTitle>Default theme</PageTitle>
      <Text mb="$8">
        The theme object is where you define your application's color palette, type scale, font
        stacks, border radius values, and more.
      </Text>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5">
        Many CSS properties used in style props or stitches's <Code>css</Code> function are mapped
        to a scale from the Hope UI theme. The list of CSS property / theme token mapping is
        available on the{" "}
        <Anchor
          href="https://stitches.dev/docs/tokens#property-mapping"
          external
          color="$primary11"
          fontWeight="$semibold"
        >
          stitches
        </Anchor>{" "}
        documentation.
      </Text>
      <Text mb="$5">
        To apply a token you need to prefix it with a <Code>$</Code> sign.
      </Text>
      <CodeSnippet snippet={snippets.usage} mb="$12" />
      <SectionTitle id="colors">Colors</SectionTitle>
      <Text mb="$5">
        The <Code>colors</Code> key allows you to customize the color palettes for your project.
      </Text>
      <Text mb="$5">
        Hope UI uses{" "}
        <Anchor
          href="https://www.radix-ui.com/colors"
          external
          color="$primary11"
          fontWeight="$semibold"
        >
          Radix Colors
        </Anchor>{" "}
        in its default theme. Radix Colors are designed to be accessible, well-balanced, harmonious
        and provide light and dark palette for each of their colors.
      </Text>
      <Alert status="warning" mb="$5">
        <AlertDescription>
          Since Hope UI components are built with Radix Colors, unless you have any design skills,
          the recommended way of customizing colors is to pick a light and dark scale from Radix
          Colors in order to keep all components accessible and dark mode friendly.
        </AlertDescription>
      </Alert>
      <CodeSnippet snippet={snippets.colors} mb="$8" />
      <Text mb="$8">
        Below are the list of all colors available in the default Hope UI theme. For semantic colors
        like <Code>primary</Code>, switching to dark mode will show the proper hex values from the
        dark palette.
      </Text>
      <SectionSubtitle id="black-alpha">Black alpha</SectionSubtitle>
      <ColorScale scale={colors.blackAlpha} mb="$10" />

      <SectionSubtitle id="white-alpha">White alpha</SectionSubtitle>
      <ColorScale scale={colors.whiteAlpha} mb="$10" />

      <SectionSubtitle id="primary">Primary</SectionSubtitle>
      <ColorScale scale={colors.primary} mb="$10" />

      <SectionSubtitle id="accent">Accent</SectionSubtitle>
      <ColorScale scale={colors.accent} mb="$10" />

      <SectionSubtitle id="neutral">Neutral</SectionSubtitle>
      <ColorScale scale={colors.neutral} mb="$10" />

      <SectionSubtitle id="success">Success</SectionSubtitle>
      <ColorScale scale={colors.success} mb="$10" />

      <SectionSubtitle id="info">Info</SectionSubtitle>
      <ColorScale scale={colors.info} mb="$10" />

      <SectionSubtitle id="warning">Warning</SectionSubtitle>
      <ColorScale scale={colors.warning} mb="$10" />

      <SectionSubtitle id="danger">Danger</SectionSubtitle>
      <ColorScale scale={colors.danger} mb="$12" />

      <SectionTitle id="typography">Typography</SectionTitle>
      <Text mb="$2">
        To manage typography options, the theme object supports the following keys:
      </Text>
      <hope.ul ps="$5" mb="$5">
        <hope.li mb="$2">
          <Code>fonts</Code> (font families)
        </hope.li>
        <hope.li mb="$2">
          <Code>fontSizes</Code>
        </hope.li>
        <hope.li mb="$2">
          <Code>fontWeights</Code>
        </hope.li>
        <hope.li mb="$2">
          <Code>lineHeights</Code>
        </hope.li>
        <hope.li mb="$2">
          <Code>letterSpacings</Code>
        </hope.li>
      </hope.ul>
      <CodeSnippet snippet={snippets.typography} mb="$12" />

      <SectionTitle id="space">Space</SectionTitle>
      <Text mb="$5">
        The <Code>space</Code> key allows you to customize the global spacing scale for your
        project.
      </Text>
      <CodeSnippet snippet={snippets.space} mb="$5" />
      <Alert status="info" mb="$12">
        <AlertDescription>
          <Code>0_5</Code> actually means <Code>0.5</Code>, unfortunately stitches doesn't allow
          dots in theme token names.
        </AlertDescription>
      </Alert>

      <SectionTitle id="sizes">Sizes</SectionTitle>
      <Text mb="$5">
        The <Code>sizes</Code> key allows you to customize the global sizing of components you build
        for your project.
      </Text>
      <CodeSnippet snippet={snippets.sizes} mb="$12" />

      <SectionTitle id="radii">Radii (Border radius)</SectionTitle>
      <Text mb="$5">
        Hope UI provides a set of smooth corner radius values. The <Code>radii</Code> key allows you
        to customize the global radii scale for your project.
      </Text>
      <CodeSnippet snippet={snippets.radii} mb="$12" />

      <SectionTitle id="shadows">Shadows</SectionTitle>
      <Text mb="$5">
        Hope UI provides a default set of shadows. The <Code>shadows</Code> key allows you to
        customize the global shadow scale for your project.
      </Text>
      <CodeSnippet snippet={snippets.shadows} mb="$12" />

      <SectionTitle id="z-indices">z-index values</SectionTitle>
      <Text mb="$5">
        hope UI provides a set of z-indices out of the box to help control the stacking order of
        components.
      </Text>
      <CodeSnippet snippet={snippets.zIndices} />
    </PageLayout>
  );
}
