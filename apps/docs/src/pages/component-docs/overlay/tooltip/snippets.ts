const importComponent = `import { Tooltip } from "@hope-ui/solid"`;

const basicUsage = `<Tooltip label="Hey, I'm here!">
  <span>Hover me</span>
</Tooltip>`;

const withArrow = `<Tooltip withArrow label="Search places">
  <IconSearch />
</Tooltip>`;

const withFocusableContent = `<Tooltip label="Search places">
  <Button>Button</Button>
</Tooltip>`;

const disabled = `<Tooltip disabled>
  <IconSearch />
</Tooltip>`;

const placement = `<VStack spacing="$6">
  <HStack spacing="$6">
    <Tooltip label="Top start" placement="top-start">
      <Button>Top-Start</Button>
    </Tooltip>

    <Tooltip label="Top" placement="top">
      <Button>Top</Button>
    </Tooltip>

    <Tooltip label="Top end" placement="top-end">
      <Button>Top-End</Button>
    </Tooltip>
  </HStack>

  <HStack spacing="$6">
    <Tooltip label="Right start" placement="right-start">
      <Button>Right-Start</Button>
    </Tooltip>

    <Tooltip label="Right" placement="right">
      <Button>Right</Button>
    </Tooltip>

    <Tooltip label="Right end" placement="right-end">
      <Button>Right-End</Button>
    </Tooltip>
  </HStack>

  <HStack spacing="$6">
    <Tooltip label="Bottom start" placement="bottom-start">
      <Button>Bottom Start</Button>
    </Tooltip>

    <Tooltip label="Bottom" placement="bottom">
      <Button>Bottom</Button>
    </Tooltip>

    <Tooltip label="Bottom end" placement="bottom-end">
      <Button>Bottom End</Button>
    </Tooltip>
  </HStack>

  <HStack spacing="$6">
    <Tooltip label="Left start" placement="left-start">
      <Button>Left-Start</Button>
    </Tooltip>

    <Tooltip label="Left" placement="left">
      <Button>Left</Button>
    </Tooltip>

    <Tooltip label="Left end" placement="left-end">
      <Button>Left-End</Button>
    </Tooltip>
  </HStack>
</VStack>`;

const moreExamples = `<Flex wrap="wrap" gap="$6">
  <Tooltip label="I close on click">
    <Button>Close on Click - true(default)</Button>
  </Tooltip>

  <Tooltip label="I don't close on click" closeOnClick={false}>
    <Button>Close on Click - false</Button>
  </Tooltip>

  <Tooltip label="I am always open" placement="top" opened>
    <Button>Always Open</Button>
  </Tooltip>

  <Tooltip label="I am open by default" placement="left" defaultOpened>
    <Button>Open on startup</Button>
  </Tooltip>

  <Tooltip label="Opened after 500ms" openDelay={500}>
    <Button>Delay Open - 500ms</Button>
  </Tooltip>

  <Tooltip label="Closed after 500ms" closeDelay={500}>
    <Button>Delay Close - 500ms</Button>
  </Tooltip>

  <Tooltip label="I have 12px arrow" withArrow arrowSize={12}>
    <Button>Arrow size - 12px</Button>
  </Tooltip>
</Flex>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Tooltip: {
      baseStyle: SystemStyleObject,
      defaultProps: ThemeableTooltipOptions
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  withArrow,
  withFocusableContent,
  disabled,
  placement,
  moreExamples,
  theming,
};
