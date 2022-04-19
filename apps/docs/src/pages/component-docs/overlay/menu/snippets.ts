const importComponent = `import { 
  Menu,
  MenuTrigger,
  MenuContent,
  MenuGroup,
  MenuLabel,
  MenuItem
} from "@hope-ui/solid"`;

const basicUsage = `<Menu>
  <MenuTrigger
    as={Button}
    variant="subtle"
    colorScheme="neutral"
    rightIcon={<IconCaretDown boxSize="$6" />}
  >
    Actions
  </MenuTrigger>
  <MenuContent>
    <MenuItem>Download</MenuItem>
    <MenuItem>Create a Copy</MenuItem>
    <MenuItem>Mark as Draft</MenuItem>
    <MenuItem>Delete</MenuItem>
    <MenuItem>Attend a Workshop</MenuItem>
  </MenuContent>
</Menu>`;

const accessingInternalState = `<Menu>
  {({ opened }) => (
    <>
      <MenuTrigger
        as={Button}
        variant="subtle"
        colorScheme="neutral"
        rightIcon={<IconCaretDown boxSize="$6" />}
      >
        {opened() ? "Close" : "Open"}
      </MenuTrigger>
      <MenuContent>
        <MenuItem>Download</MenuItem>
        <MenuItem>Create a Copy</MenuItem>
        <MenuItem>Mark as Draft</MenuItem>
        <MenuItem>Delete</MenuItem>
        <MenuItem>Attend a Workshop</MenuItem>
      </MenuContent>
    </>
  )}
</Menu>`;

const iconsAndCommands = `<Menu>
  <MenuTrigger
    as={IconButton}
    variant="outline"
    colorScheme="neutral"
    icon={<IconHamburgerMenu />}
  />
  <MenuContent minW="$60">
    <MenuItem icon={<IconPlus />} command="⌘T">
      New Tab
    </MenuItem>
    <MenuItem icon={<IconExternalLink />} command="⌘N">
      New Window
    </MenuItem>
    <MenuItem icon={<IconRepeat />} command="⌘⇧N">
      Open Closed Tab
    </MenuItem>
    <MenuItem icon={<IconEdit />} command="⌘O">
      Open File...
    </MenuItem>
  </MenuContent>
</Menu>`;

const menuItemColors = `<Menu>
  <MenuTrigger
    as={Button}
    variant="subtle"
    colorScheme="neutral"
    rightIcon={<IconCaretDown boxSize="$6" />}
  >
    Actions
  </MenuTrigger>
  <MenuContent>
    <MenuItem colorScheme="primary">New File</MenuItem>
    <MenuItem colorScheme="accent">New Folder</MenuItem>
    <MenuItem colorScheme="neutral">Download</MenuItem>
    <MenuItem colorScheme="success">Create a Copy</MenuItem>
    <MenuItem colorScheme="info">Attend a Workshop</MenuItem>
    <MenuItem colorScheme="warning">Mark as Draft</MenuItem>
    <MenuItem colorScheme="danger">Delete</MenuItem>
  </MenuContent>
</Menu>`;

const disabledMenuItem = `<Menu>
  <MenuTrigger
    as={Button}
    variant="subtle"
    colorScheme="neutral"
    rightIcon={<IconCaretDown boxSize="$6" />}
  >
    Actions
  </MenuTrigger>
  <MenuContent>
    <MenuItem>Download</MenuItem>
    <MenuItem>Create a Copy</MenuItem>
    <MenuItem>Mark as Draft</MenuItem>
    <MenuItem disabled>Delete</MenuItem>
    <MenuItem>Attend a Workshop</MenuItem>
  </MenuContent>
</Menu>`;

const triggerAction = `<Menu>
  <MenuTrigger
    as={Button}
    variant="subtle"
    colorScheme="neutral"
    rightIcon={<IconCaretDown boxSize="$6" />}
  >
    Actions
  </MenuTrigger>
  <MenuContent>
    <MenuItem onSelect={() => alert("Downloading...")}>Download</MenuItem>
    <MenuItem onSelect={() => alert("Copying...")}>Create a Copy</MenuItem>
  </MenuContent>
</Menu>`;

const menuGroup = `<Menu>
  <MenuTrigger as={Button} colorScheme="info">
    Profile
  </MenuTrigger>
  <MenuContent>
    <MenuGroup>
      <MenuLabel>Profile</MenuLabel>
      <MenuItem>My Account</MenuItem>
      <MenuItem>Payments </MenuItem>
    </MenuGroup>
    <Divider role="presentation" my="$1" />
    <MenuGroup>
      <MenuLabel>Help</MenuLabel>
      <MenuItem>Docs</MenuItem>
      <MenuItem>FAQ</MenuItem>
    </MenuGroup>
  </MenuContent>
</Menu>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Menu: {
      baseStyle: {
        trigger: SystemStyleObject,
        content: SystemStyleObject,
        group: SystemStyleObject,
        label: SystemStyleObject,
        item: SystemStyleObject,
        itemText: SystemStyleObject,
        itemIconWrapper: SystemStyleObject,
        itemCommand: SystemStyleObject,
      },
      defaultProps: {
        root: ThemeableMenuOptions
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  accessingInternalState,
  iconsAndCommands,
  menuItemColors,
  disabledMenuItem,
  triggerAction,
  menuGroup,
  theming,
};
