"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PublicIcon from "@mui/icons-material/Public";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import MapIcon from "@mui/icons-material/Map";
import HomeIcon from "@mui/icons-material/Home";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "ホーム", href: "/", icon: <HomeIcon /> },
  { label: "昼夜の長さと地軸", href: "/day-night", icon: <WbSunnyIcon /> },
  { label: "投影法エクスプローラー", href: "/projections", icon: <MapIcon /> },
];

export default function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pathname = usePathname();

  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1, color: "primary.main" }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
              flexGrow: 1,
            }}
          >
            <PublicIcon sx={{ color: "primary.main", fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              GeoEdu
            </Typography>
          </Box>
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    startIcon={item.icon}
                    sx={{
                      color: isActive ? "primary.main" : "text.secondary",
                      bgcolor: isActive
                        ? "rgba(29, 78, 216, 0.08)"
                        : "transparent",
                      fontWeight: isActive ? 600 : 500,
                      borderRadius: 2,
                      px: 2,
                      "&:hover": {
                        bgcolor: isActive
                          ? "rgba(29, 78, 216, 0.12)"
                          : "rgba(0, 0, 0, 0.04)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            borderRadius: "0 16px 16px 0",
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PublicIcon sx={{ color: "primary.main" }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              GeoEdu
            </Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ px: 1.5 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive
                      ? "rgba(29, 78, 216, 0.08)"
                      : "transparent",
                    color: isActive ? "primary.main" : "text.primary",
                    "&:hover": {
                      bgcolor: isActive
                        ? "rgba(29, 78, 216, 0.12)"
                        : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? "primary.main" : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}
