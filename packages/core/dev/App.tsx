import {
  Popover,
  PopoverCloseButton,
  PopoverContent,
  PopoverDescription,
  PopoverHeading,
  PopoverTrigger,
} from "../src";

export default function App() {
  return (
    <>
      <Popover trapFocus placement="left">
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverContent p={4}>
          <PopoverHeading>Title</PopoverHeading>
          <PopoverDescription>Desc</PopoverDescription>
          <div>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis, illo?</div>
          <button>button 1</button>
          <button>button 2</button>
          <PopoverCloseButton />
        </PopoverContent>
      </Popover>
    </>
  );
}
