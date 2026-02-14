"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1d4ed8",
      light: "#60a5fa",
      dark: "#1e3a8a",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#7c3aed",
      light: "#a78bfa",
      dark: "#5b21b6",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
    divider: "rgba(226, 232, 240, 0.8)",
    success: {
      main: "#059669",
    },
    warning: {
      main: "#d97706",
    },
    info: {
      main: "#0891b2",
    },
    error: {
      main: "#dc2626",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      '"Noto Sans JP"',
      '"Inter"',
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
      color: "#64748b",
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
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          color: "#0f172a",
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
        },
        elevation1: {
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
        },
        elevation2: {
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 2px 8px -2px rgb(0 0 0 / 0.06)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
        },
        elevation3: {
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
          border: "1px solid rgba(226, 232, 240, 0.6)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "none",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow:
              "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.06)",
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
            "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          "&:hover": {
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
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
            boxShadow: "0 0 0 8px rgba(29, 78, 216, 0.16)",
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
        },
      },
    },
  },
});

export default theme;
