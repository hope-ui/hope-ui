import { render } from "solid-js/web";

import { HopeProvider, styled } from ".";

const BaseButton = styled("button", {
  variants: {
    size: {
      small: {
        color: "blue",
      },
      large: {
        color: "red",
      },
    },
  },
});

const CheckoutButton = styled(BaseButton, {
  variants: {
    color: {
      red: {},
      blue: {},
    },
  },
});

function App() {
  return (
    <HopeProvider>
      <BaseButton size="large">Base button</BaseButton>
      <CheckoutButton
        bg={{
          "@initial": "$danger300",
          "@lg": "$success300",
        }}
        _hover={{
          "@initial": {
            bg: "$danger600",
          },
          "@lg": {
            bg: "$success600",
          },
        }}
      >
        Checkout button
      </CheckoutButton>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
