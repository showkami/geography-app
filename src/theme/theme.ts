"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#38bdf8",
      light: "#7dd3fc",
      dark: "#0284c7",
      contrastText: "#0c1222",
    },
    secondary: {
      main: "#c084fc",
      light: "#d8b4fe",
      dark: "#7c3aed",
      contrastText: "#0c1222",
    },
    background: {
      default: "#0c1222",
      paper: "#151d30",
    },
    text: {
      primary: "#e2e8f0",
      secondary: "#94a3b8",
    },
    divider: "rgba(148, 163, 184, 0.12)",
    success: {
      main: "#34d399",
    },
    warning: {
      main: "#fbbf24",
    },
    info: {
      main: "#22d3ee",
    },
    error: {
      main: "#f87171",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      '"Outfit"',
      '"M PLUS 1"',
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "sans-serif",
    ].join(","),
    h2: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
      lineHeight: 1.15,
    },
    h3: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.015em",
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      lineHeight: 1.75,
    },
    body2: {
      lineHeight: 1.65,
    },
    caption: {
      lineHeight: 1.5,
      color: "#94a3b8",
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: "smooth",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(12, 18, 34, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
          color: "#e2e8f0",
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "none",
          backgroundColor: "rgba(21, 29, 48, 0.7)",
          backdropFilter: "blur(12px)",
        },
        elevation1: {
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.2), 0 1px 2px -1px rgb(0 0 0 / 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.08)",
        },
        elevation2: {
          boxShadow:
            "0 2px 8px -2px rgb(0 0 0 / 0.3), 0 1px 3px 0 rgb(0 0 0 / 0.2)",
          border: "1px solid rgba(148, 163, 184, 0.08)",
        },
        elevation3: {
          boxShadow:
            "0 4px 12px -2px rgb(0 0 0 / 0.35), 0 2px 4px -2px rgb(0 0 0 / 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.06)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "none",
          backgroundColor: "rgba(21, 29, 48, 0.7)",
          border: "1px solid rgba(148, 163, 184, 0.08)",
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.2), 0 1px 2px -1px rgb(0 0 0 / 0.15)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow:
              "0 20px 25px -5px rgb(0 0 0 / 0.25), 0 8px 10px -6px rgb(0 0 0 / 0.2)",
            borderColor: "rgba(56, 189, 248, 0.15)",
          },
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none" as const,
          fontWeight: 600,
          padding: "8px 20px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        contained: {
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.2)",
          "&:hover": {
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          borderColor: "rgba(148, 163, 184, 0.2)",
          "&:hover": {
            borderWidth: "1.5px",
            borderColor: "rgba(56, 189, 248, 0.4)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: "none",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          height: 6,
        },
        thumb: {
          width: 18,
          height: 18,
          "&:hover, &.Mui-focusVisible": {
            boxShadow: "0 0 0 8px rgba(56, 189, 248, 0.16)",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: 8,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: "0.8rem",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(148, 163, 184, 0.12)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#151d30",
          backgroundImage: "none",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: "3px 3px 0 0",
          background: "linear-gradient(90deg, #38bdf8, #7dd3fc)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: "#38bdf8",
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(148, 163, 184, 0.12)",
        },
      },
    },
  },
});

export default theme;
