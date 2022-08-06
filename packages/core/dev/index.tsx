import { render } from "solid-js/web";

import { HopeProvider } from "../src";

function App() {
  return (
    <HopeProvider withGlobalStyles>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto atque delectus deleniti
      distinctio dolore dolores eius error expedita explicabo in incidunt iusto laborum maxime modi
      molestiae obcaecati praesentium quam quas qui quia quidem rerum sapiente sed unde, veritatis.
      Atque ducimus earum est hic, nam neque nesciunt unde. Ab aspernatur atque, corporis cumque
      debitis delectus dignissimos ducimus eligendi est excepturi facere, fugiat harum id illum
      incidunt laboriosam maiores necessitatibus neque nobis, nulla numquam obcaecati officiis
      pariatur placeat provident quaerat quidem quos tempora voluptates voluptatibus! Aperiam
      assumenda cum, ducimus esse hic minima natus nisi officia quod quos reiciendis repellat
      repellendus similique unde.
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
