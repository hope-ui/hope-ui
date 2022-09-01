import { createHopeComponent, createIcon, IconButton } from "@hope-ui/core";
import { useIsRouting } from "@solidjs/router";
import { createComputed, createSignal } from "solid-js";
import { NavSection } from "../NAV_SECTIONS";

const MenuIcon = createIcon({
  path: () => (
    <path
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      d="M4 7h16M4 12h16M4 17h16"
    />
  ),
});

const CloseIcon = createIcon({
  path: () => (
    <path
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      d="M5 5l14 14M19 5l-14 14"
    />
  ),
});

interface MobileNavigationProps {
  sections: NavSection[];
}

export const MobileNavigation = createHopeComponent<"button", MobileNavigationProps>(props => {
  const [isOpen, setIsOpen] = createSignal(false);

  const isRouting = useIsRouting();

  createComputed(() => isRouting() && setIsOpen(false));

  // TODO: add navigation inside Dialog/Modal

  return (
    <>
      <IconButton
        variant="plain"
        colorScheme="neutral"
        size="sm"
        aria-label="Open navigation"
        onClick={() => setIsOpen(true)}
      >
        <MenuIcon fontSize="1.5em" />
      </IconButton>
    </>
  );
});
