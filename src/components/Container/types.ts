import { ElementType, PolymorphicComponentProps } from "@/utils";

export type ThemeableContainerOptions = {
  centered?: boolean;
};

export type ContainerProps<C extends ElementType> = PolymorphicComponentProps<
  C,
  ThemeableContainerOptions
>;
