import { ElementType, PolymorphicComponentProps } from "@/components";

export type CenterOptions = {
  inline?: boolean;
};

export type CenterProps<C extends ElementType> = PolymorphicComponentProps<C, CenterOptions>;
