import { isString } from "../src";

describe("assertion", () => {
  it("is string", () => {
    expect(isString("1")).toBeTruthy();
  });
});
