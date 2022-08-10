import { SystemStyleObject } from "./types";
import { css } from "./stitches.config";
import { toCSSObject } from "./styled-system/to-css-object";

export type VariantDefinitions = Record<string, SystemStyleObject>;

type BooleanMap<T> = T extends "true" | "false" ? boolean : T;

export type VariantGroups = Record<string, VariantDefinitions>;
export type VariantSelection<Variants extends VariantGroups> = {
  [VariantGroup in keyof Variants]?: BooleanMap<keyof Variants[VariantGroup]>;
};

export interface CompoundVariant<Variants extends VariantGroups> {
  variants: VariantSelection<Variants>;
  style: SystemStyleObject;
}

export type PatternOptions<Variants extends VariantGroups> = {
  base?: SystemStyleObject;
  variants?: Variants;
  defaultVariants?: VariantSelection<Variants>;
  compoundVariants?: Array<CompoundVariant<Variants>>;
};

export type PatternResult<Variants extends VariantGroups> = {
  defaultClassName: string;
  variantClassNames: {
    [P in keyof Variants]: { [P in keyof Variants[keyof Variants]]: string };
  };
  defaultVariants: VariantSelection<Variants>;
  compoundVariants: Array<[VariantSelection<Variants>, string]>;
};

export type RuntimeFn<Variants extends VariantGroups> = (
  options?: VariantSelection<Variants>
) => string;

export type RecipeVariants<RecipeFn extends RuntimeFn<VariantGroups>> = Parameters<RecipeFn>[0];

export function recipe<Variants extends VariantGroups>(options: PatternOptions<Variants>) {
  const { base = {}, variants = {}, compoundVariants = [], defaultVariants = {} } = options;
}

/*
// theme.ts
export const theme = extendTheme({
  // 1. merge theme with DEFAULT_THEME
  // 2. append css variables to `:root`
  // 3. return theme object with `vars`
});

// App.tsx
import { theme } from "./theme";

function App() {
  return <HopeProvider theme={theme} />
}

// Button.tsx
import { recipe, RecipeVariants } from "@hope-ui/core";
import { theme } from "./theme";

interface ButtonRecipeParams {
  colorScheme: ThemeColor
}

const buttonStyles = recipe<ButtonRecipeParams>({
  baseStyle: {},
  variants: {
    variant: {
      solid: ({ colorScheme }) => ({
        borderColor: `${colorScheme}.500`, // "var(--hope-colors-xxx-500)",
        backgroundColor: `${colorScheme}.500`, // "var(--hope-colors-xxx-500)",
        color: `${colorScheme}.500`, // "var(--hope-colors-xxx-500)",

        _dark: {
          borderColor: `${colorScheme}.100`, // "var(--hope-colors-xxx-100)",
          backgroundColor: `${colorScheme}.100`, // "var(--hope-colors-xxx-100)",
          color: `${colorScheme}.100`, // "var(--hope-colors-xxx-100)",
        }
      }),
      soft: {},
      outlined: {},
      plain: {},
    },
    size: {
      xs: {
        height: theme.vars.sizes["8"], // "var(--hope-sizes-8)"
        px: 4, // "var(--hope-space-4)"
      },
      sm: {},
      md: {}
      lg: {}
    },
  },
  compoundVariants: [
    {
      variants: {
        variant: "solid",
        size: "sm",
      },
      style: {}
    },
  ],
  defaultVariants: {
    colorScheme: "primary",
    size: "md",
  }
});

type ButtonVariants = RecipeVariants<typeof buttonStyles>;

*/
