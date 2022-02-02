import { Property } from "csstype";

import { KeysOf } from "../types";

/**
 * Types for CSS flexbox  properties
 */
export type FlexboxProps = Partial<{
  /**
   * The CSS `align-items` property.
   *
   * It defines the `align-self` value on all direct children as a group.
   *
   * - In Flexbox, it controls the alignment of items on the Cross Axis.
   * - In Grid Layout, it controls the alignment of items on the Block Axis within their grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/align-items)
   */
  alignItems: Property.AlignItems;

  /**
   * The CSS `align-content` property.
   *
   * It defines the distribution of space between and around
   * content items along a flexbox's cross-axis or a grid's block axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/align-content)
   */
  alignContent: Property.AlignContent;

  /**
   * The CSS `align-self` property.
   *
   * It works like `align-items`, but applies only to a
   * single flexbox item, instead of all of them.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/align-self)
   */
  alignSelf: Property.AlignSelf;

  /**
   * The CSS `justify-items` property.
   *
   * It defines the default `justify-self` for all items of the box,
   * giving them all a default way of justifying each box
   * along the appropriate axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/justify-items)
   */
  justifyItems: Property.JustifyItems;

  /**
   * The CSS `justify-content` property.
   *
   * It defines how the browser distributes space between and around content items
   * along the main-axis of a flex container, and the inline axis of a grid container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/justify-content)
   */
  justifyContent: Property.JustifyContent;

  /**
   * The CSS `justify-self` property.
   *
   * It defines the way a box is justified inside its
   * alignment container along the appropriate axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-flow)
   */
  justifySelf: Property.JustifySelf;

  /**
   * The CSS `flex-wrap` property.
   *
   * It defines whether flex items are forced onto one line or
   * can wrap onto multiple lines. If wrapping is allowed,
   * it sets the direction that lines are stacked.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-wrap)
   */
  flexWrap: Property.FlexWrap;

  /**
   * The CSS `flex-direction` property.
   *
   * It defines how flex items are placed in the flex container
   * defining the main axis and the direction (normal or reversed).
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-direction)
   */
  flexDirection: Property.FlexDirection;

  /**
   * The CSS `flex` property.
   *
   * It defines how a flex item will grow or shrink
   * to fit the space available in its flex container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex)
   */
  flex: Property.Flex;

  /**
   * The CSS `flex-grow` property.
   *
   * It defines how much a flexbox item should grow
   * if there's space available.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-grow)
   */
  flexGrow: Property.FlexGrow;

  /**
   * The CSS `flex-shrink` property.
   *
   * It defines how much a flexbox item should shrink
   * if there's not enough space available.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-shrink)
   */
  flexShrink: Property.FlexShrink;

  /**
   * The CSS `flex-basis` property.
   *
   * It defines the initial main size of a flex item.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-basis)
   */
  flexBasis: Property.FlexBasis;

  /**
   * The CSS `order` property.
   *
   * It defines the order to lay out an item in a flex or grid container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/order)
   */
  order: Property.Order;
}>;

/**
 * Style prop names used in flexbox based components
 */
export const flexboxPropNames: KeysOf<FlexboxProps> = {
  alignItems: true,
  alignContent: true,
  alignSelf: true,
  justifyItems: true,
  justifyContent: true,
  justifySelf: true,
  flexDirection: true,
  flexWrap: true,
  flex: true,
  flexGrow: true,
  flexShrink: true,
  flexBasis: true,
  order: true,
};
