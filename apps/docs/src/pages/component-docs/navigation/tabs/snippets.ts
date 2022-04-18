const importComponent = `import { 
  Tabs, 
  TabList, 
  Tab,
  TabPanel
} from "@hope-ui/design-system"`;

const basicUsage = `<Tabs>
  <TabList>
    <Tab>One</Tab>
    <Tab>Two</Tab>
    <Tab>Three</Tab>
  </TabList>
  <TabPanel>1</TabPanel>
  <TabPanel>2</TabPanel>
  <TabPanel>3</TabPanel>
</Tabs>`;

const colors = `<VStack alignItems="stretch" spacing="$4">
  <For each={
    ["primary", "accent", "neutral", "success", "info", "warning", "danger"]
  }>
    {colorScheme => (
      <Tabs colorScheme={colorScheme}>
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>
        <TabPanel>1</TabPanel>
        <TabPanel>2</TabPanel>
        <TabPanel>3</TabPanel>
      </Tabs>
    )}
  </For>
</VStack>`;

const sizes = `<VStack alignItems="stretch" spacing="$4">
  <For each={["sm", "md", "lg"]}>
    {size => (
      <Tabs size={size}>
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>
        <TabPanel>1</TabPanel>
        <TabPanel>2</TabPanel>
        <TabPanel>3</TabPanel>
      </Tabs>
    )}
  </For>
</VStack>`;

const variants = `<VStack alignItems="stretch" spacing="$4">
  <For each={["underline", "outline", "cards", "pills"]}>
    {variant => (
      <Tabs variant={variant}>
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>
        <TabPanel>1</TabPanel>
        <TabPanel>2</TabPanel>
        <TabPanel>3</TabPanel>
      </Tabs>
    )}
  </For>
</VStack>`;

const aligments = `<VStack alignItems="stretch" spacing="$4">
  <For each={["start", "center", "apart", "end"]}>
    {alignment => (
      <Tabs alignment={alignment}>
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>
        <TabPanel>1</TabPanel>
        <TabPanel>2</TabPanel>
        <TabPanel>3</TabPanel>
      </Tabs>
    )}
  </For>
</VStack>`;

const orientation = `<Tabs orientation="vertical">
  <TabList>
    <Tab>One</Tab>
    <Tab>Two</Tab>
    <Tab>Three</Tab>
  </TabList>
  <TabPanel>1</TabPanel>
  <TabPanel>2</TabPanel>
  <TabPanel>3</TabPanel>
</Tabs>`;

const fitted = `<Tabs fitted>
  <TabList>
    <Tab>One</Tab>
    <Tab>Two</Tab>
    <Tab>Three</Tab>
  </TabList>
  <TabPanel>1</TabPanel>
  <TabPanel>2</TabPanel>
  <TabPanel>3</TabPanel>
</Tabs>`;

const disabled = `<Tabs>
  <TabList>
    <Tab>One</Tab>
    <Tab disabled>Two</Tab>
    <Tab>Three</Tab>
  </TabList>
  <TabPanel>1</TabPanel>
  <TabPanel>2</TabPanel>
  <TabPanel>3</TabPanel>
</Tabs>`;

const initialActive = `<Tabs defaultIndex={1}>
  <TabList>
    <Tab>One</Tab>
    <Tab>Two</Tab>
    <Tab>Three</Tab>
  </TabList>
  <TabPanel>1</TabPanel>
  <TabPanel>2</TabPanel>
  <TabPanel>3</TabPanel>
</Tabs>`;

const keepAlive = `<VStack alignItems="stretch" spacing="$4">
  <Tabs>
    <TabList>
      <Tab>One</Tab>
      <Tab>Two</Tab>
      <Tab>Three</Tab>
    </TabList>
    <TabPanel>
      <Input placeholder="Try typing, I lose my value when switching tabs" />
    </TabPanel>
    <TabPanel>2</TabPanel>
    <TabPanel>3</TabPanel>
  </Tabs>
  <Tabs keepAlive>
    <TabList>
      <Tab>One</Tab>
      <Tab>Two</Tab>
      <Tab>Three</Tab>
    </TabList>
    <TabPanel>
      <Input placeholder="Try typing, I stay alive when switching tabs" />
    </TabPanel>
    <TabPanel>2</TabPanel>
    <TabPanel>3</TabPanel>
  </Tabs>
</VStack>`;

const controlled = `function ControlledExample() {
  const [tabIndex, setTabIndex] = createSignal(0);

  const handleSliderChange = (event) => {
    setTabIndex(parseInt(event.target.value, 10));
  };

  const handleTabsChange = (index) => {
    setTabIndex(index);
  };

  return (
    <>
      <input 
        type="range" 
        min="0" 
        max="2" 
        value={tabIndex()} 
        onInput={handleSliderChange} 
      />
      <Tabs index={tabIndex()} onChange={handleTabsChange}>
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>
        <TabPanel>
          <p>Click the tabs or pull the slider around</p>
        </TabPanel>
        <TabPanel>
          <p>Yeah yeah. What's up?</p>
        </TabPanel>
        <TabPanel>
          <p>Oh, hello there.</p>
        </TabPanel>
      </Tabs>
    </>
  )
}`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Tabs: {
      baseStyle: {
        root: SystemStyleObject,
        tabList: SystemStyleObject,
        tab: SystemStyleObject,
        tabPanel: SystemStyleObject,
      },
      defaultProps: {
        root: ThemeableTabsOptions
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  colors,
  sizes,
  variants,
  aligments,
  orientation,
  fitted,
  disabled,
  initialActive,
  keepAlive,
  controlled,
  theming,
};
