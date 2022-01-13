import { ElementType, PolymorphicComponentProps } from "@/components";

export type ThemeableContainerOptions = {
  centered?: boolean;
};

export type ContainerProps<C extends ElementType> = PolymorphicComponentProps<
  C,
  ThemeableContainerOptions
>;
