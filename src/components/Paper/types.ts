import { ElementType, PolymorphicComponentProps } from "@/components";
import { HopeSize } from "@/theme";

export type ThemeablePaperOptions = {
  padding?: HopeSize | "none";
  radius?: HopeSize | "none";
  shadow?: HopeSize | "none";
  withBorder?: boolean;
};

export type PaperProps<C extends ElementType> = PolymorphicComponentProps<C, ThemeablePaperOptions>;
