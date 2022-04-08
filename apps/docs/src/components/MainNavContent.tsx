import { VStack } from "@hope-ui/solid";

import AppNavLink from "./AppNavLink";
import Code from "./Code";
import MainNavSubtitle from "./MainNavSubtitle";
import MainNavTitle from "./MainNavTitle";

export default function MainNavContent() {
  return (
    <>
      <MainNavTitle mb="$2">Getting started</MainNavTitle>
      <VStack alignItems="flex-start" spacing="$1" mb="$6">
        <AppNavLink href="/docs/getting-started">Installation</AppNavLink>
        <AppNavLink href="/docs/changelog">Changelog</AppNavLink>
      </VStack>
      <MainNavSubtitle mb="$2">Features</MainNavSubtitle>
      <VStack alignItems="flex-start" spacing="$1" mb="$6">
        <AppNavLink href="/docs/features/style-props">Style props</AppNavLink>
        <AppNavLink href="/docs/features/css-prop">
          The <Code mx="$1">css</Code> prop
        </AppNavLink>
        <AppNavLink href="/docs/features/create-styles">Create styles</AppNavLink>
        <AppNavLink href="/docs/features/responsive-styles">Responsive styles</AppNavLink>
        <AppNavLink href="/docs/features/global-styles">Global styles</AppNavLink>
        <AppNavLink href="/docs/features/hope-factory">Hope factory</AppNavLink>
      </VStack>
      <MainNavSubtitle mb="$2">Theming</MainNavSubtitle>
      <VStack alignItems="flex-start" spacing="$1" mb="$6">
        <AppNavLink href="/docs/theming/default-theme">Default theme</AppNavLink>
        <AppNavLink href="/docs/theming/customize-theme">Customize theme</AppNavLink>
        <AppNavLink href="/docs/theming/css-variables">CSS variables</AppNavLink>
        <AppNavLink href="/docs/theming/color-mode">Color mode</AppNavLink>
      </VStack>
      <MainNavTitle mb="$3">Components</MainNavTitle>
      <MainNavSubtitle mb="$2">General</MainNavSubtitle>
      <VStack alignItems="flex-start" spacing="$1" mb="$6">
        <AppNavLink href="/docs/general/button">Button</AppNavLink>
        <AppNavLink href="/docs/general/icon-button">IconButton</AppNavLink>
      </VStack>
      <MainNavSubtitle mb="$2">Layout</MainNavSubtitle>
      <VStack alignItems="flex-start" spacing="$1" mb="$6">
        <AppNavLink href="/docs/layout/aspect-ratio">AspectRatio</AppNavLink>
        <AppNavLink href="/docs/layout/box">Box</AppNavLink>
        <AppNavLink href="/docs/layout/center">Center</AppNavLink>
        <AppNavLink href="/docs/layout/container">Container</AppNavLink>
        <AppNavLink href="/docs/layout/divider">Divider</AppNavLink>
        <AppNavLink href="/docs/layout/flex">Flex</AppNavLink>
        <AppNavLink href="/docs/layout/grid">Grid</AppNavLink>
        <AppNavLink href="/docs/layout/simple-grid">SimpleGrid</AppNavLink>
        <AppNavLink href="/docs/layout/stack">Stack</AppNavLink>
      </VStack>
      <MainNavSubtitle mb="$2">Typography</MainNavSubtitle>
      <VStack alignItems="flex-start" spacing="$1" mb="$6">
        <AppNavLink href="/docs/typography/heading">Heading</AppNavLink>
        <AppNavLink href="/docs/typography/text">Text</AppNavLink>
      </VStack>
      <MainNavSubtitle mb="$2">Data entry</MainNavSubtitle>
      <VStack alignItems="flex-start" spacing="$1" mb="$6">
        <AppNavLink href="/docs/data-entry/checkbox">Checkbox</AppNavLink>
        {/* <AppNavLink href="/docs/data-display/date-picker">DatePicker</AppNavLink> */}
        <AppNavLink href="/docs/data-entry/form-control">FormControl</AppNavLink>
        <AppNavLink href="/docs/data-entry/input">Input</AppNavLink>
        {/* <AppNavLink href="/docs/data-entry/number-input">NumberInput</AppNavLink> */}
        {/* <AppNavLink href="/docs/data-entry/password-input">PasswordInput</AppNavLink> */}
        {/* <AppNavLink href="/docs/data-entry/file-input">FileInput</AppNavLink> */}
        <AppNavLink href="/docs/data-entry/radio">Radio</AppNavLink>
        <AppNavLink href="/docs/data-entry/select">Select</AppNavLink>
        {/* <AppNavLink href="/docs/data-entry/slider">Slider</AppNavLink> */}
        <AppNavLink href="/docs/data-entry/switch">Switch</AppNavLink>
        <AppNavLink href="/docs/data-entry/textarea">Textarea</AppNavLink>
        {/* <AppNavLink href="/docs/data-entry/time-picker">TimePicker</AppNavLink> */}
      </VStack>

      <MainNavSubtitle mb="$2">Data display</MainNavSubtitle>
      <VStack alignItems="flex-start" spacing="$1" mb="$6">
        <AppNavLink href="/docs/data-display/accordion">Accordion</AppNavLink>
        <AppNavLink href="/docs/data-display/avatar">Avatar</AppNavLink>
        <AppNavLink href="/docs/data-display/badge">Badge</AppNavLink>
        <AppNavLink href="/docs/data-display/icon">Icon</AppNavLink>
        <AppNavLink href="/docs/data-display/image">Image</AppNavLink>
        <AppNavLink href="/docs/data-display/kbd">Kbd</AppNavLink>
        <AppNavLink href="/docs/data-display/list">List</AppNavLink>
        <AppNavLink href="/docs/data-display/table">Table</AppNavLink>
        <AppNavLink href="/docs/data-display/tag">Tag</AppNavLink>
        {/* <AppNavLink href="/docs/data-display/timeline">Timeline</AppNavLink> */}
      </VStack>
      <MainNavSubtitle mb="$2">Navigation</MainNavSubtitle>
      <VStack alignItems="flex-start" spacing="$1" mb="$6">
        <AppNavLink href="/docs/navigation/anchor">Anchor</AppNavLink>
        <AppNavLink href="/docs/navigation/breadcrumb">Breadcrumb</AppNavLink>
        {/* <AppNavLink href="/docs/navigation/pagination">Pagination</AppNavLink> */}
        {/* <AppNavLink href="/docs/navigation/stepper">Stepper</AppNavLink> */}
        <AppNavLink href="/docs/navigation/tabs">Tabs</AppNavLink>
      </VStack>
      <MainNavSubtitle mb="$2">Feedback</MainNavSubtitle>
      <VStack alignItems="flex-start" spacing="$1" mb="$6">
        <AppNavLink href="/docs/feedback/alert">Alert</AppNavLink>
        <AppNavLink href="/docs/feedback/circular-progress">CircularProgress</AppNavLink>
        <AppNavLink href="/docs/feedback/progress">Progress</AppNavLink>
        <AppNavLink href="/docs/feedback/skeleton">Skeleton</AppNavLink>
        <AppNavLink href="/docs/feedback/spinner">Spinner</AppNavLink>
        <AppNavLink href="/docs/feedback/notification" isNew>
          Notification
        </AppNavLink>
      </VStack>
      <MainNavSubtitle mb="$2">Overlay</MainNavSubtitle>
      <VStack alignItems="flex-start" spacing="$1" mb="$6">
        <AppNavLink href="/docs/overlay/drawer">Drawer</AppNavLink>
        <AppNavLink href="/docs/overlay/menu">Menu</AppNavLink>
        <AppNavLink href="/docs/overlay/modal">Modal</AppNavLink>
        <AppNavLink href="/docs/overlay/popover">Popover</AppNavLink>
        <AppNavLink href="/docs/overlay/tooltip">Tooltip</AppNavLink>
      </VStack>
      <MainNavSubtitle mb="$2">Others</MainNavSubtitle>
      <VStack alignItems="flex-start" spacing="$1">
        <AppNavLink href="/docs/others/close-button">CloseButton</AppNavLink>
      </VStack>
    </>
  );
}
