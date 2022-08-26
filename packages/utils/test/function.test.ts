import { once } from "../src";

describe("function", () => {
  describe("once", () => {
    it("should run the callback once", () => {
      const cb = jest.fn();

      const runOnce = once(cb);

      runOnce();
      runOnce();

      expect(cb).toHaveBeenCalledTimes(1);
    });

    it("should pass params to the callback", () => {
      const cb = jest.fn();

      const runOnce = once((val1: string, val2: boolean) => cb(val1, val2));

      runOnce("test", true);

      expect(cb).toHaveBeenCalledWith("test", true);
    });
  });
});
