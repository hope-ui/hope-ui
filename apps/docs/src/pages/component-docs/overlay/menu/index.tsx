import {
  Alert,
  AlertDescription,
  Anchor,
  Button,
  Divider,
  IconButton,
  Kbd,
  ListItem,
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuTrigger,
  Text,
  UnorderedList,
} from "@hope-ui/solid";
import Prism from "prismjs";
import { Link } from "solid-app-router";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";
import { IconCaretDown } from "@/icons/IconCaretDown";
import { IconEdit } from "@/icons/IconEdit";
import { IconExternalLink } from "@/icons/IconExternalLink";
import { IconHamburgerMenu } from "@/icons/IconHamburgerMenu";
import { IconPlus } from "@/icons/IconPlus";
import { IconRepeat } from "@/icons/IconRepeat";

import { snippets } from "./snippets";

export default function MenuDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/overlay/drawer",
    label: "Drawer",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/overlay/modal",
    label: "Modal",
  };
  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#accessing-internal-state", label: "Accessing the internal state", indent: true },
    { href: "#custom-menu-trigger", label: "Custom menu trigger", indent: true },
    { href: "#icons-and-commands", label: "Icons and commands", indent: true },
    { href: "#typeahead-behavior", label: "Typeahead behavior", indent: true },
    { href: "#menu-item-colors", label: "MenuItem colors", indent: true },
    { href: "#disabled-menu-item", label: "Disabled MenuItem", indent: true },
    {
      href: "#trigger-action",
      label: "Trigger an action when a MenuItem is selected",
      indent: true,
    },
    { href: "#menu-group", label: "MenuGroup", indent: true },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#menu-props", label: "Menu props", indent: true },
    { href: "#menu-item-props", label: "MenuItem props", indent: true },
    { href: "#other-components-props", label: "Other components props", indent: true },
  ];

  const menuPropItems: PropsTableItem[] = [
    {
      name: "id",
      description: "The `id` of the menu trigger.",
      type: "string",
    },
    {
      name: "children",
      description:
        "The children of the menu. Using a render prop gives access to the `opened` state.",
      type: "JSX.Element | (props: { opened: Accessor<boolean> }) => JSX.Element",
    },
    {
      name: "closeOnSelect",
      description: "If `true`, the menu will close when a menu item is selected.",
      type: "boolean",
      defaultValue: "true",
    },
    {
      name: "offset",
      description:
        "Offset between the menu content (dropdown panel) and the reference (trigger) element.",
      type: "number",
    },
    {
      name: "placement",
      description: "The placement of the menu content (dropdown panel).",
      type: "Placement",
      defaultValue: '"bottom-start"',
    },
    {
      name: "motionPreset",
      description: "The transition that should be used for the menu.",
      type: '"scale-top-left" | "scale-top-right" | "none"',
      defaultValue: '"scale-top-left"',
    },
  ];

  const menuItemPropItems: PropsTableItem[] = [
    {
      name: "colorScheme",
      description: "The color of the menu item.",
      type: '"primary" | "accent" | "neutral" | "success" | "info" | "warning" | "danger"',
      defaultValue: '"neutral"',
    },
    {
      name: "disabled",
      description: "If `true`, the menu item will be disabled.",
      type: "boolean",
      defaultValue: "true",
    },
    {
      name: "closeOnSelect",
      description: "If `true`, the menu will close when the menu item is selected.",
      type: "boolean",
      defaultValue: "true",
    },
    {
      name: "textValue",
      description:
        "Optional text used for typeahead purposes. By default the typeahead behavior will use the `.textContent` of the `MenuItem`. Use this when the content is complex, or you have non-textual content inside.",
      type: "string",
    },
    {
      name: "icon",
      description: "The icon to display next to the menu item text.",
      type: "JSX.Element",
    },
    {
      name: "iconSpacing",
      description: "The space between the icon and the menu item text.",
      type: 'MarginProps["marginRight"]',
      defaultValue: "0.5rem",
    },
    {
      name: "command",
      description: "Right-aligned label text content, useful for displaying hotkeys.",
      type: "string",
    },
    {
      name: "commandSpacing",
      description: "The space between the command and the menu item text.",
      type: 'MarginProps["marginLeft"]',
      defaultValue: "0.5rem",
    },
    {
      name: "onSelect",
      description:
        "Event handler called when the user selects a menu item (via mouse or keyboard).",
      type: "() => void",
    },
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
      <PageTitle>Menu</PageTitle>
      <Text mb="$5">
        An accessible dropdown menu for the common dropdown menu button design pattern.{" "}
        <Code>Menu</Code> implement the{" "}
        <Anchor
          href="https://www.w3.org/TR/wai-aria-practices-1.2/examples/menu-button/menu-button-actions-active-descendant.html"
          external
          color="$primary11"
          fontWeight="$semibold"
        >
          WAI ARIA Actions Menu Button
        </Anchor>{" "}
        design pattern.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>Menu:</strong> The wrapper component that provides context for all its children.
        </ListItem>
        <ListItem>
          <strong>MenuTrigger:</strong> The trigger that toggles the menu.
        </ListItem>
        <ListItem>
          <strong>MenuContent:</strong> The component that pops out when the menu is open.
        </ListItem>
        <ListItem>
          <strong>MenuGroup:</strong> The component used to group multiple menu item.
        </ListItem>
        <ListItem>
          <strong>MenuLabel:</strong> The component used to render the label of a group.
        </ListItem>
        <ListItem>
          <strong>MenuItem:</strong> An item of the menu.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Menu>
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
        </Menu>
      </Preview>
      <SectionSubtitle id="accessing-internal-state">Accessing the internal state</SectionSubtitle>
      <Text mb="$5">
        To access the internal state of the <Code>Menu</Code>, use a function as children (commonly
        known as a render prop). You'll get access to the internal <Code>opened</Code> state.
      </Text>
      <Preview snippet={snippets.accessingInternalState} mb="$10">
        <Menu>
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
        </Menu>
      </Preview>
      <SectionSubtitle id="custom-menu-trigger">Custom menu trigger</SectionSubtitle>
      <Text mb="$3">
        The default <Code>MenuTrigger</Code> can be styled using the usual styled-system props, but
        it starts off plainly styled.
      </Text>
      <Text mb="$12">
        You can use the <Code>as</Code> prop to render a custom component instead of the default{" "}
        <Code>MenuTrigger</Code>. For instance, you can use Hope UI's <Code>Button</Code> component,
        or your own custom component.
      </Text>
      <SectionSubtitle id="icons-and-commands">Icons and commands</SectionSubtitle>
      <Text mb="$5">
        You can add icon to each <Code>MenuItem</Code> by passing the <Code>icon</Code> prop. To add
        a commands (or hotkeys) to menu items, you can use the <Code>command</Code> prop.
      </Text>
      <Preview snippet={snippets.iconsAndCommands} mb="$10">
        <Menu>
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
        </Menu>
      </Preview>
      <SectionSubtitle id="typeahead-behavior">Typeahead behavior</SectionSubtitle>
      <Text mb="$5">
        When focus is on the <Code>MenuTrigger</Code> or within the <Code>MenuContent</Code> and you
        type a letter key, a search begins. Focus will move to the first <Code>MenuItem</Code> that
        starts with the letter you typed.
      </Text>
      <Preview snippet={snippets.basicUsage} mb="$6">
        <Menu>
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
        </Menu>
      </Preview>
      <Alert status="warning" mb="$10">
        <AlertDescription>
          If the content of <Code>MenuItem</Code> is too complex or non-textual you can pass the{" "}
          <Code>textValue</Code> prop to <Code>MenuItem</Code> to indicate the text that will be
          used for typeahead purposes.
        </AlertDescription>
      </Alert>
      <SectionSubtitle id="menu-item-colors">MenuItem colors</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>colorScheme</Code> prop to change the color of the <Code>MenuItem</Code>. You
        can set the value to <Code>primary</Code>, <Code>accent</Code>, <Code>neutral</Code>,{" "}
        <Code>success</Code>, <Code>info</Code>, <Code>warning</Code> or <Code>danger</Code>.
      </Text>
      <Preview snippet={snippets.menuItemColors} mb="$10">
        <Menu>
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
        </Menu>
      </Preview>
      <SectionSubtitle id="disabled-menu-item">Disabled MenuItem</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>disabled</Code> prop to disable a <Code>MenuItem</Code>.
      </Text>
      <Preview snippet={snippets.disabledMenuItem} mb="$10">
        <Menu>
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
        </Menu>
      </Preview>
      <SectionSubtitle id="trigger-action">
        Trigger an action when a MenuItem is selected
      </SectionSubtitle>
      <Text mb="$5">
        Pass a callback to the <Code>onSelect</Code> prop to trigger an action when the{" "}
        <Code>MenuItem</Code> is selected.
      </Text>
      <Preview snippet={snippets.triggerAction} mb="$10">
        <Menu>
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
        </Menu>
      </Preview>
      <SectionSubtitle id="menu-group">MenuGroup</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>MenuGroup</Code> and <Code>MenuLabel</Code> components to group related menu
        items.
      </Text>
      <Preview snippet={snippets.menuGroup} mb="$12">
        <Menu>
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
        </Menu>
      </Preview>
      <SectionTitle id="accessibility">Accessibility</SectionTitle>
      <SectionSubtitle>ARIA roles and attributes</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$8">
        <ListItem>
          <Code>MenuTrigger</Code> as <Code>role</Code> set to <Code>button</Code>.
        </ListItem>
        <ListItem>
          <Code>MenuTrigger</Code> as <Code>aria-haspopup</Code> set to <Code>menu</Code>.
        </ListItem>
        <ListItem>
          <Code>MenuTrigger</Code> as <Code>aria-expanded</Code> set to <Code>true</Code> when the
          menu is displayed.
        </ListItem>
        <ListItem>
          <Code>MenuTrigger</Code> as <Code>aria-controls</Code> set to the id of{" "}
          <Code>MenuContent</Code>.
        </ListItem>
        <ListItem>
          <Code>MenuContent</Code> as <Code>role</Code> set to <Code>menu</Code>.
        </ListItem>
        <ListItem>
          <Code>MenuContent</Code> as <Code>aria-orientation</Code> set to <Code>vertical</Code>.
        </ListItem>
        <ListItem>
          <Code>MenuItem</Code> as <Code>role</Code> set to <Code>menuitem</Code>.
        </ListItem>
      </UnorderedList>
      <SectionSubtitle>Keyboard support (closed menu)</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$8">
        <ListItem>
          <Kbd>enter</Kbd>, <Kbd>space</Kbd> or <Kbd>↓</Kbd> opens the menu and moves focus on the
          first menu item.
        </ListItem>
        <ListItem>
          <Kbd>↑</Kbd> opens the menu and moves focus to the last menu item.
        </ListItem>
      </UnorderedList>
      <SectionSubtitle>Keyboard support (opened menu)</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$8">
        <ListItem>
          <Kbd>enter</Kbd> or <Kbd>space</Kbd> activates the menu item, close the menu and sets
          focus to the menu trigger.
        </ListItem>
        <ListItem>
          <Kbd>esc</Kbd> close the menu and sets focus to the menu trigger.
        </ListItem>
        <ListItem>
          <Kbd>↑</Kbd> moves focus to the previous menu item. If focus is on the first menu item,
          moves focus to the last menu item.
        </ListItem>
        <ListItem>
          <Kbd>↓</Kbd> moves focus to the next menu item. If focus is on the last menu item, moves
          focus to the first menu item.
        </ListItem>
        <ListItem>
          <Kbd>home</Kbd> moves focus to the first menu item.
        </ListItem>
        <ListItem>
          <Kbd>end</Kbd> moves focus to the last menu item.
        </ListItem>
      </UnorderedList>
      <SectionSubtitle>Typeahead behavior</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          Any printable characters move visual focus to the first menu item that matches the typed
          character.
        </ListItem>
        <ListItem>
          If multiple keys are typed in quick succession, visual focus moves to the first menu item
          that matches the full string.
        </ListItem>
        <ListItem>
          If the same character is typed in succession, visual focus cycles among the menu items
          starting with that character.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Menu</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="menu-props">Menu props</SectionSubtitle>
      <PropsTable items={menuPropItems} mb="$10" />
      <SectionSubtitle id="menu-item-props">MenuItem props</SectionSubtitle>
      <PropsTable items={menuItemPropItems} mb="$10" />
      <SectionSubtitle id="other-components-props">Other components props</SectionSubtitle>
      <Text>
        <Code>MenuTrigger</Code>, <Code>MenuContent</Code>, <Code>MenuGroup</Code> and{" "}
        <Code>MenuLabel</Code> composes{" "}
        <Anchor
          as={Link}
          href="/docs/layout/box"
          external
          color="$primary11"
          fontWeight="$semibold"
        >
          Box
        </Anchor>
        .
      </Text>
    </PageLayout>
  );
}
