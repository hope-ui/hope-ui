import { Property } from "csstype";
import { splitProps } from "solid-js";

import { MarginProps } from "../../styled-system/props/margin";
import { ResponsiveValue } from "../../styled-system/types";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { listStyles } from "./list.styles";

interface ListOptions {
  /**
   * Short hand for the `list-style-type` css property.
   */
  styleType?: Property.ListStyleType;

  /**
   * Short hand for the `list-style-position` css property.
   */
  stylePosition?: Property.ListStylePosition;

  /**
   * The space between each list item.
   */
  spacing?: ResponsiveValue<MarginProps["margin"]>;
}

export type ListProps<C extends ElementType = "ul"> = HTMLHopeProps<C, ListOptions>;

const hopeListClass = "hope-list";

const descendentSelector = "& > *:not(style) ~ *:not(style)";

/**
 * List is used to display list items, it renders a `<ul>` by default.
 */
export function List<C extends ElementType = "ul">(props: ListProps<C>) {
  const [local, others] = splitProps(props, ["class", "styleType", "stylePosition", "spacing"]);

  const spacingStyle = () => (local.spacing ? { [descendentSelector]: { mt: local.spacing } } : {});

  const classes = () => {
    return classNames(
      local.class,
      hopeListClass,
      listStyles({
        css: {
          listStyleType: local.styleType,
          listStylePosition: local.stylePosition,
          ...spacingStyle(),
        },
      })
    );
  };

  return <hope.ul role="list" class={classes()} {...others} />;
}

List.toString = () => createClassSelector(hopeListClass);

/* -------------------------------------------------------------------------------------------------
 * OrderedList
 * -----------------------------------------------------------------------------------------------*/

const hopeOrderedListClass = "hope-ordered-list";

export function OrderedList<C extends ElementType = "ol">(props: ListProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeOrderedListClass);

  return <List as="ol" class={classes()} styleType="decimal" marginStart="1em" {...others} />;
}

OrderedList.toString = () => createClassSelector(hopeOrderedListClass);

/* -------------------------------------------------------------------------------------------------
 * UnorderedList
 * -----------------------------------------------------------------------------------------------*/

const hopeUnorderedListClass = "hope-unordered-list";

export function UnorderedList<C extends ElementType = "ul">(props: ListProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeUnorderedListClass);

  return <List as="ul" class={classes()} styleType="initial" marginStart="1em" {...others} />;
}

UnorderedList.toString = () => createClassSelector(hopeUnorderedListClass);
