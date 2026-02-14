"use client";

import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import MapIcon from "@mui/icons-material/Map";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PublicIcon from "@mui/icons-material/Public";
import Link from "next/link";

const features = [
  {
    title: "昼夜の長さと地軸の傾き",
    description:
      "地球の地軸が23.4度傾いていることで、季節によって昼と夜の長さがどう変わるかを視覚的に理解できます。インタラクティブな地球儀で昼夜の境界線を観察し、年間の昼間時間の変化をグラフで確認しましょう。",
    icon: <WbSunnyIcon sx={{ fontSize: 28 }} />,
    href: "/day-night",
    gradient: "linear-gradient(135deg, #f59e0b, #f97316)",
    lightBg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    tags: ["インタラクティブ", "地球儀", "グラフ"],
  },
  {
    title: "地図投影法エクスプローラー",
    description:
      "球面の地球を平面に表す様々な投影法を比較できます。メルカトル、モルワイデ、ロビンソンなど15種類以上の投影法を切り替え、ドラッグで投影中心を自由に変えて歪みの違いを体感しましょう。",
    icon: <MapIcon sx={{ fontSize: 28 }} />,
    href: "/projections",
    gradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    lightBg: "linear-gradient(135deg, #eff6ff 0%, #ede9fe 100%)",
    tags: ["15種類以上", "ドラッグ操作", "歪み比較"],
  },
];

export default function HomePage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1d4ed8 100%)",
          color: "white",
          py: { xs: 8, md: 14 },
          px: 3,
        }}
      >
        {/* Decorative blurred circles */}
        <Box
          sx={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-30%",
            left: "-5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center" }}>
            <Chip
              icon={<PublicIcon sx={{ fontSize: 16 }} />}
              label="地理教育ウェブアプリ"
              sx={{
                mb: 3,
                bgcolor: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                fontWeight: 500,
                "& .MuiChip-icon": { color: "white" },
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: "2.5rem", md: "3.75rem" },
              }}
            >
              GeoEdu
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                mb: 4,
                opacity: 0.85,
                fontSize: { xs: "1.05rem", md: "1.35rem" },
                lineHeight: 1.7,
              }}
            >
              インタラクティブな可視化で、地球の仕組みや
              <br />
              地図の成り立ちを直感的に理解する
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                component={Link}
                href="/day-night"
                variant="contained"
                size="large"
                startIcon={<WbSunnyIcon />}
                sx={{
                  bgcolor: "white",
                  color: "#1d4ed8",
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.92)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                  },
                }}
              >
                昼夜の長さを学ぶ
              </Button>
              <Button
                component={Link}
                href="/projections"
                variant="outlined"
                size="large"
                startIcon={<MapIcon />}
                sx={{
                  borderColor: "rgba(255,255,255,0.4)",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.8)",
                    bgcolor: "rgba(255,255,255,0.1)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                投影法を探索する
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Feature Cards Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            学習コンテンツ
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 480, mx: "auto" }}
          >
            視覚的なインタラクションを通じて、地理の概念を深く理解しましょう
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {features.map((feature) => (
            <Grid size={{ xs: 12, sm: 6 }} key={feature.href}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow:
                      "0 25px 50px -12px rgb(0 0 0 / 0.12)",
                  },
                }}
              >
                <Box
                  sx={{
                    background: feature.lightBg,
                    p: 3.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    borderRadius: "16px 16px 0 0",
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                      background: feature.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#0f172a" }}
                  >
                    {feature.title}
                  </Typography>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3, pt: 2.5 }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.8, mb: 2 }}
                  >
                    {feature.description}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {feature.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "0.75rem",
                          borderColor: "#cbd5e1",
                          color: "#64748b",
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    component={Link}
                    href={feature.href}
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    fullWidth
                    size="large"
                    sx={{
                      background: feature.gradient,
                      py: 1.3,
                      "&:hover": {
                        background: feature.gradient,
                        opacity: 0.92,
                        boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
                      },
                    }}
                  >
                    学習を始める
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          py: 4,
          textAlign: "center",
          bgcolor: "#f8fafc",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 0.5,
          }}
        >
          <PublicIcon sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            GeoEdu
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          地理教育ウェブアプリ
        </Typography>
      </Box>
    </Box>
  );
}
