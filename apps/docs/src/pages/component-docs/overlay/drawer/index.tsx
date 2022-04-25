import {
  Alert,
  AlertDescription,
  Anchor,
  Button,
  createDisclosure,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPlacement,
  DrawerProps,
  FormControl,
  FormLabel,
  HStack,
  Input,
  ListItem,
  Radio,
  RadioControl,
  RadioGroup,
  RadioLabel,
  Text,
  UnorderedList,
} from "@hope-ui/solid";
import Prism from "prismjs";
import { Link } from "solid-app-router";
import { createSignal, For, onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";
import { IconPlus } from "@/icons/IconPlus";

import { snippets } from "./snippets";

export default function DrawerDoc() {
  const [placement, setPlacement] = createSignal<DrawerPlacement>("right");
  const [size, setSize] = createSignal<DrawerProps["size"]>("md");

  const sizes = ["xs", "sm", "md", "lg", "xl", "full"];

  const basicUsageDisclosure = createDisclosure();
  const placementDisclosure = createDisclosure();
  const initialFocusDisclosure = createDisclosure();
  const sizeDisclosure = createDisclosure();

  const handleSizeClick = (newSize: DrawerProps["size"]) => {
    setSize(() => newSize);
    sizeDisclosure.onOpen();
  };

  const previousLink: ContextualNavLink = {
    href: "/docs/feedback/notification",
    label: "Notification",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/overlay/menu",
    label: "Menu",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#drawer-placement", label: "Drawer placement", indent: true },
    { href: "#focus-on-specific-element", label: "Focus on specific element", indent: true },
    { href: "#drawer-sizes", label: "Drawer sizes", indent: true },
    { href: "#using-form-in-drawer", label: "Using a form in a Drawer", indent: true },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#drawer-props", label: "Drawer props", indent: true },
    { href: "#other-components-props", label: "Other components props", indent: true },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "size",
      description: "The size of the drawer.",
      type: '"xs" | "sm" | "md" | "lg" | "xl" | "full"',
      defaultValue: '"xs"',
    },
    {
      name: "placement",
      description: "The placement of the drawer.",
      type: '"top" | "right" | "bottom" | "left"',
      defaultValue: '"right"',
    },
    {
      name: "fullHeight",
      description:
        "If `true` and drawer's placement is top or bottom, the drawer will occupy the viewport height (100vh).",
      type: "boolean",
    },
    {
      name: "disableMotion",
      description: "If `true`, the drawer will appear without any transition.",
      type: "boolean",
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
      <PageTitle>Drawer</PageTitle>
      <Text mb="$5">
        The <Code>Drawer</Code> component is a panel that slides out from the edge of the screen. It
        can be useful when you need users to complete a task or view some details without leaving
        the current page.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>Drawer:</strong> The wrapper that provides context for its children.
        </ListItem>
        <ListItem>
          <strong>DrawerOverlay:</strong> The dimmed overlay behind the drawer content.
        </ListItem>
        <ListItem>
          <strong>DrawerContent:</strong> The container for the drawer's content.
        </ListItem>
        <ListItem>
          <strong>DrawerHeader:</strong> The header that labels the drawer.
        </ListItem>
        <ListItem>
          <strong>DrawerBody:</strong> The wrapper that houses the drawer's main content.
        </ListItem>
        <ListItem>
          <strong>DrawerFooter:</strong> The footer that houses the drawer actions.
        </ListItem>
        <ListItem>
          <strong>DrawerCloseButton:</strong> The button that closes the drawer.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Button onClick={basicUsageDisclosure.onOpen}>Open</Button>
        <Drawer
          opened={basicUsageDisclosure.isOpen()}
          placement="right"
          onClose={basicUsageDisclosure.onClose}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Create your account</DrawerHeader>
            <DrawerBody>
              <Input placeholder="Type here..." />
            </DrawerBody>
            <DrawerFooter>
              <Button variant="outline" mr="$3" onClick={basicUsageDisclosure.onClose}>
                Cancel
              </Button>
              <Button>Save</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Preview>
      <SectionSubtitle id="drawer-placement">Drawer placement</SectionSubtitle>
      <Text mb="$5">
        The Drawer can appear from any edge of the screen. Pass the <Code>placement</Code> prop and
        set it to <Code>top</Code>, <Code>right</Code>, <Code>bottom</Code>, or <Code>left</Code>.
      </Text>
      <Preview snippet={snippets.placement} mb="$10">
        <RadioGroup value={placement()} onChange={value => setPlacement(value as DrawerPlacement)}>
          <HStack spacing="$4" mb="$4">
            <Radio value="top">
              <RadioControl />
              <RadioLabel>Top</RadioLabel>
            </Radio>
            <Radio value="right">
              <RadioControl />
              <RadioLabel>Right</RadioLabel>
            </Radio>
            <Radio value="bottom">
              <RadioControl />
              <RadioLabel>Bottom</RadioLabel>
            </Radio>
            <Radio value="left">
              <RadioControl />
              <RadioLabel>Left</RadioLabel>
            </Radio>
          </HStack>
        </RadioGroup>
        <Button onClick={placementDisclosure.onOpen}>Open</Button>
        <Drawer
          opened={placementDisclosure.isOpen()}
          placement={placement()}
          onClose={placementDisclosure.onClose}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader>Basic Drawer</DrawerHeader>
            <DrawerBody>
              <p>Some contents...</p>
              <p>Some contents...</p>
              <p>Some contents...</p>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Preview>
      <SectionSubtitle id="focus-on-specific-element">Focus on specific element</SectionSubtitle>
      <Text mb="$5">
        Hope UI automatically sets focus on the first tabbable element in the drawer. However, there
        might be scenarios where you need to manually control where focus goes. To do this, pass a
        CSS query selector to the <Code>initialFocus</Code> prop.
      </Text>
      <Preview snippet={snippets.initialFocus} mb="$6">
        <Button leftIcon={<IconPlus />} onClick={initialFocusDisclosure.onOpen}>
          Create user
        </Button>
        <Drawer
          opened={initialFocusDisclosure.isOpen()}
          initialFocus="#firstname"
          onClose={initialFocusDisclosure.onClose}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Create user</DrawerHeader>

            <DrawerBody>
              <FormControl id="firstname" mb="$4">
                <FormLabel>First name</FormLabel>
                <Input placeholder="First name" />
              </FormControl>
              <FormControl id="lastname">
                <FormLabel>Last name</FormLabel>
                <Input placeholder="Last name" />
              </FormControl>
            </DrawerBody>

            <DrawerFooter>
              <Button variant="outline" mr="$3" onClick={initialFocusDisclosure.onClose}>
                Cancel
              </Button>
              <Button>Save</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Preview>
      <Alert status="warning" mb="$10">
        <AlertDescription>
          Without the <Code>initialFocus</Code> prop, the drawer will set focus on the{" "}
          <strong>first focusable element</strong> when it opens.
        </AlertDescription>
      </Alert>
      <SectionSubtitle id="drawer-sizes">Drawer sizes</SectionSubtitle>
      <Text mb="$5">
        Pass the <Code>size</Code> prop if you need to adjust the size of the drawer. Values can be{" "}
        <Code>xs</Code>, <Code>sm</Code>, <Code>md</Code>, <Code>lg</Code>, <Code>xl</Code>, or{" "}
        <Code>full</Code>.
      </Text>
      <Preview snippet={snippets.drawerSizes} mb="$10">
        <For each={sizes}>
          {size => (
            <Button
              onClick={() => handleSizeClick(size as DrawerProps["size"])}
              m="$4"
            >{`Open ${size} Drawer`}</Button>
          )}
        </For>

        <Drawer opened={sizeDisclosure.isOpen()} size={size()} onClose={sizeDisclosure.onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader>{`${size()} drawer contents`}</DrawerHeader>
            <DrawerBody>
              {size() === "full"
                ? `You're trapped 😆 , refresh the page to leave or press 'Esc' key.`
                : null}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Preview>
      <SectionSubtitle id="using-form-in-drawer">Using a form in a Drawer</SectionSubtitle>
      <Text mb="$5">
        If you need to but a form within the Drawer and place the sumit button in the drawer's
        footer, here's the recommended way to do it:
      </Text>
      <CodeSnippet snippet={snippets.usingForm} mb="$6" />
      <Alert status="warning" mb="$12">
        <AlertDescription>
          Because the button is located outside the form, you have to leverage its native HTML{" "}
          <Code>form</Code> attribute and refer to the <Code>id</Code> of the <Code>form</Code>.
        </AlertDescription>
      </Alert>
      <SectionTitle id="accessibility">Accessibility</SectionTitle>
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>When opening the Drawer, focus is trapped inside the Drawer.</ListItem>
        <ListItem>
          By default, the drawer sets focus on the first focusable element. If the{" "}
          <Code>initialFocus</Code> prop is passed, the drawer sets focus on the element that
          matches the CSS query selector.
        </ListItem>
        <ListItem>
          After the drawer closes, it'll return focus to the element that triggered it.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Drawer</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="drawer-props">Drawer props</SectionSubtitle>
      <Text mb="$5">
        <Code>Drawer</Code> composes the{" "}
        <Anchor as={Link} href="/docs/overlay/modal" color="$primary11" fontWeight="$semibold">
          Modal
        </Anchor>{" "}
        component with these extra props:
      </Text>
      <PropsTable items={propItems} mb="$10" />
      <SectionSubtitle id="other-components-props">Other components props</SectionSubtitle>
      <UnorderedList spacing="$2">
        <ListItem>
          <Code>DrawerOverlay</Code>, <Code>DrawerContent</Code>, <Code>DrawerHeader</Code>,{" "}
          <Code>DrawerBody</Code> and <Code>DrawerFooter</Code> composes{" "}
          <Anchor as={Link} href="/docs/layout/box" color="$primary11" fontWeight="$semibold">
            Box
          </Anchor>{" "}
          component.
        </ListItem>
        <ListItem>
          <Code>DrawerCloseButton</Code> composes{" "}
          <Anchor
            as={Link}
            href="/docs/others/close-button"
            color="$primary11"
            fontWeight="$semibold"
          >
            CloseButton
          </Anchor>
          .
        </ListItem>
      </UnorderedList>
    </PageLayout>
  );
}
