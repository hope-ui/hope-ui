import { ComponentProps } from "solid-js";
import { styled } from "./lib/stitches/styled";

function Card(props: { title: string }) {
  return <div>Card</div>;
}

const Link = styled("a");
const Button = styled("button", { bg: "$danger500" });

export default function App() {
  return (
    <div>
      Hello
      <Link>A Link</Link>
      <Button as={Link}>A Button as Link</Button>
    </div>
  );
}
