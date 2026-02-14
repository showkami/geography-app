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
} from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import MapIcon from "@mui/icons-material/Map";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "next/link";

const features = [
  {
    title: "昼夜の長さと地軸の傾き",
    description:
      "地球の地軸が23.4度傾いていることで、季節によって昼と夜の長さがどう変わるかを視覚的に理解できます。インタラクティブな地球儀で昼夜の境界線を観察し、年間の昼間時間の変化をグラフで確認しましょう。",
    icon: <WbSunnyIcon sx={{ fontSize: 48 }} />,
    href: "/day-night",
    color: "#ff9800",
    bgGradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
  },
  {
    title: "地図投影法エクスプローラー",
    description:
      "球面の地球を平面に表す様々な投影法を比較できます。メルカトル、モルワイデ、ロビンソンなど15種類以上の投影法を切り替え、ドラッグで投影中心を自由に変えて歪みの違いを体感しましょう。",
    icon: <MapIcon sx={{ fontSize: 48 }} />,
    href: "/projections",
    color: "#1565c0",
    bgGradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
  },
];

export default function HomePage() {
  return (
    <Box>
      {/* ヒーローセクション */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #1b5e20 100%)",
          color: "white",
          py: { xs: 6, md: 10 },
          px: 3,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}
          >
            GeoEdu
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 400, mb: 3, opacity: 0.9, fontSize: { xs: "1.1rem", md: "1.5rem" } }}
          >
            地理を視覚的に学ぶ
          </Typography>
          <Typography
            variant="body1"
            sx={{ maxWidth: 600, mx: "auto", opacity: 0.85, lineHeight: 1.8 }}
          >
            インタラクティブな可視化を通じて、地球の仕組みや地図の成り立ちを
            直感的に理解できる地理教育ウェブアプリです。
          </Typography>
        </Container>
      </Box>

      {/* 機能カードセクション */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h4"
          align="center"
          sx={{ mb: 4, fontWeight: 600 }}
        >
          学習コンテンツ
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {features.map((feature) => (
            <Grid size={{ xs: 12, sm: 6 }} key={feature.href}>
              <Card
                elevation={3}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 8,
                  },
                }}
              >
                <Box
                  sx={{
                    background: feature.bgGradient,
                    p: 4,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.8 }}
                  >
                    {feature.description}
                  </Typography>
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
                      bgcolor: feature.color,
                      "&:hover": { bgcolor: feature.color, opacity: 0.9 },
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

      {/* フッター */}
      <Box sx={{ bgcolor: "#263238", color: "white", py: 3, textAlign: "center" }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          GeoEdu - 地理教育ウェブアプリ
        </Typography>
      </Box>
    </Box>
  );
}
