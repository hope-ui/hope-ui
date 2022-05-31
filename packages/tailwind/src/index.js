/* eslint-disable */
const plugin = require("tailwindcss/plugin");

function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

module.exports = plugin(
  function () {
    return;
  },
  {
    theme: {
      extend: {
        colors: {
          primary: {
            1: withOpacityValue("--hope-colors-primary-1"),
            2: withOpacityValue("--hope-colors-primary-2"),
            3: withOpacityValue("--hope-colors-primary-3"),
            4: withOpacityValue("--hope-colors-primary-4"),
            5: withOpacityValue("--hope-colors-primary-5"),
            6: withOpacityValue("--hope-colors-primary-6"),
            7: withOpacityValue("--hope-colors-primary-7"),
            8: withOpacityValue("--hope-colors-primary-8"),
            9: withOpacityValue("--hope-colors-primary-9"),
            10: withOpacityValue("--hope-colors-primary-10"),
            11: withOpacityValue("--hope-colors-primary-11"),
            12: withOpacityValue("--hope-colors-primary-12"),
          },
          accent: {
            1: withOpacityValue("--hope-colors-accent-1"),
            2: withOpacityValue("--hope-colors-accent-2"),
            3: withOpacityValue("--hope-colors-accent-3"),
            4: withOpacityValue("--hope-colors-accent-4"),
            5: withOpacityValue("--hope-colors-accent-5"),
            6: withOpacityValue("--hope-colors-accent-6"),
            7: withOpacityValue("--hope-colors-accent-7"),
            8: withOpacityValue("--hope-colors-accent-8"),
            9: withOpacityValue("--hope-colors-accent-9"),
            10: withOpacityValue("--hope-colors-accent-10"),
            11: withOpacityValue("--hope-colors-accent-11"),
            12: withOpacityValue("--hope-colors-accent-12"),
          },
          neutral: {
            1: withOpacityValue("--hope-colors-neutral-1"),
            2: withOpacityValue("--hope-colors-neutral-2"),
            3: withOpacityValue("--hope-colors-neutral-3"),
            4: withOpacityValue("--hope-colors-neutral-4"),
            5: withOpacityValue("--hope-colors-neutral-5"),
            6: withOpacityValue("--hope-colors-neutral-6"),
            7: withOpacityValue("--hope-colors-neutral-7"),
            8: withOpacityValue("--hope-colors-neutral-8"),
            9: withOpacityValue("--hope-colors-neutral-9"),
            10: withOpacityValue("--hope-colors-neutral-10"),
            11: withOpacityValue("--hope-colors-neutral-11"),
            12: withOpacityValue("--hope-colors-neutral-12"),
          },
          success: {
            1: withOpacityValue("--hope-colors-success-1"),
            2: withOpacityValue("--hope-colors-success-2"),
            3: withOpacityValue("--hope-colors-success-3"),
            4: withOpacityValue("--hope-colors-success-4"),
            5: withOpacityValue("--hope-colors-success-5"),
            6: withOpacityValue("--hope-colors-success-6"),
            7: withOpacityValue("--hope-colors-success-7"),
            8: withOpacityValue("--hope-colors-success-8"),
            9: withOpacityValue("--hope-colors-success-9"),
            10: withOpacityValue("--hope-colors-success-10"),
            11: withOpacityValue("--hope-colors-success-11"),
            12: withOpacityValue("--hope-colors-success-12"),
          },
          info: {
            1: withOpacityValue("--hope-colors-info-1"),
            2: withOpacityValue("--hope-colors-info-2"),
            3: withOpacityValue("--hope-colors-info-3"),
            4: withOpacityValue("--hope-colors-info-4"),
            5: withOpacityValue("--hope-colors-info-5"),
            6: withOpacityValue("--hope-colors-info-6"),
            7: withOpacityValue("--hope-colors-info-7"),
            8: withOpacityValue("--hope-colors-info-8"),
            9: withOpacityValue("--hope-colors-info-9"),
            10: withOpacityValue("--hope-colors-info-10"),
            11: withOpacityValue("--hope-colors-info-11"),
            12: withOpacityValue("--hope-colors-info-12"),
          },
          warning: {
            1: withOpacityValue("--hope-colors-warning-1"),
            2: withOpacityValue("--hope-colors-warning-2"),
            3: withOpacityValue("--hope-colors-warning-3"),
            4: withOpacityValue("--hope-colors-warning-4"),
            5: withOpacityValue("--hope-colors-warning-5"),
            6: withOpacityValue("--hope-colors-warning-6"),
            7: withOpacityValue("--hope-colors-warning-7"),
            8: withOpacityValue("--hope-colors-warning-8"),
            9: withOpacityValue("--hope-colors-warning-9"),
            10: withOpacityValue("--hope-colors-warning-10"),
            11: withOpacityValue("--hope-colors-warning-11"),
            12: withOpacityValue("--hope-colors-warning-12"),
          },
          danger: {
            1: withOpacityValue("--hope-colors-danger-1"),
            2: withOpacityValue("--hope-colors-danger-2"),
            3: withOpacityValue("--hope-colors-danger-3"),
            4: withOpacityValue("--hope-colors-danger-4"),
            5: withOpacityValue("--hope-colors-danger-5"),
            6: withOpacityValue("--hope-colors-danger-6"),
            7: withOpacityValue("--hope-colors-danger-7"),
            8: withOpacityValue("--hope-colors-danger-8"),
            9: withOpacityValue("--hope-colors-danger-9"),
            10: withOpacityValue("--hope-colors-danger-10"),
            11: withOpacityValue("--hope-colors-danger-11"),
            12: withOpacityValue("--hope-colors-danger-12"),
          },
        },
      },
    },
  }
);
