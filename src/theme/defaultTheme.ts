import { IconUser } from "@/icons/IconUser";
import { HopeTheme } from "@/theme/index";
import { getInitials } from "@/utils/getInitials";

export const defaultTheme: HopeTheme = {
  components: {
    Avatar: {
      variant: "filled",
      color: "primary",
      size: "md",
      radius: "full",
      icon: IconUser,
      getInitials,
    },
    Button: {
      variant: "filled",
      color: "primary",
      size: "md",
      radius: "sm",
      loaderPosition: "left",
      compact: false,
      uppercase: false,
      fullWidth: false,
    },
    Container: {
      centered: true,
    },
    IconButton: {
      variant: "filled",
      color: "primary",
      size: "sm",
      radius: "sm",
      compact: false,
    },
    Paper: {
      padding: "sm",
      radius: "sm",
      shadow: "sm",
      withBorder: false,
    },
    Tag: {
      variant: "light",
      color: "primary",
      size: "sm",
      radius: "full",
    },
  },
};
