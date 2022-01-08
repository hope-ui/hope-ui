import { styled } from "./core/stitches/styled";

const Link = styled("a");

const Button = styled("button", {
  bg: "$danger500",
});

export default function App() {
  return (
    <div>
      Hello
      <Link>A Link</Link>
      <Button as={Link}>A Button as Link</Button>
    </div>
  );
}
