import {
  Alert,
  AlertDescription,
  Avatar,
  AvatarBadge,
  AvatarExcess,
  AvatarGroup,
  hope,
  HStack,
  ListItem,
  Text,
  UnorderedList,
} from "@hope-ui/solid";
import Prism from "prismjs";
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
import { IconUser } from "@/icons/IconUser";

import { snippets } from "./snippets";

export default function AvatarDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/data-display/accordion",
    label: "Accordion",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-display/badge",
    label: "Badge",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#sizes", label: "Avatar sizes", indent: true },
    { href: "#fallbacks", label: "Avatar fallbacks", indent: true },
    { href: "#custom-fallback", label: "Customize the fallback avatar", indent: true },
    { href: "#with-badge", label: "Avatar with badge", indent: true },
    { href: "#avatar-group", label: "AvatarGroup", indent: true },
    { href: "#change-initials-logic", label: "Changing the initials logic", indent: true },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#avatar-props", label: "Avatar props", indent: true },
    { href: "#avatar-group-props", label: "AvatarGroup props", indent: true },
  ];

  const avatarPropItems: PropsTableItem[] = [
    {
      name: "size",
      description: "The size of the avatar.",
      type: '"2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"',
      defaultValue: '"md"',
    },
    {
      name: "withBorder",
      description:
        "If `true`, the Avatar will show a border around it. Best for a group of avatars.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "name",
      description:
        "The name of the person in the avatar. If `src` has loaded, the name will be used as the `alt` attribute of the `img`. If `src` is not loaded, the name will be used to create the initials",
      type: "string",
    },
    {
      name: "src",
      description: "The image url of the `Avatar`.",
      type: "string",
    },
    {
      name: "srcSet",
      description: "List of sources to use for different screen resolutions.",
      type: "string",
    },
    {
      name: "icon",
      description: "The default avatar used as fallback when `name`, and `src` is not specified.",
      type: "(props: AvatarIconProps) => JSX.Element",
    },
    {
      name: "iconLabel",
      description:
        "The `aria-label` to use with the default avatar icon when no `name` is provided.",
      type: "string",
    },
    {
      name: "loading",
      description: "The image loading strategy.",
      type: '"eager" | "lazy"',
    },
    {
      name: "ignoreFallback",
      description: "If `true`, opt out of the avatar's `fallback` logic.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "getInitials",
      description: "Function to get the initials to display.",
      type: "(name: string) => string",
    },
    {
      name: "onError",
      description: "Function called when image failed to load.",
      type: "JSX.EventHandlerUnion<HTMLImageElement, Event>",
    },
  ];

  const avatarGroupPropItems: PropsTableItem[] = [
    {
      name: "size",
      description: "The size of the avatars.",
      type: '"2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"',
      defaultValue: '"md"',
    },
    {
      name: "spacing",
      description: "The space between the avatars in the group.",
      type: 'ResponsiveValue<MarginProps["margin"]>',
      defaultValue: "-1em",
    },
    {
      name: "avatarBorderRadius",
      description: "The `border-radius` of the avatars.",
      type: 'ResponsiveValue<RadiiProps["borderRadius"]>',
    },
    {
      name: "avatarBorderColor",
      description: "The `border-color` of the avatars.",
      type: 'ResponsiveValue<BorderProps["borderColor"]>',
    },
    {
      name: "avatarBorderWidth",
      description: "The `border-width` of the avatars.",
      type: 'ResponsiveValue<BorderProps["borderWidth"]>',
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
      <PageTitle>Avatar</PageTitle>
      <Text mb="$5">
        The <Code>Avatar</Code> component is used to represent a user, and displays the profile
        picture, initials or fallback icon.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>Avatar:</strong> The image that represents the user.
        </ListItem>
        <ListItem>
          <strong>AvatarBadge:</strong> A wrapper that displays its content on the right corner of
          the avatar.
        </ListItem>
        <ListItem>
          <strong>AvatarGroup:</strong> A wrapper to stack multiple Avatars together.
        </ListItem>
        <ListItem>
          <strong>AvatarExcess:</strong> The number of non-displayed avatars in a group.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5"></Text>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <HStack wrap="wrap" spacing="$4">
          <Avatar name="Hector Rhodes" src="https://bit.ly/3pWHo72" />
          <Avatar name="Isabella Mckinney" src="https://bit.ly/3tRVozX" />
          <Avatar name="Courtney Watson" src="https://bit.ly/3w2rgom" />
          <Avatar name="Alberto Sanchez" src="https://bit.ly/3q1WqrX" />
          <Avatar name="Nicole Steeves" src="https://bit.ly/37dJ0m7" />
          <Avatar name="Micheal Dunn" src="https://bit.ly/3t5O04P" />
          <Avatar name="Wanda Fisher" src="https://bit.ly/35N1hXl" />
        </HStack>
      </Preview>
      <SectionSubtitle id="sizes">Avatar sizes</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>size</Code> prop to change the size of the Avatar. You can set the value to{" "}
        <Code>2xs</Code>, <Code>xs</Code>, <Code>sm</Code>, <Code>md</Code>, <Code>lg</Code>,{" "}
        <Code>xl</Code> or <Code>2xl</Code>.
      </Text>
      <Preview snippet={snippets.sizes} mb="$10">
        <HStack alignItems="flex-start" wrap="wrap" spacing="$4">
          <Avatar size="2xs" name="Hector Rhodes" src="https://bit.ly/3pWHo72" />
          <Avatar size="xs" name="Isabella Mckinney" src="https://bit.ly/3tRVozX" />
          <Avatar size="sm" name="Courtney Watson" src="https://bit.ly/3w2rgom" />
          <Avatar size="md" name="Alberto Sanchez" src="https://bit.ly/3q1WqrX" />
          <Avatar size="lg" name="Nicole Steeves" src="https://bit.ly/37dJ0m7" />
          <Avatar size="xl" name="Micheal Dunn" src="https://bit.ly/3t5O04P" />
          <Avatar size="2xl" name="Wanda Fisher" src="https://bit.ly/35N1hXl" />
        </HStack>
      </Preview>
      <SectionSubtitle id="fallbacks">Avatar fallbacks</SectionSubtitle>
      <Text mb="$2">
        If there is an error loading the <Code>src</Code> of the avatar, there are 2 fallbacks:
      </Text>
      <hope.ul ps="$6" mb="$5">
        <hope.li mb="$2">
          If there's a <Code>name</Code> prop, we use it to generate the initials.
        </hope.li>
        <hope.li>
          If there's no <Code>name</Code> prop, we use a default avatar.
        </hope.li>
      </hope.ul>
      <Preview snippet={snippets.fallbacks} mb="$10">
        <HStack spacing="$4">
          <Avatar name="Monkey D. Luffy" src="broken-link" />
          <Avatar src="broken-link" />
        </HStack>
      </Preview>
      <SectionSubtitle id="custom-fallback">Customize the fallback avatar</SectionSubtitle>
      <Text mb="$2">
        You can customize the background color and icon of the fallback avatar icon to match your
        design requirements.
      </Text>
      <hope.ul ps="$6" mb="$5">
        <hope.li mb="$2">
          To update the background, pass the usual <Code>bg</Code> prop.
        </hope.li>
        <hope.li>
          To update the icon svg, pass the <Code>icon</Code> prop.
        </hope.li>
      </hope.ul>
      <Preview snippet={snippets.customFallbacks} mb="$5">
        <HStack spacing="$4">
          <Avatar bg="$danger9" icon={props => <IconUser fontSize="1.5rem" {...props} />} />
          <Avatar bg="$primary9" />
        </HStack>
      </Preview>
      <Alert status="warning" mb="$10">
        <AlertDescription>
          <Code>icon</Code> is a render prop that provides proper <Code>role</Code> and{" "}
          <Code>aria-label</Code> attributes to use in your custom icon.
        </AlertDescription>
      </Alert>
      <SectionSubtitle id="with-badge">Avatar with badge</SectionSubtitle>
      <Text mb="$5">
        In some products, you might need to show a badge on the right corner of the avatar. We call
        this a <strong>badge</strong>. Here's an example that shows if the user is online:
      </Text>
      <Preview snippet={snippets.withBadge} mb="$5">
        <HStack spacing="$4">
          <Avatar>
            <AvatarBadge boxSize="1.25em" bg="$success9" />
          </Avatar>
          <Avatar>
            <AvatarBadge borderColor="papayawhip" bg="tomato" boxSize="1.25em" />
          </Avatar>
        </HStack>
      </Preview>
      <Alert status="warning" mb="$10">
        <AlertDescription>
          Note the use of <Code>em</Code> for the size of the <Code>AvatarBadge</Code>. This is
          useful to size the badge relative to the avatar font size.
        </AlertDescription>
      </Alert>
      <SectionSubtitle id="avatar-group">AvatarGroup</SectionSubtitle>
      <Text mb="$2">
        In some cases, you might need to stack avatars as a group. Use the <Code>AvatarGroup</Code>{" "}
        component.
      </Text>
      <hope.ul ps="$6" mb="$5">
        <hope.li mb="$2">
          To size all the avatars equally, pass the <Code>size</Code> prop.
        </hope.li>
        <hope.li mb="$2">
          To adjust the spacing between the avatars, pass the <Code>spacing</Code> prop.
        </hope.li>
        <hope.li>
          To set a remaining avatars number, use the <Code>AvatarExcess</Code> component.
        </hope.li>
      </hope.ul>
      <Preview snippet={snippets.avatarGroup} mb="$10">
        <AvatarGroup>
          <Avatar name="Hector Rhodes" src="https://bit.ly/3pWHo72" />
          <Avatar name="Isabella Mckinney" src="https://bit.ly/3tRVozX" />
          <AvatarExcess>+3</AvatarExcess>
        </AvatarGroup>
      </Preview>
      <SectionSubtitle id="change-initials-logic">Changing the initials logic</SectionSubtitle>
      <Text mb="$12">
        Use the <Code>getInitials</Code> prop to manage how initials are generated from name. By
        default Hope UI merge the first characters of each word in the <Code>name</Code> prop.
      </Text>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Avatar</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="avatar-props">Avatar props</SectionSubtitle>
      <PropsTable items={avatarPropItems} mb="$10" />
      <SectionSubtitle id="avatar-group-props">AvatarGroup props</SectionSubtitle>
      <PropsTable items={avatarGroupPropItems} />
    </PageLayout>
  );
}
