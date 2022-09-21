import { createHopeComponent, hope, PseudoSelectorValue } from "@hope-ui/styles";
import { ComponentProps, Show, splitProps } from "solid-js";

const defalutBorderStyle: PseudoSelectorValue = {
  content: `""`,
  position: "relative",
  borderTop: "thin solid rgba(0, 0, 0, 0.12)",
  width: "100%",
  top: "50%",
  transform: "translateY(50%)",
  borderLeft: 0,
};

const BaseDivider = hope(
  "div",
  () => ({
    baseStyle: {
      whiteSpace: "nowrap",
    },
    variants: {
      hasChildren: {
        true: {
          _after: defalutBorderStyle,
          _before: defalutBorderStyle,
          borderTop: 0,
          display: "flex",
          margin: "14px 0",
        },
        false: {
          borderTop: "thin solid rgba(0, 0, 0, 0.12)",
          margin: "24px 0",
        },
      },
      textPosition: {
        center: {},
        left: {
          _after: {
            width: "90%",
          },
          _before: {
            width: "10%",
          },
        },
        right: {
          _after: {
            width: "10%",
          },
          _before: {
            width: "90%",
          },
        },
      },
      dashed: {
        // Cover all situations
        true: {
          borderTopStyle: "dashed",
          borderLeftStyle: "dashed",
          _after: {
            borderTopStyle: "dashed",
            borderLeftStyle: "dashed",
          },
          _before: {
            borderLeftStyle: "dashed",
            borderTopStyle: "dashed",
          },
        },
      },
      orientation: {
        horizontal: {
          borderLeft: 0,
        },
        vertical: {
          // vertical situation only supports flex item or inline.
          borderTop: 0,
          height: "auto",
          borderLeft: "thin solid rgba(0, 0, 0, 0.12)",
          margin: "0 1em",
          display: "inline",
        },
      },
      hasVerticalChildren: {
        // vertical with children use flex.
        true: {
          display: "flex",
          flexDirection: "column",
          borderLeft: 0,
          _before: {
            borderTop: 0,
            borderLeft: "thin solid rgba(0, 0, 0, 0.12)",
            left: "50%",
            top: 0,
            height: "50%",
            transform: "none",
          },
          _after: {
            borderTop: "0",
            borderLeft: "thin solid rgba(0, 0, 0, 0.12)",
            left: "50%",
            top: "0",
            height: "50%",
            transform: "none",
          },
        },
      },
    },
    defaultVariants: {
      dashed: false,
      hasChildren: false,
      textPosition: "center",
      orientation: "horizontal",
      hasVerticalChildren: false,
    },
  }),
  "hope-Divider-root"
);

const DividerWrapper = hope(
  "span",
  () => ({
    baseStyle: {
      display: "inline-block",
      paddingLeft: "3",
      paddingRight: "3",
    },
    variants: {
      plain: {
        true: {
          fontSize: "1em",
          fontWeight: "normal",
        },
        false: {
          fontWeight: "500",
          fontSize: "1.2em",
        },
      },
    },
    defaultVariants: {
      plain: false,
    },
  }),
  "hope-Divier-wrapper"
);

export interface DividerProps extends ComponentProps<typeof BaseDivider> {
  /** text position of Divider */
  textPosition?: "left" | "right" | "center";

  /** line in dashed style */
  dashed?: boolean;

  /** text in plain style */
  plain?: boolean;

  /** Divider direction */
  orientation?: "vertical" | "horizontal";
}

export const Divider = createHopeComponent<"div", DividerProps>(props => {
  const [local, others] = splitProps(props, ["plain"]);
  const { children, orientation } = others;

  const hasChildren = children ? true : false;
  const hasVerticalChildren = orientation === "vertical" && hasChildren;

  return (
    <BaseDivider {...{ hasChildren, hasVerticalChildren, ...others }}>
      <Show fallback={null} when={hasChildren}>
        <DividerWrapper {...local}>{children}</DividerWrapper>
      </Show>
    </BaseDivider>
  );
});
