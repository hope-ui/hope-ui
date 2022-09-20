import { createHopeComponent, hope, mapResponsive, PseudoSelectorValue } from "@hope-ui/styles";
import { ComponentProps, Show, splitProps } from "solid-js";

const defalutTopBorderStyle: PseudoSelectorValue = {
  content: `""`,
  position: "relative",
  borderTop: "thin solid rgba(0, 0, 0, 0.15)",
  width: "100%",
  top: "50%",
  transform: "translateY(50%)",
};

const BaseDivider = hope(
  "div",
  () => ({
    baseStyle: {
      borderTop: "thin solid rgba(0, 0, 0, 0.12)",
      margin: "14px 0",
    },
    variants: {
      hasChildren: {
        true: {
          _after: defalutTopBorderStyle,
          _before: defalutTopBorderStyle,
          borderTop: 0,
          display: "flex",
        },
      },
      orientation: {
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
        true: {
          borderTopStyle: "dashed",
          _after: {
            borderTopStyle: "dashed",
          },
          _before: {
            borderTopStyle: "dashed",
          },
        },
      },
    },
    defaultVariants: {
      dashed: false,
      hasChildren: false,
      orientation: "center",
    },
  }),
  "hope-Divider-root"
);

/**
 * the Divider Wrapper provides inline `text` container based on `span`.
 * @prop `plain`
 */
const DividerWrapper = hope(
  "span",
  () => ({
    baseStyle: {
      display: "inline-block",
      paddingLeft: "3",
      paddingRight: "3",
      fontWeight: "bold",
      fontSize: "1.2em",
    },
    variants: {
      plain: {
        true: {
          fontSize: "1em",
          fontWeight: "normal",
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
  orientation?: "left" | "right" | "center";

  /** line in dashed style. */
  dashed?: boolean;

  /** text in plain style. */
  plain?: boolean;
}

export const Divider = createHopeComponent<"div", DividerProps>(props => {
  const [local, others] = splitProps(props, ["plain"]);
  const { children } = others;

  return (
    <BaseDivider
      {...others}
      hasChildren={mapResponsive(children, children => (children ? true : false))}
    >
      <Show fallback={null} when={children}>
        <DividerWrapper {...local}>{children}</DividerWrapper>
      </Show>
    </BaseDivider>
  );
});
