"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
} from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import MapIcon from "@mui/icons-material/Map";
import AirIcon from "@mui/icons-material/Air";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabItems = [
  { label: "昼夜の長さと地軸", href: "/day-night", icon: <WbSunnyIcon /> },
  { label: "投影法エクスプローラー", href: "/projections", icon: <MapIcon /> },
  { label: "大気大循環", href: "/atmospheric-circulation", icon: <AirIcon /> },
];

export default function Navigation() {
  const pathname = usePathname();

  // 現在のパスに対応するタブのインデックスを取得
  const currentTab = tabItems.findIndex((item) => pathname.startsWith(item.href));
  const tabValue = currentTab >= 0 ? currentTab : 0;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          px: { xs: 1, md: 3 },
          minHeight: { xs: 48, sm: 48 },
        }}
      >
        <Tabs
          value={tabValue}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 48,
            "& .MuiTab-root": {
              minHeight: 48,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
            },
          }}
        >
          {tabItems.map((item) => (
            <Tab
              key={item.href}
              icon={item.icon}
              iconPosition="start"
              label={item.label}
              component={Link}
              href={item.href}
            />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}
