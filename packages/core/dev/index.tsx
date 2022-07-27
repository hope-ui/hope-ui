import { createStyles, HopeProvider } from "@hope-ui/styles";
import { render } from "solid-js/web";

const useStyles = createStyles(theme => ({
  button: {
    backgroundColor: theme.colors.blue[600],
    color: "white",
    padding: theme.space[4],
    borderRadius: theme.radii.md,
    cursor: "pointer",
    border: 0,
  },
}));

function App() {
  const { classes } = useStyles();

  return (
    <HopeProvider>
      <button class={classes().button}>Button</button>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
