import { Popover, PopoverContent, PopoverTrigger } from "../src";

export default function App() {
  return (
    <>
      <Popover>
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverContent>
          <div>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis, illo?</div>
          <button>button 1</button>
          <button>button 2</button>
        </PopoverContent>
      </Popover>
    </>
  );
}
