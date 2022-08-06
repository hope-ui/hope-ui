import {
  createPolymorphicComponent,
  createStyles,
  DefaultProps,
  hope,
  PartsOf,
} from "@hope-ui/styles";
import { clsx } from "clsx";

import { splitDefaultProps } from "../utils";

const useStyles = createStyles({
  component: "Center",
  styles: {
    root: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
});

export type CenterProps = DefaultProps<PartsOf<typeof useStyles>>;

/**
 * `Center` is used to horizontally and vertically center its child.
 * It uses the popular `display: flex` centering technique.
 */
export const Center = createPolymorphicComponent<"div", CenterProps>(props => {
  const [local, others] = splitDefaultProps(props, ["class"]);

  const { styles, getStaticClass } = useStyles(local);

  return (
    <hope.div
      class={clsx(getStaticClass("root"), local.class)}
      __baseStyle={styles().root}
      {...others}
    />
  );
});
