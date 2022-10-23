import {
  FormControl,
  FormControlDescription,
  FormControlErrorMessage,
  FormControlLabel,
  Input,
} from "../src";

export default function App() {
  return (
    <>
      <FormControl isRequired maxW={96} m={4}>
        <FormControlLabel for="email">Email address</FormControlLabel>
        <Input id="email" type="email" />
        <FormControlDescription>We'll never share your email.</FormControlDescription>
        <FormControlErrorMessage>Invalid email address.</FormControlErrorMessage>
      </FormControl>
    </>
  );
}
