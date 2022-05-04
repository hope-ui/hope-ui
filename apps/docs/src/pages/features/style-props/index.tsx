import { Alert, AlertDescription, Button, Text } from "@hope-ui/solid";
import Prism from "prismjs";
import { Link } from "solid-app-router";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";
import { StylePropsTable, StylePropsTableItem } from "@/components/StylePropsTable";

import { snippets } from "./snippets";

const marginPaddingProps: StylePropsTableItem[] = [
  { prop: "m, margin", cssProperty: "margin", themeToken: "space" },
  { prop: "mt, marginTop", cssProperty: "margin-top", themeToken: "space" },
  { prop: "mr, marginRight", cssProperty: "margin-right", themeToken: "space" },
  { prop: "ms, marginStart", cssProperty: "margin-inline-start", themeToken: "space" },
  { prop: "mb, marginBottom", cssProperty: "margin-bottom", themeToken: "space" },
  { prop: "ml, marginLeft", cssProperty: "margin-left", themeToken: "space" },
  { prop: "me, marginEnd", cssProperty: "margin-inline-end", themeToken: "space" },
  { prop: "mx", cssProperty: "margin-inline-start + margin-inline-end", themeToken: "space" },
  { prop: "my", cssProperty: "margin-top + margin-bottom", themeToken: "space" },

  { prop: "p, padding", cssProperty: "padding", themeToken: "space" },
  { prop: "pt, paddingTop", cssProperty: "padding-top", themeToken: "space" },
  { prop: "pr, paddingRight", cssProperty: "padding-right", themeToken: "space" },
  { prop: "ps, paddingStart", cssProperty: "padding-inline-start", themeToken: "space" },
  { prop: "pb, paddingBottom", cssProperty: "padding-bottom", themeToken: "space" },
  { prop: "pl, paddingLeft", cssProperty: "padding-left", themeToken: "space" },
  { prop: "pe, paddingEnd", cssProperty: "padding-inline-end", themeToken: "space" },
  { prop: "px", cssProperty: "padding-inline-start + padding-inline-end", themeToken: "space" },
  { prop: "py", cssProperty: "padding-top + padding-bottom", themeToken: "space" },
];

const colorProps: StylePropsTableItem[] = [
  { prop: "color", cssProperty: "color", themeToken: "colors" },
  { prop: "bg, background", cssProperty: "background", themeToken: "colors" },
  { prop: "bgColor, backgroundColor", cssProperty: "background-color", themeToken: "colors" },
  { prop: "opacity", cssProperty: "opacity" },
];

const typographyProps: StylePropsTableItem[] = [
  { prop: "fontFamily", cssProperty: "font-family", themeToken: "fonts" },
  { prop: "fontSize", cssProperty: "font-size", themeToken: "fontSizes" },
  { prop: "fontWeight", cssProperty: "font-weight", themeToken: "fontWeights" },
  { prop: "lineHeight", cssProperty: "line-height", themeToken: "lineHeights" },
  { prop: "letterSpacing", cssProperty: "letter-spacing", themeToken: "letterSpacings" },
  { prop: "textAlign", cssProperty: "text-align" },
  { prop: "fontStyle", cssProperty: "font-style" },
  { prop: "textTransform", cssProperty: "text-transform" },
  { prop: "textDecoration", cssProperty: "text-decoration" },
];

const layoutProps: StylePropsTableItem[] = [
  { prop: "d, display", cssProperty: "display" },
  { prop: "verticalAlign", cssProperty: "vertical-align" },
  { prop: "overflow", cssProperty: "overflow" },
  { prop: "overflowX", cssProperty: "overflow-x" },
  { prop: "overflowY", cssProperty: "overflow-y" },
];

const sizeProps: StylePropsTableItem[] = [
  { prop: "w, width", cssProperty: "width", themeToken: "sizes" },
  { prop: "h, height", cssProperty: "height", themeToken: "sizes" },
  { prop: "minW, minWidth", cssProperty: "min-width", themeToken: "sizes" },
  { prop: "maxW, maxWidth", cssProperty: "max-width", themeToken: "sizes" },
  { prop: "minH, minHeight", cssProperty: "min-height", themeToken: "sizes" },
  { prop: "maxH, maxHeight", cssProperty: "max-height", themeToken: "sizes" },
  { prop: "boxSize", cssProperty: "width + height", themeToken: "sizes" },
];

const flexboxProps: StylePropsTableItem[] = [
  { prop: "alignItems", cssProperty: "align-items" },
  { prop: "alignContent", cssProperty: "align-content" },
  { prop: "justifyItems", cssProperty: "justify-items" },
  { prop: "justifyContent", cssProperty: "justify-content" },
  { prop: "flexDirection, *direction", cssProperty: "flex-direction" },
  { prop: "flexWrap, *wrap", cssProperty: "flex-wrap" },
  { prop: "flex", cssProperty: "flex" },
  { prop: "flexGrow", cssProperty: "flex-grow" },
  { prop: "flexShrink", cssProperty: "flex-shrink" },
  { prop: "flexBasis", cssProperty: "flex-basis" },
  { prop: "alignSelf", cssProperty: "align-self" },
  { prop: "justifySelf", cssProperty: "justify-self" },
  { prop: "order", cssProperty: "order" },
];

const gridProps: StylePropsTableItem[] = [
  { prop: "gap", cssProperty: "gap", themeToken: "space" },
  { prop: "rowGap", cssProperty: "row-gap", themeToken: "space" },
  { prop: "columnGap", cssProperty: "column-gap", themeToken: "space" },
  { prop: "gridTemplate", cssProperty: "grid-template" },
  { prop: "gridTemplateColumns, *templateColumns", cssProperty: "grid-template-columns" },
  { prop: "gridTemplateRows, *templateRows", cssProperty: "grid-template-rows" },
  { prop: "gridTemplateAreas, *templateAreas", cssProperty: "grid-template-areas" },
  { prop: "gridArea, *area", cssProperty: "grid-area" },
  { prop: "gridRow", cssProperty: "grid-row" },
  { prop: "gridRowStart, *rowStart", cssProperty: "grid-row-start" },
  { prop: "gridRowEnd, *rowEnd", cssProperty: "grid-row-end" },
  { prop: "gridColumn", cssProperty: "grid-column" },
  { prop: "gridColumnStart, *colStart", cssProperty: "grid-column-start" },
  { prop: "gridColumnEnd, *colEnd", cssProperty: "grid-column-end" },
  { prop: "gridAutoFlow, *autoFlow", cssProperty: "grid-auto-flow" },
  { prop: "gridAutoColumns, *autoColumns", cssProperty: "grid-auto-columns" },
  { prop: "gridAutoRows, *autoRows", cssProperty: "grid-auto-rows" },
  { prop: "placeItems", cssProperty: "place-items" },
  { prop: "placeContent", cssProperty: "place-content" },
  { prop: "placeSelf", cssProperty: "place-self" },
];

const borderProps: StylePropsTableItem[] = [
  { prop: "border", cssProperty: "border" },
  { prop: "borderStyle", cssProperty: "border-style" },
  { prop: "borderWidth", cssProperty: "border-width", themeToken: "sizes" },
  { prop: "borderColor", cssProperty: "border-color", themeToken: "colors" },
  { prop: "borderTop", cssProperty: "border-top" },
  { prop: "borderTopStyle", cssProperty: "border-top-style" },
  { prop: "borderTopWidth", cssProperty: "border-top-width", themeToken: "sizes" },
  { prop: "borderTopColor", cssProperty: "border-top-color", themeToken: "colors" },
  { prop: "borderRight", cssProperty: "border-right" },
  { prop: "borderRightStyle", cssProperty: "border-right-style" },
  { prop: "borderRightWidth", cssProperty: "border-right-width", themeToken: "sizes" },
  { prop: "borderRightColor", cssProperty: "border-right-color", themeToken: "colors" },
  { prop: "borderBottom", cssProperty: "border-bottom" },
  { prop: "borderBottomStyle", cssProperty: "border-bottom-style" },
  { prop: "borderBottomWidth", cssProperty: "border-bottom-width", themeToken: "sizes" },
  { prop: "borderBottomColor", cssProperty: "border-bottom-color", themeToken: "colors" },
  { prop: "borderLeft", cssProperty: "border-left" },
  { prop: "borderLeftStyle", cssProperty: "border-left-style" },
  { prop: "borderLeftWidth", cssProperty: "border-left-width", themeToken: "sizes" },
  { prop: "borderLeftColor", cssProperty: "border-left-color", themeToken: "colors" },
  { prop: "borderX", cssProperty: "border-right + border-left" },
  { prop: "borderY", cssProperty: "border-top + border-bottom" },
];

const borderRadiusProps: StylePropsTableItem[] = [
  { prop: "borderRadius, rounded", cssProperty: "border-radius", themeToken: "radii" },
  { prop: "borderTopLeftRadius", cssProperty: "border-top-left-radius", themeToken: "radii" },
  { prop: "borderTopRightRadius", cssProperty: "border-top-right-radius", themeToken: "radii" },
  {
    prop: "borderBottomRightRadius",
    cssProperty: "border-bottom-right-radius",
    themeToken: "radii",
  },
  { prop: "borderBottomLeftRadius", cssProperty: "border-bottom-left-radius", themeToken: "radii" },
  {
    prop: "borderTopRadius",
    cssProperty: "border-top-left-radius + border-top-right-radius",
    themeToken: "radii",
  },
  {
    prop: "borderRightRadius",
    cssProperty: "border-top-right-radius + border-bottom-right-radius",
    themeToken: "radii",
  },
  {
    prop: "borderBottomRadius",
    cssProperty: "border-bottom-left-radius + border-bottom-right-radius",
    themeToken: "radii",
  },
  {
    prop: "borderLeftRadius",
    cssProperty: "border-top-left-radius + border-bottom-left-radius",
    themeToken: "radii",
  },
];

const positionProps: StylePropsTableItem[] = [
  { prop: "pos, position", cssProperty: "position" },
  { prop: "zIndex", cssProperty: "z-index", themeToken: "zIndices" },
  { prop: "top", cssProperty: "top", themeToken: "space" },
  { prop: "right", cssProperty: "right", themeToken: "space" },
  { prop: "bottom", cssProperty: "bottom", themeToken: "space" },
  { prop: "left", cssProperty: "left", themeToken: "space" },
];

const shadowProps: StylePropsTableItem[] = [
  { prop: "textShadow", cssProperty: "text-shadow", themeToken: "shadows" },
  { prop: "shadow, boxShadow", cssProperty: "box-shadow", themeToken: "shadows" },
];

const pseudoProps: StylePropsTableItem[] = [
  { prop: "_hover", cssProperty: "&:hover, &[data-hover]" },
  { prop: "_active", cssProperty: "&:active, &[data-active]" },
  { prop: "_focus", cssProperty: "&:focus, &[data-focus]" },
  { prop: "_highlighted", cssProperty: "&[data-highlighted]" },
  { prop: "_focusWithin", cssProperty: "&:focus-within" },
  { prop: "_focusVisible", cssProperty: "&:focus-visible" },
  { prop: "_disabled", cssProperty: "&[disabled], &[aria-disabled=true], &[data-disabled]" },
  { prop: "_readOnly", cssProperty: "&[aria-readonly=true], &[readonly], &[data-readonly]" },
  { prop: "_before", cssProperty: "&::before" },
  { prop: "_after", cssProperty: "&::after" },
  { prop: "_empty", cssProperty: "&:empty" },
  { prop: "_expanded", cssProperty: "&[aria-expanded=true], &[data-expanded]" },
  { prop: "_checked", cssProperty: "&[aria-checked=true], &[data-checked]" },
  { prop: "_grabbed", cssProperty: "&[aria-grabbed=true], &[data-grabbed]" },
  { prop: "_pressed", cssProperty: "&[aria-pressed=true], &[data-pressed]" },
  { prop: "_invalid", cssProperty: "&[aria-invalid=true], &[data-invalid]" },
  { prop: "_valid", cssProperty: "&[data-valid], &[data-state=valid]" },
  { prop: "_loading", cssProperty: "&[data-loading], &[aria-busy=true]" },
  { prop: "_selected", cssProperty: "&[aria-selected=true], &[data-selected]" },
  { prop: "_hidden", cssProperty: "&[hidden], &[data-hidden]" },
  { prop: "_even", cssProperty: "&:nth-of-type(even)" },
  { prop: "_odd", cssProperty: "&:nth-of-type(odd)" },
  { prop: "_first", cssProperty: "&:first-of-type" },
  { prop: "_last", cssProperty: "&:last-of-type" },
  { prop: "_notFirst", cssProperty: "&:not(:first-of-type)" },
  { prop: "_notLast", cssProperty: "&:not(:last-of-type)" },
  { prop: "_visited", cssProperty: "&:visited" },
  { prop: "_activeLink", cssProperty: "&[aria-current=page]" },
  { prop: "_activeStep", cssProperty: "&[aria-current=step]" },
  {
    prop: "_indeterminate",
    cssProperty: "&:indeterminate, &[aria-checked=mixed], &[data-indeterminate]",
  },
  {
    prop: "_groupHover",
    cssProperty:
      "[role=group]:hover &, [role=group][data-hover] &, [data-group]:hover &, [data-group][data-hover] &, .group:hover &, .group[data-hover] &",
  },
  {
    prop: "_peerHover",
    cssProperty:
      "[data-peer]:hover ~ &, [data-peer][data-hover] ~ &, .peer:hover ~ &, .peer[data-hover] ~ &",
  },
  {
    prop: "_groupFocus",
    cssProperty:
      "[role=group]:focus &, [role=group][data-focus] &, [data-group]:focus &, [data-group][data-focus] &, .group:focus &, .group[data-focus] &",
  },
  {
    prop: "_peerFocus",
    cssProperty:
      "[data-peer]:focus ~ &, [data-peer][data-focus] ~ &, .peer:focus ~ &, .peer[data-focus] ~ &",
  },
  {
    prop: "_groupFocusVisible",
    cssProperty:
      "[role=group]:focus-visible &, [data-group]:focus-visible &, .group:focus-visible &",
  },
  {
    prop: "_peerFocusVisible",
    cssProperty: "[data-peer]:focus-visible ~ &, .peer:focus-visible ~ &",
  },
  {
    prop: "_groupActive",
    cssProperty:
      "[role=group]:active &, [role=group][data-active] &, [data-group]:active &, [data-group][data-active] &, .group:active &, .group[data-active] &",
  },
  {
    prop: "_peerActive",
    cssProperty:
      "[data-peer]:active ~ &, [data-peer][data-active] ~ &, .peer:active ~ &, .peer[data-active] ~ &",
  },
  {
    prop: "_groupSelected",
    cssProperty:
      "[role=group][aria-selected=true] &, [role=group][data-selected] &, [data-group][aria-selected=true] &, [data-group][data-selected] &, .group[aria-selected=true] &, .group[data-selected] &",
  },
  {
    prop: "_peerSelected",
    cssProperty:
      "[data-peer][aria-selected=true] ~ &, [data-peer][data-selected] ~ &, .peer[aria-selected=true] ~ &, .peer[data-selected] ~ &",
  },
  {
    prop: "_groupDisabled",
    cssProperty:
      "[role=group]:disabled &, [role=group][data-disabled] &, [data-group]:disabled &, [data-group][data-disabled] &, .group:disabled &, .group[data-disabled] &",
  },
  {
    prop: "_peerDisabled",
    cssProperty:
      "[data-peer]:disabled ~ &, [data-peer][data-disabled] ~ &, .peer:disabled ~ &, .peer[data-disabled] ~ &",
  },
  {
    prop: "_groupInvalid",
    cssProperty:
      "[role=group]:invalid &, [role=group][data-invalid] &, [data-group]:invalid &, [data-group][data-invalid] &, .group:invalid &, .group[data-invalid] &",
  },
  {
    prop: "_peerInvalid",
    cssProperty:
      "[data-peer]:invalid ~ &, [data-peer][data-invalid] ~ &, .peer:invalid ~ &, .peer[data-invalid] ~ &",
  },
  {
    prop: "_groupChecked",
    cssProperty:
      "[role=group]:checked &, [role=group][data-checked] &, [data-group]:checked &, [data-group][data-checked] &, .group:checked &, .group[data-checked] &",
  },
  {
    prop: "_peerChecked",
    cssProperty:
      "[data-peer]:checked ~ &, [data-peer][data-checked] ~ &, .peer:checked ~ &, .peer[data-checked] ~ &",
  },
  {
    prop: "_groupFocusWithin",
    cssProperty: "[role=group]:focus-within &, [data-group]:focus-within &, .group:focus-within &",
  },
  { prop: "_peerFocusWithin", cssProperty: "[data-peer]:focus-within ~ &, .peer:focus-within ~ &" },
  {
    prop: "_peerPlaceholderShown",
    cssProperty: "[data-peer]:placeholder-shown ~ &, .peer:placeholder-shown ~ &",
  },
  { prop: "_placeholder", cssProperty: "&::placeholder" },
  { prop: "_placeholderShown", cssProperty: "&:placeholder-shown" },
  { prop: "_fullScreen", cssProperty: "&:fullscreen" },
  { prop: "_selection", cssProperty: "&::selection" },
  { prop: "_mediaDark", cssProperty: "@media (prefers-color-scheme: dark)" },
  { prop: "_mediaReduceMotion", cssProperty: "@media (prefers-reduced-motion: reduce)" },
  { prop: "_dark", cssProperty: ".hope-ui-dark &" },
  { prop: "_light", cssProperty: ".hope-ui-light &" },
];

const othersProps: StylePropsTableItem[] = [
  { prop: "appearance", cssProperty: "appearance" },
  { prop: "userSelect", cssProperty: "user-select" },
  { prop: "pointerEvents", cssProperty: "pointer-events" },
  { prop: "transition", cssProperty: "transition" },
  { prop: "resize", cssProperty: "resize" },
  { prop: "cursor", cssProperty: "cursor" },
  { prop: "outline", cssProperty: "outline" },
  { prop: "outlineOffset", cssProperty: "outline-offset" },
  { prop: "outlineColor", cssProperty: "outline-color" },
];

export default function StyleProps() {
  const previousLink: ContextualNavLink = {
    href: "/docs/changelog",
    label: "Changelog",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/features/css-prop",
    label: "The css prop",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#margin-padding", label: "Margin and padding" },
    { href: "#colors", label: "Colors" },
    { href: "#typography", label: "Typography" },
    { href: "#layout", label: "Layout" },
    { href: "#size", label: "Size" },
    { href: "#flexbox", label: "Flexbox" },
    { href: "#grid-layout", label: "Grid layout" },
    { href: "#border", label: "Borders" },
    { href: "#border-radius", label: "Border radius" },
    { href: "#position", label: "Position" },
    { href: "#shadow", label: "Shadow" },
    { href: "#pseudo", label: "Pseudo selectors" },
    { href: "#others", label: "Others" },
    { href: "#as-prop", label: "The `as` prop" },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout
      previousLink={previousLink}
      nextLink={nextLink}
      contextualNavLinks={contextualNavLinks}
    >
      <PageTitle>Style props</PageTitle>

      <Text mb="$6">
        Style props are a way to alter the style of a component by simply passing props to it. It
        helps to save time by providing helpful shorthand ways to style components.
      </Text>
      <SectionTitle>Reference</SectionTitle>
      <Text mb="$5">
        The following table shows a list of every style prop and the properties within each group.
      </Text>
      <SectionSubtitle id="margin-padding">Margin and padding</SectionSubtitle>
      <CodeSnippet snippet={snippets.marginPadding} mb="$8" />
      <StylePropsTable items={marginPaddingProps} mb="$12" />

      <SectionSubtitle id="colors">Color</SectionSubtitle>
      <CodeSnippet snippet={snippets.colors} mb="$8" />
      <StylePropsTable items={colorProps} mb="$12" />

      <SectionSubtitle id="typography">Typography</SectionSubtitle>
      <CodeSnippet snippet={snippets.typography} mb="$8" />
      <StylePropsTable items={typographyProps} mb="$12" />

      <SectionSubtitle id="layout">Layout</SectionSubtitle>
      <CodeSnippet snippet={snippets.layout} mb="$8" />
      <StylePropsTable items={layoutProps} mb="$12" />

      <SectionSubtitle id="size">Size</SectionSubtitle>
      <CodeSnippet snippet={snippets.size} mb="$8" />
      <StylePropsTable items={sizeProps} mb="$12" />

      <SectionSubtitle id="flexbox">Flexbox</SectionSubtitle>
      <CodeSnippet snippet={snippets.flexbox} mb="$4" />
      <Alert status="warning" mb="$8">
        <AlertDescription>
          Props marked with an <Code>*</Code> will only work if you use the <Code>Flex</Code> or{" "}
          <Code>Stack</Code> components.
        </AlertDescription>
      </Alert>
      <StylePropsTable items={flexboxProps} mb="$12" />

      <SectionSubtitle id="grid-layout">Grid layout</SectionSubtitle>
      <CodeSnippet snippet={snippets.grid} mb="$4" />
      <Alert status="warning" mb="$8">
        <AlertDescription>
          Props marked with an <Code>*</Code> will only work if you use the <Code>Grid</Code> and{" "}
          <Code>GridItem</Code> components.
        </AlertDescription>
      </Alert>
      <StylePropsTable items={gridProps} mb="$12" />

      <SectionSubtitle id="border">Borders</SectionSubtitle>
      <CodeSnippet snippet={snippets.borders} mb="$8" />
      <StylePropsTable items={borderProps} mb="$12" />

      <SectionSubtitle id="border-radius">Border radius</SectionSubtitle>
      <CodeSnippet snippet={snippets.borderRadius} mb="$8" />
      <StylePropsTable items={borderRadiusProps} mb="$12" />

      <SectionSubtitle id="position">Position</SectionSubtitle>
      <CodeSnippet snippet={snippets.position} mb="$8" />
      <StylePropsTable items={positionProps} mb="$12" />

      <SectionSubtitle id="shadow">Shadow</SectionSubtitle>
      <CodeSnippet snippet={snippets.shadow} mb="$8" />
      <StylePropsTable items={shadowProps} mb="$12" />

      <SectionSubtitle id="pseudo">Pseudo selectors</SectionSubtitle>
      <CodeSnippet snippet={snippets.pseudo} mb="$8" />
      <StylePropsTable items={pseudoProps} mb="$12" />

      <SectionSubtitle id="others">Others</SectionSubtitle>
      <StylePropsTable items={othersProps} mb="$12" />

      <SectionTitle id="as-prop">
        The <Code>as</Code> prop
      </SectionTitle>
      <Text mb="$5">
        All Hope UI components are polymorphic, meaning you can use the <Code>as</Code> prop to
        change the rendered element.
      </Text>
      <Text mb="$5">
        For example, say you are using a <Code>Button</Code> component, and you need to make it a
        link instead. You can compose <Code>a</Code> and <Code>Button</Code> like this:
      </Text>
      <Preview snippet={snippets.asPropWithHTMLElement} mb="$8">
        <Button as="a" target="_blank" href="https://solidjs.com/">
          Go to SolidJS website
        </Button>
      </Preview>
      <Text mb="$5">And it works with SolidJS components too:</Text>
      <Preview snippet={snippets.asPropWithComponent} mb="$5">
        <Button as={Link} href="/">
          Back to home
        </Button>
      </Preview>
      <Text>
        If you are using TypeScript you will get proper auto-completion based on the value of the{" "}
        <Code>as</Code> prop.
      </Text>
    </PageLayout>
  );
}
