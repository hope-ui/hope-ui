import { render } from "solid-js/web";

import { HopeProvider, styled } from ".";

const BaseButton = styled("button", {
  // base styles

  variants: {
    size: {
      small: {},
      large: {
        color: "red",
      },
    },
  },
});

const CheckoutButton = styled(BaseButton, {
  // checkout styles
});

function App() {
  return (
    <HopeProvider>
      <BaseButton size="small">Base button</BaseButton>
      <CheckoutButton size="small">Checkout button</CheckoutButton>
      <BaseButton size="large">Base button</BaseButton>
      <CheckoutButton size="large">Checkout button</CheckoutButton>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
