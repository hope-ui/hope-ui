const importComponent = `import { 
  SwitchPrimitive,
  SwitchPrimitiveThumb,
  Switch 
} from "@hope-ui/solid"`;

const basicUsage = `<Switch defaultChecked>Switch</Switch>`;

const switchColors = `<HStack spacing="$4">
  <Switch defaultChecked colorScheme="primary" />
  <Switch defaultChecked colorScheme="accent" />
  <Switch defaultChecked colorScheme="neutral" />
  <Switch defaultChecked colorScheme="success" />
  <Switch defaultChecked colorScheme="info" />
  <Switch defaultChecked colorScheme="warning" />
  <Switch defaultChecked colorScheme="danger" />
</HStack>`;

const switchSizes = `<HStack spacing="$4">
  <Switch defaultChecked size="sm">Switch</Switch>
  <Switch defaultChecked size="md">Switch</Switch>
  <Switch defaultChecked size="lg">Switch</Switch>
</HStack>`;

const switchVariants = `<HStack spacing="$4">
  <Switch variant="filled">Switch</Switch>
  <Switch variant="outline">Switch</Switch>
</HStack>`;

const switchLabelPlacement = `<HStack spacing="$4">
  <Switch LabelPlacement="start">Switch</Switch>
  <Switch LabelPlacement="end">Switch</Switch>
</HStack>`;

const switchDisabled = `<HStack spacing="$4">
  <Switch disabled>Switch</Switch>
  <Switch variant="outline" disabled>Switch</Switch>
  <Switch defaultChecked disabled>Switch</Switch>
</HStack>`;

const switchInvalid = `<HStack spacing="$4">
  <Switch invalid>Switch</Switch>
  <Switch variant="outline" invalid>Switch</Switch>
  <Switch defaultChecked invalid>Switch</Switch>
</HStack>`;

const headless = `import { css } from "@hope-ui/solid"

const switchRootClass = css({
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid $neutral7",
  rounded: "$sm",
  px: "$5",
  py: "$3",
  w: "$full",
  cursor: "pointer",
  userSelect: "none",
  transition: "box-shadow 250ms",

  _focus: {
    borderColor: "$primary7",
    shadow: "0 0 0 3px $colors$primary5",
  },
});

const switchControlClass = css({
  all: "unset",
  width: 34,
  height: 12,
  backgroundColor: "$blackAlpha9",
  borderRadius: "9999px",
  position: "relative",
  boxShadow: "0 2px 10px $colors$blackAlpha7",
  transition: "background-color 250ms",

  _groupChecked: {
    backgroundColor: "$primary9",
  },
});

const switchThumbClass = css({
  display: "block",
  width: 20,
  height: 20,
  backgroundColor: "white",
  borderRadius: "9999px",
  boxShadow: "0 0 2px $colors$blackAlpha7",
  transition: "transform 250ms",
  transform: "translate(-4px, -4px)",
  willChange: "transform",

  _checked: {
    transform: "translate(16px, -4px)",
  },
});

function HeadlessExample() {
  return (
    <SwitchPrimitive class={switchRootClass()}>
      <VStack w="$full" alignItems="flex-start">
        <Text size="sm" fontWeight="$semibold">
          Annual billing
        </Text>
        <Text size="xs" color="$neutral11">
          Save 10%
        </Text>
      </VStack>
      <Box class={switchControlClass()}>
        <SwitchPrimitiveThumb class={switchThumbClass()} />
      </Box>
    </SwitchPrimitive>
  );
}
`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Switch: {
      baseStyle: {
        root: SystemStyleObject,
        control: SystemStyleObject,
        label: SystemStyleObject,
      },
      defaultProps: {
        root: ThemeableSwitchOptions,
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  switchColors,
  switchSizes,
  switchVariants,
  switchLabelPlacement,
  switchDisabled,
  switchInvalid,
  headless,
  theming,
};
