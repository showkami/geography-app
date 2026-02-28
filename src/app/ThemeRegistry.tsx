"use client";

import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme/theme";
import Navigation from "@/components/common/Navigation";
import { Box } from "@mui/material";

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navigation />
      <Box
        component="main"
        sx={{
          minHeight: "calc(100vh - 49px)",
          background: `
            radial-gradient(ellipse at 10% 0%, rgba(56, 189, 248, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 100%, rgba(192, 132, 252, 0.03) 0%, transparent 50%),
            #0c1222
          `,
        }}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
}
