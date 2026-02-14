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
          minHeight: "calc(100vh - 64px)",
          bgcolor: "background.default",
        }}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
}
