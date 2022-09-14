import { Show } from "solid-js";
import { Dynamic } from "solid-js/web";

const Sample = (props: any) => {
  return <Dynamic component="span" {...props} />;
};

function Button(props: any) {
  return (
    <button>
      <Show when={props.leftPart}>
        <span>{props.leftPart}</span>
      </Show>
      {props.children}
    </button>
  );
}

export default function Home() {
  return (
    <main>
      <Button leftPart={<Sample />}>Button</Button>
    </main>
  );
}
