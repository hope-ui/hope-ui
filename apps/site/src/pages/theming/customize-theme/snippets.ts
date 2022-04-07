const overrideThemeColors = `// 1. Import the \`HopeThemeConfig\` type
import { HopeThemeConfig, HopeProvider } from "@hope-ui/solid"

// 2. Create a theme config and pass your custom values
const config: HopeThemeConfig = {
  initialColorMode: "system",
  lightTheme: {
    colors: {
      primary1: "#fefcff",
      // ...
      primary12: "#340c3b", 
    }
  },
  darkTheme: {
    colors: {
      primary1: "#1d131d",
      // ...
      primary12: "#fbecfc", 
    }
  },
  components: {
    // Components base styles...
  }
}

// 3. Pass the config to \`HopeProvider\`
<HopeProvider config={config}>
  <App />
</HopeProvider>

// 4. Now you can use these colors in your components
function Usage() {
  return <Box bg="$primary1">Welcome</Box>
}`;

const tokenAliases = `// example theme config
const config: HopeThemeConfig = {
  lightTheme: {
    colors: {
      appBg: "#ffffff",
    }
  },
  darkTheme: {
    colors: {
      appBg: "$neutral3",  // Use the \`$\` prefix to refer to another token in the theme
    }
  },
}`;

const singlePartComponentStyles = `// example theme config
const config: HopeThemeConfig = {
  components: {
    Button: {
      baseStyle: {
        borderRadius: "$full",
        textTransform: "uppercase",
      },
      defaultProps: {
        variant: "subtle",
        colorScheme: "success",
      }
    }
  }
}`;

const multiPartsComponentStyles = `// example theme config
const config: HopeThemeConfig = {
  components: {
    Alert: {
      baseStyle: {
        // Base style for the <Alert /> component
        root: {
          borderRadius: "$full",
        },
        // Base style for the <AlertIcon /> component
        icon: {
          boxSize: "$8",
        },
        // Base style for the <AlertTitle /> component
        title: {
          fontWeight: "$semibold",
          textTransform: "uppercase",
        },
        // Base style for the <AlertDescription /> component
        description: {
          fontSize: "14px",
        }
      },
      defaultProps: {
        // Default props for the <Alert /> component
        root: {
          variant: "solid",
        },
      }
    }
  }
}`;

export const snippets = {
  overrideThemeColors,
  tokenAliases,
  singlePartComponentStyles,
  multiPartsComponentStyles,
};
