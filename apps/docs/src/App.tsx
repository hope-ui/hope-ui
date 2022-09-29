import {
  Anchor,
  Box,
  Center,
  Container,
  Flex,
  hope,
  HStack,
  Progress,
  ProgressIndicator,
  Spinner,
} from "@hope-ui/solid";
import { Outlet, Route, Routes, useIsRouting } from "solid-app-router";
import { lazy, Suspense } from "solid-js";
import { Portal } from "solid-js/web";

import Header from "./components/Header";
import MainNavigation from "./components/MainNavigation";

const LandingPage = lazy(() => import("./pages/landing-page"));
const NotFound = lazy(() => import("./pages/not-found"));

const Installation = lazy(() => import("./pages/getting-started/installation"));
const Changelog = lazy(() => import("./pages/getting-started/changelog"));

const StyleProps = lazy(() => import("./pages/features/style-props"));
const CSSProp = lazy(() => import("./pages/features/css-prop"));
const CreateStyles = lazy(() => import("./pages/features/create-styles"));
const ResponsiveStyles = lazy(() => import("./pages/features/responsive-styles"));
const GlobalStyles = lazy(() => import("./pages/features/global-styles"));
const HopeFactory = lazy(() => import("./pages/features/hope-factory"));

const DefaultTheme = lazy(() => import("./pages/theming/default-theme"));
const CustomizeTheme = lazy(() => import("./pages/theming/customize-theme"));
const CSSVariables = lazy(() => import("./pages/theming/css-variables"));
const ColorMode = lazy(() => import("./pages/theming/color-mode"));

const ButtonDoc = lazy(() => import("./pages/component-docs/general/button"));
const IconButtonDoc = lazy(() => import("./pages/component-docs/general/icon-button"));

const AspectRatioDoc = lazy(() => import("./pages/component-docs/layout/aspect-ratio"));
const BoxDoc = lazy(() => import("./pages/component-docs/layout/box"));
const CenterDoc = lazy(() => import("./pages/component-docs/layout/center"));
const ContainerDoc = lazy(() => import("./pages/component-docs/layout/container"));
const DividerDoc = lazy(() => import("./pages/component-docs/layout/divider"));
const FlexDoc = lazy(() => import("./pages/component-docs/layout/flex"));
const GridDoc = lazy(() => import("./pages/component-docs/layout/grid"));
const SimpleGridDoc = lazy(() => import("./pages/component-docs/layout/simple-grid"));
const StackDoc = lazy(() => import("./pages/component-docs/layout/stack"));

const HeadingDoc = lazy(() => import("./pages/component-docs/typography/heading"));
const TextDoc = lazy(() => import("./pages/component-docs/typography/text"));

const CheckboxDoc = lazy(() => import("./pages/component-docs/data-entry/checkbox"));
const FormControlDoc = lazy(() => import("./pages/component-docs/data-entry/form-control"));
const InputDoc = lazy(() => import("./pages/component-docs/data-entry/input"));
const RadioDoc = lazy(() => import("./pages/component-docs/data-entry/radio"));
const SelectDoc = lazy(() => import("./pages/component-docs/data-entry/select"));
const SwitchDoc = lazy(() => import("./pages/component-docs/data-entry/switch"));
const TextareaDoc = lazy(() => import("./pages/component-docs/data-entry/textarea"));

const AccordionDoc = lazy(() => import("./pages/component-docs/data-display/accordion"));
const AvatarDoc = lazy(() => import("./pages/component-docs/data-display/avatar"));
const BadgeDoc = lazy(() => import("./pages/component-docs/data-display/badge"));
const IconDoc = lazy(() => import("./pages/component-docs/data-display/icon"));
const ImageDoc = lazy(() => import("./pages/component-docs/data-display/image"));
const KbdDoc = lazy(() => import("./pages/component-docs/data-display/kbd"));
const ListDoc = lazy(() => import("./pages/component-docs/data-display/list"));
const TableDoc = lazy(() => import("./pages/component-docs/data-display/table"));
const TagDoc = lazy(() => import("./pages/component-docs/data-display/tag"));

const AnchorDoc = lazy(() => import("./pages/component-docs/navigation/anchor"));
const BreadcrumbDoc = lazy(() => import("./pages/component-docs/navigation/breadcrumb"));
const TabsDoc = lazy(() => import("./pages/component-docs/navigation/tabs"));

const AlertDoc = lazy(() => import("./pages/component-docs/feedback/alert"));
const CircularProgressDoc = lazy(() => import("./pages/component-docs/feedback/circular-progress"));
const ProgressDoc = lazy(() => import("./pages/component-docs/feedback/progress"));
const SkeletonDoc = lazy(() => import("./pages/component-docs/feedback/skeleton"));
const SpinnerDoc = lazy(() => import("./pages/component-docs/feedback/spinner"));
const NotificationDoc = lazy(() => import("./pages/component-docs/feedback/notification"));

const DrawerDoc = lazy(() => import("./pages/component-docs/overlay/drawer"));
const MenuDoc = lazy(() => import("./pages/component-docs/overlay/menu"));
const ModalDoc = lazy(() => import("./pages/component-docs/overlay/modal"));
const PopoverDoc = lazy(() => import("./pages/component-docs/overlay/popover"));
const TooltipDoc = lazy(() => import("./pages/component-docs/overlay/tooltip"));

const CloseButtonDoc = lazy(() => import("./pages/component-docs/others/close-button"));

function AppLayout() {
  const isRouting = useIsRouting();

  return (
    <Flex direction="column">
      <Portal>
        <Box position="fixed" top="0" left="0" right="0" zIndex="$banner">
          <Progress indeterminate size="xs" d={isRouting() ? "block" : "none"}>
            <ProgressIndicator />
          </Progress>
          <HStack
            bg="$danger9"
            color="white"
            px="$2"
            fontWeight="$medium"
            fontSize="$sm"
            lineHeight="$5"
            _dark={{
              bg: "$danger3",
              color: "$danger11",
            }}
          >
            Hope UI is in a rewrite process, learn more about the next major release on the&nbsp;
            <Anchor external href="https://next--hope-ui.netlify.app/docs/introduction/getting-started" fontWeight="$bold" fontStyle="italic">
              new documentation
            </Anchor>
            .
          </HStack>
        </Box>
      </Portal>
      <Header />
      <Container flexGrow={1}>
        <Flex>
          <MainNavigation />
          <hope.main w="$full">
            <Outlet />
          </hope.main>
        </Flex>
      </Container>
    </Flex>
  );
}

export default function App() {
  return (
    <Suspense
      fallback={
        <Center mt="$4">
          <Spinner size="lg" thickness="3px" color="$primary9" />
        </Center>
      }
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/*all" element={<NotFound />} />
        <Route path="/docs" element={<AppLayout />}>
          <Route path="/getting-started" element={<Installation />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/features">
            <Route path="/style-props" element={<StyleProps />} />
            <Route path="/css-prop" element={<CSSProp />} />
            <Route path="/create-styles" element={<CreateStyles />} />
            <Route path="/responsive-styles" element={<ResponsiveStyles />} />
            <Route path="/global-styles" element={<GlobalStyles />} />
            <Route path="/hope-factory" element={<HopeFactory />} />
          </Route>
          <Route path="/theming">
            <Route path="/default-theme" element={<DefaultTheme />} />
            <Route path="/customize-theme" element={<CustomizeTheme />} />
            <Route path="/css-variables" element={<CSSVariables />} />
            <Route path="/color-mode" element={<ColorMode />} />
          </Route>
          <Route path="/general">
            <Route path="/button" element={<ButtonDoc />} />
            <Route path="/icon-button" element={<IconButtonDoc />} />
          </Route>
          <Route path="/layout">
            <Route path="/aspect-ratio" element={<AspectRatioDoc />} />
            <Route path="/box" element={<BoxDoc />} />
            <Route path="/center" element={<CenterDoc />} />
            <Route path="/container" element={<ContainerDoc />} />
            <Route path="/divider" element={<DividerDoc />} />
            <Route path="/flex" element={<FlexDoc />} />
            <Route path="/grid" element={<GridDoc />} />
            <Route path="/simple-grid" element={<SimpleGridDoc />} />
            <Route path="/stack" element={<StackDoc />} />
          </Route>
          <Route path="/typography">
            <Route path="/text" element={<TextDoc />} />
            <Route path="/heading" element={<HeadingDoc />} />
          </Route>
          <Route path="/data-entry">
            <Route path="/checkbox" element={<CheckboxDoc />} />
            <Route path="/form-control" element={<FormControlDoc />} />
            <Route path="/input" element={<InputDoc />} />
            <Route path="/radio" element={<RadioDoc />} />
            <Route path="/select" element={<SelectDoc />} />
            <Route path="/switch" element={<SwitchDoc />} />
            <Route path="/textarea" element={<TextareaDoc />} />
          </Route>
          <Route path="/data-display">
            <Route path="/accordion" element={<AccordionDoc />} />
            <Route path="/avatar" element={<AvatarDoc />} />
            <Route path="/badge" element={<BadgeDoc />} />
            <Route path="/icon" element={<IconDoc />} />
            <Route path="/image" element={<ImageDoc />} />
            <Route path="/kbd" element={<KbdDoc />} />
            <Route path="/list" element={<ListDoc />} />
            <Route path="/table" element={<TableDoc />} />
            <Route path="/tag" element={<TagDoc />} />
          </Route>
          <Route path="/navigation">
            <Route path="/anchor" element={<AnchorDoc />} />
            <Route path="/breadcrumb" element={<BreadcrumbDoc />} />
            <Route path="/tabs" element={<TabsDoc />} />
          </Route>
          <Route path="/feedback">
            <Route path="/alert" element={<AlertDoc />} />
            <Route path="/circular-progress" element={<CircularProgressDoc />} />
            <Route path="/progress" element={<ProgressDoc />} />
            <Route path="/skeleton" element={<SkeletonDoc />} />
            <Route path="/spinner" element={<SpinnerDoc />} />
            <Route path="/notification" element={<NotificationDoc />} />
          </Route>
          <Route path="/overlay">
            <Route path="/drawer" element={<DrawerDoc />} />
            <Route path="/menu" element={<MenuDoc />} />
            <Route path="/modal" element={<ModalDoc />} />
            <Route path="/popover" element={<PopoverDoc />} />
            <Route path="/tooltip" element={<TooltipDoc />} />
          </Route>
          <Route path="/others">
            <Route path="/close-button" element={<CloseButtonDoc />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
