import {
  FormControl,
  FormControlDescription,
  FormControlError,
  FormControlLabel,
  Input,
} from "../src";

export default function App() {
  return (
    <>
      <FormControl isRequired maxW={96} m={4}>
        <FormControlLabel>Email address</FormControlLabel>
        <Input type="email" aria-describedby="chien" />
        <FormControlDescription>We'll never share your email.</FormControlDescription>
        <FormControlError>Invalid email address.</FormControlError>
      </FormControl>
    </>
  );
}
