/* -------------------------------------------------------------------------------------------------
 * Common to light and dark palette
 * -----------------------------------------------------------------------------------------------*/

const blackAlpha = {
  blackAlpha1: "#00000003",
  blackAlpha2: "#00000007",
  blackAlpha3: "#0000000c",
  blackAlpha4: "#00000012",
  blackAlpha5: "#00000017",
  blackAlpha6: "#0000001d",
  blackAlpha7: "#00000024",
  blackAlpha8: "#00000038",
  blackAlpha9: "#00000070",
  blackAlpha10: "#0000007a",
  blackAlpha11: "#00000090",
  blackAlpha12: "#000000e8",
};

const whiteAlpha = {
  whiteAlpha1: "#ffffff00",
  whiteAlpha2: "#ffffff03",
  whiteAlpha3: "#ffffff09",
  whiteAlpha4: "#ffffff0e",
  whiteAlpha5: "#ffffff16",
  whiteAlpha6: "#ffffff20",
  whiteAlpha7: "#ffffff2d",
  whiteAlpha8: "#ffffff3f",
  whiteAlpha9: "#ffffff62",
  whiteAlpha10: "#ffffff72",
  whiteAlpha11: "#ffffff97",
  whiteAlpha12: "#ffffffeb",
};

export const commonColors = {
  transparent: "transparent",
  current: "currentColor",
  black: "#000000",
  white: "#ffffff",
  ...blackAlpha,
  ...whiteAlpha,
};

/* -------------------------------------------------------------------------------------------------
 * Light palette
 * -----------------------------------------------------------------------------------------------*/

// Radix - Indigo
const primary = {
  primary1: "#fdfdfe",
  primary2: "#f8faff",
  primary3: "#f0f4ff",
  primary4: "#e6edfe",
  primary5: "#d9e2fc",
  primary6: "#c6d4f9",
  primary7: "#aec0f5",
  primary8: "#8da4ef",
  primary9: "#3e63dd",
  primary10: "#3a5ccc",
  primary11: "#3451b2",
  primary12: "#101d46",
};

const primaryAlpha = {
  primaryAlpha1: "#05058202",
  primaryAlpha2: "#054cff07",
  primaryAlpha3: "#0144ff0f",
  primaryAlpha4: "#0247f519",
  primaryAlpha5: "#023ceb26",
  primaryAlpha6: "#013de439",
  primaryAlpha7: "#0038e051",
  primaryAlpha8: "#0134db72",
  primaryAlpha9: "#0031d2c1",
  primaryAlpha10: "#002cbdc5",
  primaryAlpha11: "#00259ecb",
  primaryAlpha12: "#000e3aef",
};

// Radix - Slate
const neutral = {
  neutral1: "#fbfcfd",
  neutral2: "#f8f9fa",
  neutral3: "#f1f3f5",
  neutral4: "#eceef0",
  neutral5: "#e6e8eb",
  neutral6: "#dfe3e6",
  neutral7: "#d7dbdf",
  neutral8: "#c1c8cd",
  neutral9: "#889096",
  neutral10: "#7e868c",
  neutral11: "#687076",
  neutral12: "#11181c",
};

const neutralAlpha = {
  neutralAlpha1: "#05448204",
  neutralAlpha2: "#05294d07",
  neutralAlpha3: "#0025490e",
  neutralAlpha4: "#021c3713",
  neutralAlpha5: "#02173519",
  neutralAlpha6: "#01213920",
  neutralAlpha7: "#001a3328",
  neutralAlpha8: "#011e323e",
  neutralAlpha9: "#00111e77",
  neutralAlpha10: "#00101b81",
  neutralAlpha11: "#000e1897",
  neutralAlpha12: "#00080cee",
};

// Radix - Green
const success = {
  success1: "#fbfefc",
  success2: "#f2fcf5",
  success3: "#e9f9ee",
  success4: "#ddf3e4",
  success5: "#ccebd7",
  success6: "#b4dfc4",
  success7: "#92ceac",
  success8: "#5bb98c",
  success9: "#30a46c",
  success10: "#299764",
  success11: "#18794e",
  success12: "#153226",
};

const successAlpha = {
  successAlpha1: "#05c04304",
  successAlpha2: "#00c43b0d",
  successAlpha3: "#02ba3c16",
  successAlpha4: "#01a63522",
  successAlpha5: "#009b3633",
  successAlpha6: "#0193364b",
  successAlpha7: "#008c3d6d",
  successAlpha8: "#00934ca4",
  successAlpha9: "#008f4acf",
  successAlpha10: "#008346d6",
  successAlpha11: "#006b3be7",
  successAlpha12: "#002012ea",
};

// Radix - Blue
const info = {
  info1: "#fbfdff",
  info2: "#f5faff",
  info3: "#edf6ff",
  info4: "#e1f0ff",
  info5: "#cee7fe",
  info6: "#b7d9f8",
  info7: "#96c7f2",
  info8: "#5eb0ef",
  info9: "#0091ff",
  info10: "#0081f1",
  info11: "#006adc",
  info12: "#00254d",
};

const infoAlpha = {
  infoAlpha1: "#0582ff04",
  infoAlpha2: "#0582ff0a",
  infoAlpha3: "#0280ff12",
  infoAlpha4: "#0180ff1e",
  infoAlpha5: "#0180ef30",
  infoAlpha6: "#0177e648",
  infoAlpha7: "#0077df69",
  infoAlpha8: "#0082e6a1",
  infoAlpha9: "#0091fffa",
  infoAlpha10: "#0080f1fa",
  infoAlpha11: "#0066dbfa",
  infoAlpha12: "#002149fa",
};

// Radix - Yellow
const warning = {
  warning1: "#fdfdf9",
  warning2: "#fffce8",
  warning3: "#fffbd1",
  warning4: "#fff8bb",
  warning5: "#fef2a4",
  warning6: "#f9e68c",
  warning7: "#efd36c",
  warning8: "#ebbc00",
  warning9: "#f5d90a",
  warning10: "#f7ce00",
  warning11: "#946800",
  warning12: "#35290f",
};

const warningAlpha = {
  warningAlpha1: "#abab0506",
  warningAlpha2: "#ffdd0217",
  warningAlpha3: "#ffea012e",
  warningAlpha4: "#ffe60144",
  warningAlpha5: "#fcdb005b",
  warningAlpha6: "#f2c90073",
  warningAlpha7: "#e3b20093",
  warningAlpha8: "#ebbc00fa",
  warningAlpha9: "#f5d800f5",
  warningAlpha10: "#f7ce00fa",
  warningAlpha11: "#926600fa",
  warningAlpha12: "#291c00f0",
};

// Radix - Red
const danger = {
  danger1: "#fffcfc",
  danger2: "#fff8f8",
  danger3: "#ffefef",
  danger4: "#ffe5e5",
  danger5: "#fdd8d8",
  danger6: "#f9c6c6",
  danger7: "#f3aeaf",
  danger8: "#eb9091",
  danger9: "#e5484d",
  danger10: "#dc3d43",
  danger11: "#cd2b31",
  danger12: "#381316",
};

const dangerAlpha = {
  dangerAlpha1: "#ff050503",
  dangerAlpha2: "#ff050508",
  dangerAlpha3: "#ff010110",
  dangerAlpha4: "#ff00001a",
  dangerAlpha5: "#f2000027",
  dangerAlpha6: "#e4010139",
  dangerAlpha7: "#d9000451",
  dangerAlpha8: "#d100046f",
  dangerAlpha9: "#db0007b7",
  dangerAlpha10: "#d10007c2",
  dangerAlpha11: "#c30007d4",
  dangerAlpha12: "#280003ec",
};

export const lightColors = {
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

// Radix - Indigo dark
const primaryDark = {
  primary1: "#131620",
  primary2: "#15192d",
  primary3: "#192140",
  primary4: "#1c274f",
  primary5: "#1f2c5c",
  primary6: "#22346e",
  primary7: "#273e89",
  primary8: "#2f4eb2",
  primary9: "#3e63dd",
  primary10: "#5373e7",
  primary11: "#849dff",
  primary12: "#eef1fd",
};

const primaryDarkAlpha = {
  primaryAlpha1: "#00000000",
  primaryAlpha2: "#3549fc0f",
  primaryAlpha3: "#3c63fe25",
  primaryAlpha4: "#3d67ff36",
  primaryAlpha5: "#3f69fe45",
  primaryAlpha6: "#3e6bff59",
  primaryAlpha7: "#3d6aff78",
  primaryAlpha8: "#3e6bffa7",
  primaryAlpha9: "#4571ffd8",
  primaryAlpha10: "#5a7effe4",
  primaryAlpha11: "#86a0fffa",
  primaryAlpha12: "#f2f5fffa",
};

// Radix - Slate dark
const neutralDark = {
  neutral1: "#151718",
  neutral2: "#1a1d1e",
  neutral3: "#202425",
  neutral4: "#26292b",
  neutral5: "#2b2f31",
  neutral6: "#313538",
  neutral7: "#3a3f42",
  neutral8: "#4c5155",
  neutral9: "#697177",
  neutral10: "#787f85",
  neutral11: "#9ba1a6",
  neutral12: "#ecedee",
};

const neutralDarkAlpha = {
  neutralAlpha1: "#00000000",
  neutralAlpha2: "#d5feff07",
  neutralAlpha3: "#d6fbfc0f",
  neutralAlpha4: "#e2f0fd15",
  neutralAlpha5: "#dff3fd1c",
  neutralAlpha6: "#dfeffe23",
  neutralAlpha7: "#e0f3ff2e",
  neutralAlpha8: "#e5f2fe44",
  neutralAlpha9: "#e1f1ff69",
  neutralAlpha10: "#e7f3ff78",
  neutralAlpha11: "#eff7ff9d",
  neutralAlpha12: "#fdfeffec",
};

// Radix - Green dark
const successDark = {
  success1: "#0d1912",
  success2: "#0c1f17",
  success3: "#0f291e",
  success4: "#113123",
  success5: "#133929",
  success6: "#164430",
  success7: "#1b543a",
  success8: "#236e4a",
  success9: "#30a46c",
  success10: "#3cb179",
  success11: "#4cc38a",
  success12: "#e5fbeb",
};

const successDarkAlpha = {
  successAlpha1: "#00000000",
  successAlpha2: "#00f7ca07",
  successAlpha3: "#2afebe12",
  successAlpha4: "#33feb31b",
  successAlpha5: "#38feb524",
  successAlpha6: "#3dffb130",
  successAlpha7: "#43ffad42",
  successAlpha8: "#49ffaa5e",
  successAlpha9: "#47ffa69a",
  successAlpha10: "#54ffafa9",
  successAlpha11: "#62ffb3bd",
  successAlpha12: "#eafff0fa",
};

// Radix - Blue dark
const infoDark = {
  info1: "#0f1720",
  info2: "#0f1b2d",
  info3: "#10243e",
  info4: "#102a4c",
  info5: "#0f3058",
  info6: "#0d3868",
  info7: "#0a4481",
  info8: "#0954a5",
  info9: "#0091ff",
  info10: "#369eff",
  info11: "#52a9ff",
  info12: "#eaf6ff",
};

const infoDarkAlpha = {
  infoAlpha1: "#00000000",
  infoAlpha2: "#0f5afc0f",
  infoAlpha3: "#1677fe22",
  infoAlpha4: "#1476fe32",
  infoAlpha5: "#0f7bfe40",
  infoAlpha6: "#097cff52",
  infoAlpha7: "#047dff6f",
  infoAlpha8: "#057eff98",
  infoAlpha9: "#0095fffa",
  infoAlpha10: "#37a1fffa",
  infoAlpha11: "#53acfffa",
  infoAlpha12: "#effbfffa",
};

// Radix - Yellow dark
const warningDark = {
  warning1: "#1c1500",
  warning2: "#221a00",
  warning3: "#2c2100",
  warning4: "#352800",
  warning5: "#3e3000",
  warning6: "#493c00",
  warning7: "#594a05",
  warning8: "#705e00",
  warning9: "#f5d90a",
  warning10: "#ffef5c",
  warning11: "#f0c000",
  warning12: "#fffad1",
};

const warningDarkAlpha = {
  warningAlpha1: "#00000000",
  warningAlpha2: "#facd0007",
  warningAlpha3: "#fdbe0012",
  warningAlpha4: "#fdc2001c",
  warningAlpha5: "#fec70026",
  warningAlpha6: "#fed80033",
  warningAlpha7: "#ffdb1345",
  warningAlpha8: "#fed8005f",
  warningAlpha9: "#ffe20af4",
  warningAlpha10: "#fff45efa",
  warningAlpha11: "#ffcc00ee",
  warningAlpha12: "#ffffd5fa",
};

// Radix - Red dark
const dangerDark = {
  danger1: "#1f1315",
  danger2: "#291415",
  danger3: "#3c181a",
  danger4: "#481a1d",
  danger5: "#541b1f",
  danger6: "#671e22",
  danger7: "#822025",
  danger8: "#aa2429",
  danger9: "#e5484d",
  danger10: "#f2555a",
  danger11: "#ff6369",
  danger12: "#feecee",
};

const dangerDarkAlpha = {
  dangerAlpha1: "#00000000",
  dangerAlpha2: "#fd28150b",
  dangerAlpha3: "#fe3a3d21",
  dangerAlpha4: "#fe39402f",
  dangerAlpha5: "#ff353f3c",
  dangerAlpha6: "#ff353c52",
  dangerAlpha7: "#ff303b71",
  dangerAlpha8: "#ff2f369e",
  dangerAlpha9: "#ff4f55e1",
  dangerAlpha10: "#ff595ff0",
  dangerAlpha11: "#ff646afa",
  dangerAlpha12: "#fff0f2fa",
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
