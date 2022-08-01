import { css, cx } from "@emotion/css";
import { isFunction } from "@hope-ui/utils";
import { Accessor, createMemo, createUniqueId } from "solid-js";

import { SystemStyleObject } from "./styled-system/system.types";
import { toCSSObject } from "./styled-system/to-css-object";
import { ThemeStylesObject, useTheme, useThemeStyles } from "./theme/theme-provider";
import type { Theme } from "./types";
import { mergeClassNames } from "./utils/merge-class-names";

type StylesPartial<Key extends string, StyleParams> =
  | Partial<Record<Key, SystemStyleObject>>
  | ((theme: Theme, params: StyleParams) => Partial<Record<Key, SystemStyleObject>>);

export interface UseStylesOptions<Key extends string, StyleParams> {
  /** The name of the component/parts, used to retrieve theme styles and for static classNames generation. */
  name: string | string[];

  /** The classNames applied to each parts of the component. */
  classNames?: Accessor<Partial<Record<Key, string>> | undefined>;

  /** The styles applied to each parts of the component, will be parsed by `emotion` and added to the head. */
  styles?: Accessor<StylesPartial<Key, StyleParams> | undefined>;

  /** Whether the base styles should be applied or not. */
  unstyled?: Accessor<boolean | undefined>;
}

/**
 * Create a function that combines a name and an id to create a unique className,
 * in order to be used as ref in `createStyles`.
 */
function createGetRef(id: string) {
  return (refName: string) => `__hope-ref-${id}-${refName}`;
}

function getStyles<Key extends string, StyleParams>(
  styles: ThemeStylesObject[] | StylesPartial<Key, StyleParams> | undefined,
  theme: Theme,
  params: StyleParams
) {
  const extractStyles = (stylesPartial?: StylesPartial<Key, StyleParams> | undefined) => {
    if (isFunction(stylesPartial)) {
      return stylesPartial(theme, params ?? ({} as StyleParams));
    }

    return stylesPartial ?? {};
  };

  if (Array.isArray(styles)) {
    return styles
      .map(item => extractStyles(item.styles))
      .reduce<Record<string, SystemStyleObject>>((acc, item: Record<string, SystemStyleObject>) => {
        Object.keys(item).forEach(key => {
          if (!acc[key]) {
            acc[key] = { ...item[key] };
          } else {
            acc[key] = { ...acc[key], ...item[key] };
          }
        });
        return acc;
      }, {});
  }

  return extractStyles(styles);
}

export function createStyles<Key extends string = string, StyleParams = void>(
  input:
    | ((
        theme: Theme,
        params: StyleParams,
        getRef: (refName: string) => string
      ) => Record<Key, SystemStyleObject>)
    | Record<Key, SystemStyleObject>
) {
  const getRef = createGetRef(createUniqueId());

  const getInputStyles = typeof input === "function" ? input : () => input;

  function useStyles(params: StyleParams, options?: UseStylesOptions<Key, StyleParams>) {
    const theme = useTheme();
    const contextStyles = useThemeStyles(options?.name);

    const classes = createMemo(() => {
      const inputStyles = getInputStyles(theme(), params, getRef) as Record<
        string,
        SystemStyleObject
      >;

      const themeStyles = getStyles(contextStyles(), theme(), params);
      const componentStyles = getStyles(options?.styles?.(), theme(), params);

      const baseClassNames = Object.fromEntries(
        Object.keys(inputStyles).map(key => {
          const { ref, ...baseStyles } = inputStyles[key];

          const mergedStyles = cx(
            !options?.unstyled?.() ? css(toCSSObject(baseStyles, theme())) : undefined,
            themeStyles[key] ? css(toCSSObject(themeStyles[key], theme())) : undefined,
            componentStyles[key] ? css(toCSSObject(componentStyles[key], theme())) : undefined,
            ref as string // static className used as selector ref
          );

          return [key, mergedStyles];
        })
      ) as Record<Key, string>;

      return mergeClassNames({
        baseClassNames: baseClassNames,
        themeStyles: contextStyles(),
        classNames: options?.classNames?.(),
        name: options?.name,
      });
    });

    return classes;
  }

  return useStyles;
}
