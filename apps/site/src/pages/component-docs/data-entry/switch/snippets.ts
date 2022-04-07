const importComponent = `import { Switch, SwitchControl, SwitchLabel } from "@hope-ui/solid"`;

const basicUsage = `<Switch defaultChecked>
  <SwitchLabel>Switch</SwitchLabel>
  <SwitchControl />
</Switch>`;

const switchColors = `<HStack spacing="$4">
  <Switch defaultChecked colorScheme="primary">
    <SwitchControl />
  </Switch>
  <Switch defaultChecked colorScheme="accent">
    <SwitchControl />
  </Switch>
  <Switch defaultChecked colorScheme="neutral">
    <SwitchControl />
  </Switch>
  <Switch defaultChecked colorScheme="success">
    <SwitchControl />
  </Switch>
  <Switch defaultChecked colorScheme="info">
    <SwitchControl />
  </Switch>
  <Switch defaultChecked colorScheme="warning">
    <SwitchControl />
  </Switch>
  <Switch defaultChecked colorScheme="danger">
    <SwitchControl />
  </Switch>
</HStack>`;

const switchSizes = `<HStack spacing="$4">
  <Switch defaultChecked size="sm">
    <SwitchLabel>Switch</SwitchLabel>
    <SwitchControl />
  </Switch>
  <Switch defaultChecked size="md">
    <SwitchLabel>Switch</SwitchLabel>
    <SwitchControl />
  </Switch>
  <Switch defaultChecked size="lg">
    <SwitchLabel>Switch</SwitchLabel>
    <SwitchControl />
  </Switch>
</HStack>`;

const switchVariants = `<HStack spacing="$4">
  <Switch variant="filled">
    <SwitchLabel>Switch</SwitchLabel>
    <SwitchControl />
  </Switch>
  <Switch variant="outline">
    <SwitchLabel>Switch</SwitchLabel>
    <SwitchControl />
  </Switch>
</HStack>`;

const switchDisabled = `<HStack spacing="$4">
  <Switch disabled>
    <SwitchLabel>Switch</SwitchLabel>
    <SwitchControl />
  </Switch>
  <Switch variant="outline" disabled>
    <SwitchLabel>Switch</SwitchLabel>
    <SwitchControl />
  </Switch>
  <Switch defaultChecked disabled>
    <SwitchLabel>Switch</SwitchLabel>
    <SwitchControl />
  </Switch>
</HStack>`;

const switchInvalid = `<HStack spacing="$4">
  <Switch invalid>
    <SwitchLabel>Switch</SwitchLabel>
    <SwitchControl />
  </Switch>
  <Switch variant="outline" invalid>
    <SwitchLabel>Switch</SwitchLabel>
    <SwitchControl />
  </Switch>
  <Switch defaultChecked invalid>
    <SwitchLabel>Switch</SwitchLabel>
    <SwitchControl />
  </Switch>
</HStack>`;

const composition = `<Switch
  border="1px solid $neutral7"
  rounded="$sm"
  px="$5"
  py="$3"
  w="$full"
  transition="box-shadow 250ms"
  _focus={{
    borderColor: "$primary7",
    shadow: "0 0 0 3px $colors$primary5",
  }}
>
  <SwitchLabel w="$full">
    <VStack alignItems="flex-start">
      <Text size="sm" fontWeight="$semibold">
        Annual billing
      </Text>
      <Text size="xs" color="$neutral11">
        Save 10%
      </Text>
    </VStack>
  </SwitchLabel>
  <SwitchControl
    _focus={{
      borderColor: "$neutral7",
      shadow: "$none",
    }}
  />
</Switch>`;

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
  switchDisabled,
  switchInvalid,
  composition,
  theming,
};
