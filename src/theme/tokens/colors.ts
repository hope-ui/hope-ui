/* -------------------------------------------------------------------------------------------------
 * Common light and dark palette
 * -----------------------------------------------------------------------------------------------*/

const common = {
  transparent: "transparent",
  current: "currentColor",
  black: "hsl(0 0% 0%)",
  white: "hsl(0 0% 100%)",
};

const blackAlpha = {
  blackAlpha1: "hsl(0 0% 0% / 0.012)",
  blackAlpha2: "hsl(0 0% 0% / 0.027)",
  blackAlpha3: "hsl(0 0% 0% / 0.047)",
  blackAlpha4: "hsl(0 0% 0% / 0.071)",
  blackAlpha5: "hsl(0 0% 0% / 0.090)",
  blackAlpha6: "hsl(0 0% 0% / 0.114)",
  blackAlpha7: "hsl(0 0% 0% / 0.141)",
  blackAlpha8: "hsl(0 0% 0% / 0.220)",
  blackAlpha9: "hsl(0 0% 0% / 0.439)",
  blackAlpha10: "hsl(0 0% 0% / 0.478)",
  blackAlpha11: "hsl(0 0% 0% / 0.565)",
  blackAlpha12: "hsl(0 0% 0% / 0.910)",
};

const whiteAlpha = {
  whiteAlpha1: "hsl(0 0% 100% / 0)",
  whiteAlpha2: "hsl(0 0% 100% / 0.013)",
  whiteAlpha3: "hsl(0 0% 100% / 0.034)",
  whiteAlpha4: "hsl(0 0% 100% / 0.056)",
  whiteAlpha5: "hsl(0 0% 100% / 0.086)",
  whiteAlpha6: "hsl(0 0% 100% / 0.124)",
  whiteAlpha7: "hsl(0 0% 100% / 0.176)",
  whiteAlpha8: "hsl(0 0% 100% / 0.249)",
  whiteAlpha9: "hsl(0 0% 100% / 0.386)",
  whiteAlpha10: "hsl(0 0% 100% / 0.446)",
  whiteAlpha11: "hsl(0 0% 100% / 0.592)",
  whiteAlpha12: "hsl(0 0% 100% / 0.923)",
};

/* -------------------------------------------------------------------------------------------------
 * Light palette
 * -----------------------------------------------------------------------------------------------*/

const primary = {
  primary1: "hsl(255 65.0% 99.4%)",
  primary2: "hsl(252 100% 99.0%)",
  primary3: "hsl(252 96.9% 97.4%)",
  primary4: "hsl(252 91.5% 95.5%)",
  primary5: "hsl(252 85.1% 93.0%)",
  primary6: "hsl(252 77.8% 89.4%)",
  primary7: "hsl(252 71.0% 83.7%)",
  primary8: "hsl(252 68.6% 76.3%)",
  primary9: "hsl(252 56.0% 57.5%)",
  primary10: "hsl(251 48.1% 53.5%)",
  primary11: "hsl(250 43.0% 48.0%)",
  primary12: "hsl(254 60.0% 18.5%)",
};

const primaryAlpha = {
  primaryAlpha1: "hsl(270 94.3% 34.6% / 0.012)",
  primaryAlpha2: "hsl(252 100% 51.0% / 0.020)",
  primaryAlpha3: "hsl(254 100% 50.0% / 0.051)",
  primaryAlpha4: "hsl(251 98.3% 48.2% / 0.087)",
  primaryAlpha5: "hsl(252 99.0% 45.7% / 0.130)",
  primaryAlpha6: "hsl(251 99.1% 44.0% / 0.189)",
  primaryAlpha7: "hsl(252 99.5% 41.7% / 0.279)",
  primaryAlpha8: "hsl(252 100% 40.7% / 0.400)",
  primaryAlpha9: "hsl(252 99.9% 35.8% / 0.663)",
  primaryAlpha10: "hsl(251 99.6% 32.5% / 0.691)",
  primaryAlpha11: "hsl(250 99.8% 28.4% / 0.726)",
  primaryAlpha12: "hsl(254 99.5% 11.9% / 0.926)",
};

const neutral = {
  neutral1: "hsl(0 0% 99.0%)",
  neutral2: "hsl(0 0% 97.3%)",
  neutral3: "hsl(0 0% 95.1%)",
  neutral4: "hsl(0 0% 93.0%)",
  neutral5: "hsl(0 0% 90.9%)",
  neutral6: "hsl(0 0% 88.7%)",
  neutral7: "hsl(0 0% 85.8%)",
  neutral8: "hsl(0 0% 78.0%)",
  neutral9: "hsl(0 0% 56.1%)",
  neutral10: "hsl(0 0% 52.3%)",
  neutral11: "hsl(0 0% 43.5%)",
  neutral12: "hsl(0 0% 9.0%)",
};

const neutralAlpha = {
  neutralAlpha1: "hsl(0 0% 0% / 0.012)",
  neutralAlpha2: "hsl(0 0% 0% / 0.027)",
  neutralAlpha3: "hsl(0 0% 0% / 0.047)",
  neutralAlpha4: "hsl(0 0% 0% / 0.071)",
  neutralAlpha5: "hsl(0 0% 0% / 0.090)",
  neutralAlpha6: "hsl(0 0% 0% / 0.114)",
  neutralAlpha7: "hsl(0 0% 0% / 0.141)",
  neutralAlpha8: "hsl(0 0% 0% / 0.220)",
  neutralAlpha9: "hsl(0 0% 0% / 0.439)",
  neutralAlpha10: "hsl(0 0% 0% / 0.478)",
  neutralAlpha11: "hsl(0 0% 0% / 0.565)",
  neutralAlpha12: "hsl(0 0% 0% / 0.910)",
};

const success = {
  success1: "hsl(136 50.0% 98.9%)",
  success2: "hsl(138 62.5% 96.9%)",
  success3: "hsl(139 55.2% 94.5%)",
  success4: "hsl(140 48.7% 91.0%)",
  success5: "hsl(141 43.7% 86.0%)",
  success6: "hsl(143 40.3% 79.0%)",
  success7: "hsl(146 38.5% 69.0%)",
  success8: "hsl(151 40.2% 54.1%)",
  success9: "hsl(151 55.0% 41.5%)",
  success10: "hsl(152 57.5% 37.6%)",
  success11: "hsl(153 67.0% 28.5%)",
  success12: "hsl(155 40.0% 14.0%)",
};

const successAlpha = {
  successAlpha1: "hsl(140 94.9% 38.7% / 0.016)",
  successAlpha2: "hsl(138 99.9% 38.5% / 0.051)",
  successAlpha3: "hsl(139 97.7% 36.9% / 0.087)",
  successAlpha4: "hsl(139 98.5% 32.7% / 0.134)",
  successAlpha5: "hsl(141 100% 30.4% / 0.200)",
  successAlpha6: "hsl(142 99.0% 28.9% / 0.295)",
  successAlpha7: "hsl(146 99.5% 27.6% / 0.428)",
  successAlpha8: "hsl(151 99.5% 28.8% / 0.644)",
  successAlpha9: "hsl(151 99.9% 28.0% / 0.812)",
  successAlpha10: "hsl(152 99.6% 25.8% / 0.840)",
  successAlpha11: "hsl(153 99.9% 21.0% / 0.906)",
  successAlpha12: "hsl(155 99.4% 6.2% / 0.918)",
};

const info = {
  info1: "hsl(206 100% 99.2%)",
  info2: "hsl(210 100% 98.0%)",
  info3: "hsl(209 100% 96.5%)",
  info4: "hsl(210 98.8% 94.0%)",
  info5: "hsl(209 95.0% 90.1%)",
  info6: "hsl(209 81.2% 84.5%)",
  info7: "hsl(208 77.5% 76.9%)",
  info8: "hsl(206 81.9% 65.3%)",
  info9: "hsl(206 100% 50.0%)",
  info10: "hsl(208 100% 47.3%)",
  info11: "hsl(211 100% 43.2%)",
  info12: "hsl(211 100% 15.0%)",
};

const infoAlpha = {
  infoAlpha1: "hsl(210 100% 51.0% / 0.016)",
  infoAlpha2: "hsl(210 100% 51.0% / 0.040)",
  infoAlpha3: "hsl(210 100% 50.3% / 0.071)",
  infoAlpha4: "hsl(210 100% 50.1% / 0.118)",
  infoAlpha5: "hsl(208 99.1% 47.1% / 0.189)",
  infoAlpha6: "hsl(209 99.5% 45.3% / 0.283)",
  infoAlpha7: "hsl(208 99.9% 43.8% / 0.412)",
  infoAlpha8: "hsl(206 99.8% 45.1% / 0.632)",
  infoAlpha9: "hsl(206 100% 50.0% / 0.980)",
  infoAlpha10: "hsl(208 100% 47.2% / 0.980)",
  infoAlpha11: "hsl(212 100% 43.0% / 0.980)",
  infoAlpha12: "hsl(213 100% 14.4% / 0.980)",
};

const warning = {
  warning1: "hsl(39 70.0% 99.0%)",
  warning2: "hsl(40 100% 96.5%)",
  warning3: "hsl(44 100% 91.7%)",
  warning4: "hsl(43 100% 86.8%)",
  warning5: "hsl(42 100% 81.8%)",
  warning6: "hsl(38 99.7% 76.3%)",
  warning7: "hsl(36 86.1% 67.1%)",
  warning8: "hsl(35 85.2% 55.1%)",
  warning9: "hsl(39 100% 57.0%)",
  warning10: "hsl(35 100% 55.5%)",
  warning11: "hsl(30 100% 34.0%)",
  warning12: "hsl(20 80.0% 17.0%)",
};

const warningAlpha = {
  warningAlpha1: "hsl(40 94.9% 38.7% / 0.016)",
  warningAlpha2: "hsl(40 100% 50.3% / 0.071)",
  warningAlpha3: "hsl(44 100% 50.1% / 0.165)",
  warningAlpha4: "hsl(43 100% 50.0% / 0.263)",
  warningAlpha5: "hsl(42 100% 50.0% / 0.365)",
  warningAlpha6: "hsl(38 100% 50.1% / 0.475)",
  warningAlpha7: "hsl(36 99.9% 46.2% / 0.612)",
  warningAlpha8: "hsl(35 99.8% 46.0% / 0.832)",
  warningAlpha9: "hsl(39 100% 50.0% / 0.859)",
  warningAlpha10: "hsl(35 100% 50.0% / 0.891)",
  warningAlpha11: "hsl(29 100% 33.6% / 0.980)",
  warningAlpha12: "hsl(20 99.8% 14.1% / 0.965)",
};

const danger = {
  danger1: "hsl(359 100% 99.4%)",
  danger2: "hsl(359 100% 98.6%)",
  danger3: "hsl(360 100% 96.8%)",
  danger4: "hsl(360 97.9% 94.8%)",
  danger5: "hsl(360 90.2% 91.9%)",
  danger6: "hsl(360 81.7% 87.8%)",
  danger7: "hsl(359 74.2% 81.7%)",
  danger8: "hsl(359 69.5% 74.3%)",
  danger9: "hsl(358 75.0% 59.0%)",
  danger10: "hsl(358 69.4% 55.2%)",
  danger11: "hsl(358 65.0% 48.7%)",
  danger12: "hsl(354 50.0% 14.6%)",
};

const dangerAlpha = {
  dangerAlpha1: "hsl(0 100% 51.0% / 0.012)",
  dangerAlpha2: "hsl(0 100% 51.0% / 0.032)",
  dangerAlpha3: "hsl(0 100% 50.2% / 0.063)",
  dangerAlpha4: "hsl(0 100% 50.0% / 0.102)",
  dangerAlpha5: "hsl(0 99.9% 47.5% / 0.153)",
  dangerAlpha6: "hsl(0 99.5% 44.9% / 0.224)",
  dangerAlpha7: "hsl(359 99.7% 42.7% / 0.318)",
  dangerAlpha8: "hsl(359 99.6% 41.1% / 0.436)",
  dangerAlpha9: "hsl(358 99.9% 42.9% / 0.718)",
  dangerAlpha10: "hsl(358 99.9% 41.0% / 0.761)",
  dangerAlpha11: "hsl(358 99.8% 38.3% / 0.832)",
  dangerAlpha12: "hsl(355 99.3% 7.9% / 0.926)",
};

export const lightColors = {
  ...common,
  ...blackAlpha,
  ...whiteAlpha,

  ...primary,
  ...primaryAlpha,

  ...neutral,
  ...neutralAlpha,

  ...success,
  ...successAlpha,

  ...info,
  ...infoAlpha,

  ...warning,
  ...warningAlpha,

  ...danger,
  ...dangerAlpha,
};

/* -------------------------------------------------------------------------------------------------
 * Dark palette
 * -----------------------------------------------------------------------------------------------*/

const primaryDark = {
  primary1: "hsl(250 20.0% 10.2%)",
  primary2: "hsl(255 30.3% 12.9%)",
  primary3: "hsl(253 37.0% 18.4%)",
  primary4: "hsl(252 40.1% 22.5%)",
  primary5: "hsl(252 42.2% 26.2%)",
  primary6: "hsl(251 44.3% 31.1%)",
  primary7: "hsl(250 46.8% 38.9%)",
  primary8: "hsl(250 51.8% 51.2%)",
  primary9: "hsl(252 56.0% 57.5%)",
  primary10: "hsl(251 63.2% 63.2%)",
  primary11: "hsl(250 95.0% 76.8%)",
  primary12: "hsl(252 87.0% 96.4%)",
};

const primaryDarkAlpha = {
  primaryAlpha1: "hsl(0 0% 0% / 0)",
  primaryAlpha2: "hsl(258 98.2% 61.0% / 0.054)",
  primaryAlpha3: "hsl(252 98.8% 65.8% / 0.148)",
  primaryAlpha4: "hsl(253 99.7% 65.7% / 0.219)",
  primaryAlpha5: "hsl(252 99.7% 66.4% / 0.286)",
  primaryAlpha6: "hsl(251 99.7% 66.2% / 0.371)",
  primaryAlpha7: "hsl(250 99.7% 66.3% / 0.514)",
  primaryAlpha8: "hsl(250 99.7% 66.1% / 0.733)",
  primaryAlpha9: "hsl(252 99.9% 70.3% / 0.786)",
  primaryAlpha10: "hsl(251 99.9% 72.9% / 0.844)",
  primaryAlpha11: "hsl(250 100% 77.9% / 0.980)",
  primaryAlpha12: "hsl(254 100% 97.5% / 0.980)",
};

const neutralDark = {
  neutral1: "hsl(0 0% 8.5%)",
  neutral2: "hsl(0 0% 11.0%)",
  neutral3: "hsl(0 0% 13.6%)",
  neutral4: "hsl(0 0% 15.8%)",
  neutral5: "hsl(0 0% 17.9%)",
  neutral6: "hsl(0 0% 20.5%)",
  neutral7: "hsl(0 0% 24.3%)",
  neutral8: "hsl(0 0% 31.2%)",
  neutral9: "hsl(0 0% 43.9%)",
  neutral10: "hsl(0 0% 49.4%)",
  neutral11: "hsl(0 0% 62.8%)",
  neutral12: "hsl(0 0% 93.0%)",
};

const neutralDarkAlpha = {
  neutralAlpha1: "hsl(0 0% 100% / 0)",
  neutralAlpha2: "hsl(0 0% 100% / 0.026)",
  neutralAlpha3: "hsl(0 0% 100% / 0.056)",
  neutralAlpha4: "hsl(0 0% 100% / 0.077)",
  neutralAlpha5: "hsl(0 0% 100% / 0.103)",
  neutralAlpha6: "hsl(0 0% 100% / 0.129)",
  neutralAlpha7: "hsl(0 0% 100% / 0.172)",
  neutralAlpha8: "hsl(0 0% 100% / 0.249)",
  neutralAlpha9: "hsl(0 0% 100% / 0.386)",
  neutralAlpha10: "hsl(0 0% 100% / 0.446)",
  neutralAlpha11: "hsl(0 0% 100% / 0.592)",
  neutralAlpha12: "hsl(0 0% 100% / 0.923)",
};

const successDark = {
  success1: "hsl(146 30.0% 7.4%)",
  success2: "hsl(155 44.2% 8.4%)",
  success3: "hsl(155 46.7% 10.9%)",
  success4: "hsl(154 48.4% 12.9%)",
  success5: "hsl(154 49.7% 14.9%)",
  success6: "hsl(154 50.9% 17.6%)",
  success7: "hsl(153 51.8% 21.8%)",
  success8: "hsl(151 51.7% 28.4%)",
  success9: "hsl(151 55.0% 41.5%)",
  success10: "hsl(151 49.3% 46.5%)",
  success11: "hsl(151 50.0% 53.2%)",
  success12: "hsl(137 72.0% 94.0%)",
};

const successDarkAlpha = {
  successAlpha1: "hsl(0 0% 0% / 0)",
  successAlpha2: "hsl(169 100% 48.5% / 0.027)",
  successAlpha3: "hsl(162 98.7% 57.9% / 0.070)",
  successAlpha4: "hsl(158 98.6% 59.7% / 0.105)",
  successAlpha5: "hsl(158 98.6% 60.7% / 0.140)",
  successAlpha6: "hsl(156 99.9% 62.0% / 0.187)",
  successAlpha7: "hsl(154 99.5% 63.1% / 0.257)",
  successAlpha8: "hsl(152 99.7% 64.2% / 0.370)",
  successAlpha9: "hsl(151 99.7% 63.8% / 0.605)",
  successAlpha10: "hsl(152 99.9% 66.5% / 0.661)",
  successAlpha11: "hsl(151 99.7% 69.2% / 0.740)",
  successAlpha12: "hsl(137 100% 95.8% / 0.980)",
};

const infoDark = {
  info1: "hsl(212 35.0% 9.2%)",
  info2: "hsl(216 50.0% 11.8%)",
  info3: "hsl(214 59.4% 15.3%)",
  info4: "hsl(214 65.8% 17.9%)",
  info5: "hsl(213 71.2% 20.2%)",
  info6: "hsl(212 77.4% 23.1%)",
  info7: "hsl(211 85.1% 27.4%)",
  info8: "hsl(211 89.7% 34.1%)",
  info9: "hsl(206 100% 50.0%)",
  info10: "hsl(209 100% 60.6%)",
  info11: "hsl(210 100% 66.1%)",
  info12: "hsl(206 98.0% 95.8%)",
};

const infoDarkAlpha = {
  infoAlpha1: "hsl(0 0% 0% / 0)",
  infoAlpha2: "hsl(221 97.8% 52.4% / 0.059)",
  infoAlpha3: "hsl(215 99.3% 54.2% / 0.135)",
  infoAlpha4: "hsl(215 99.3% 53.8% / 0.198)",
  infoAlpha5: "hsl(213 99.4% 52.8% / 0.252)",
  infoAlpha6: "hsl(212 99.9% 51.7% / 0.323)",
  infoAlpha7: "hsl(211 100% 50.7% / 0.435)",
  infoAlpha8: "hsl(211 99.8% 50.9% / 0.597)",
  infoAlpha9: "hsl(205 100% 50.0% / 0.980)",
  infoAlpha10: "hsl(208 100% 60.7% / 0.980)",
  infoAlpha11: "hsl(209 100% 66.3% / 0.980)",
  infoAlpha12: "hsl(196 100% 96.8% / 0.980)",
};

const warningDark = {
  warning1: "hsl(36 100% 6.1%)",
  warning2: "hsl(35 100% 7.6%)",
  warning3: "hsl(32 100% 10.2%)",
  warning4: "hsl(32 100% 12.4%)",
  warning5: "hsl(33 100% 14.6%)",
  warning6: "hsl(35 100% 17.1%)",
  warning7: "hsl(35 91.0% 21.6%)",
  warning8: "hsl(36 100% 25.5%)",
  warning9: "hsl(39 100% 57.0%)",
  warning10: "hsl(43 100% 64.0%)",
  warning11: "hsl(39 90.0% 49.8%)",
  warning12: "hsl(39 97.0% 93.2%)",
};

const warningDarkAlpha = {
  warningAlpha1: "hsl(0 0% 0% / 0)",
  warningAlpha2: "hsl(31 100% 49.7% / 0.036)",
  warningAlpha3: "hsl(27 100% 49.9% / 0.094)",
  warningAlpha4: "hsl(29 100% 50.0% / 0.143)",
  warningAlpha5: "hsl(31 100% 50.0% / 0.192)",
  warningAlpha6: "hsl(35 100% 50.0% / 0.250)",
  warningAlpha7: "hsl(34 99.6% 52.9% / 0.331)",
  warningAlpha8: "hsl(36 100% 50.0% / 0.442)",
  warningAlpha9: "hsl(40 100% 57.2% / 0.980)",
  warningAlpha10: "hsl(44 100% 64.2% / 0.980)",
  warningAlpha11: "hsl(39 99.9% 52.7% / 0.938)",
  warningAlpha12: "hsl(45 100% 94.2% / 0.980)",
};

const dangerDark = {
  danger1: "hsl(353 23.0% 9.8%)",
  danger2: "hsl(357 34.4% 12.0%)",
  danger3: "hsl(356 43.4% 16.4%)",
  danger4: "hsl(356 47.6% 19.2%)",
  danger5: "hsl(356 51.1% 21.9%)",
  danger6: "hsl(356 55.2% 25.9%)",
  danger7: "hsl(357 60.2% 31.8%)",
  danger8: "hsl(358 65.0% 40.4%)",
  danger9: "hsl(358 75.0% 59.0%)",
  danger10: "hsl(358 85.3% 64.0%)",
  danger11: "hsl(358 100% 69.5%)",
  danger12: "hsl(351 89.0% 96.0%)",
};

const dangerDarkAlpha = {
  dangerAlpha1: "hsl(0 0% 0% / 0)",
  dangerAlpha2: "hsl(5 98.5% 53.8% / 0.045)",
  dangerAlpha3: "hsl(359 99.1% 61.1% / 0.130)",
  dangerAlpha4: "hsl(358 98.8% 61.0% / 0.184)",
  dangerAlpha5: "hsl(357 99.6% 60.3% / 0.237)",
  dangerAlpha6: "hsl(358 99.6% 60.3% / 0.322)",
  dangerAlpha7: "hsl(357 100% 59.5% / 0.442)",
  dangerAlpha8: "hsl(358 99.8% 59.1% / 0.621)",
  dangerAlpha9: "hsl(358 100% 65.5% / 0.884)",
  dangerAlpha10: "hsl(358 100% 67.5% / 0.942)",
  dangerAlpha11: "hsl(358 100% 69.7% / 0.980)",
  dangerAlpha12: "hsl(352 100% 97.1% / 0.980)",
};

export const darkColors = {
  ...primaryDark,
  ...primaryDarkAlpha,

  ...neutralDark,
  ...neutralDarkAlpha,

  ...successDark,
  ...successDarkAlpha,

  ...infoDark,
  ...infoDarkAlpha,

  ...warningDark,
  ...warningDarkAlpha,

  ...dangerDark,
  ...dangerDarkAlpha,
};
