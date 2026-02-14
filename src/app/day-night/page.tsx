"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import Globe from "@/components/day-night/Globe";
import DaylightChart from "@/components/day-night/DaylightChart";
import DateControls from "@/components/day-night/DateControls";

export default function DayNightPage() {
  const [dayOfYear, setDayOfYear] = useState(172); // 夏至から開始
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayToggle = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setDayOfYear(1);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      animRef.current = setInterval(() => {
        setDayOfYear((prev) => (prev >= 365 ? 1 : prev + 1));
      }, 50);
    } else {
      if (animRef.current) clearInterval(animRef.current);
    }
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [isPlaying]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          昼夜の長さと地軸の傾き
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
          地球の地軸は公転面に対して23.4度傾いています。この傾きによって、季節ごとに昼と夜の長さが変化します。
          日付を変えて、地球上の昼夜の境界線がどう変わるか観察しましょう。
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 左カラム: 地球儀 + コントロール */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              地球儀（ドラッグで回転）
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Globe dayOfYear={dayOfYear} width={450} height={450} />
            </Box>
            <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: "rgba(25,25,112,0.35)", border: "1px solid rgba(25,25,112,0.6)" }} />
                <Typography variant="caption">夜の領域</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 12, height: 2, bgcolor: "#f44336" }} />
                <Typography variant="caption">赤道</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 12, height: 2, bgcolor: "#ff9800" }} />
                <Typography variant="caption">回帰線</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 12, height: 2, bgcolor: "#2196f3" }} />
                <Typography variant="caption">極圏</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#ffc107", border: "1px solid #f57f17" }} />
                <Typography variant="caption">太陽直下点</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={2}>
            <DateControls
              dayOfYear={dayOfYear}
              onDayChange={setDayOfYear}
              isPlaying={isPlaying}
              onPlayToggle={handlePlayToggle}
              onReset={handleReset}
            />
          </Paper>
        </Grid>

        {/* 右カラム: グラフ + 解説 */}
        <Grid size={{ xs: 12, md: 7 }}>
          {/* 昼間時間グラフ */}
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              緯度ごとの昼間の長さ（年間変化）
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <DaylightChart
                dayOfYear={dayOfYear}
                width={650}
                height={320}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
