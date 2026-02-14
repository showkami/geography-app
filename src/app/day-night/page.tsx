"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import Globe from "@/components/day-night/Globe";
import DaylightChart from "@/components/day-night/DaylightChart";
import AxialTiltDiagram from "@/components/day-night/AxialTiltDiagram";
import DateControls from "@/components/day-night/DateControls";
import { daylightHours, doyToDate, solarDeclination } from "@/lib/solar";

export default function DayNightPage() {
  const [dayOfYear, setDayOfYear] = useState(172); // 夏至から開始
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLatitude, setSelectedLatitude] = useState(45);
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

  const dateInfo = doyToDate(dayOfYear);
  const currentDaylight = daylightHours(selectedLatitude, dayOfYear);
  const declination = solarDeclination(dayOfYear);

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
              selectedLatitude={selectedLatitude}
              onLatitudeChange={setSelectedLatitude}
            />
          </Paper>
        </Grid>

        {/* 右カラム: グラフ + 解説 */}
        <Grid size={{ xs: 12, md: 7 }}>
          {/* 情報カード */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary">
                    日付
                  </Typography>
                  <Typography variant="h6">
                    {dateInfo.month}/{dateInfo.day}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary">
                    太陽赤緯
                  </Typography>
                  <Typography variant="h6">
                    {declination > 0 ? "+" : ""}
                    {declination.toFixed(1)}°
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary">
                    昼の長さ
                  </Typography>
                  <Typography variant="h6">
                    {currentDaylight.toFixed(1)}h
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary">
                    夜の長さ
                  </Typography>
                  <Typography variant="h6">
                    {(24 - currentDaylight).toFixed(1)}h
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 昼間時間グラフ */}
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              緯度ごとの昼間の長さ（年間変化）
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <DaylightChart
                dayOfYear={dayOfYear}
                selectedLatitude={selectedLatitude}
                width={650}
                height={320}
              />
            </Box>
          </Paper>

          {/* 地軸傾斜ダイアグラム */}
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              地軸の傾きと太陽光
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <AxialTiltDiagram
                dayOfYear={dayOfYear}
                width={380}
                height={300}
              />
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              地球の地軸は公転面の垂直方向から23.4度傾いています。
              夏至の頃は北半球が太陽に向かって傾くため、北半球では昼が長くなり、
              冬至の頃は南半球が太陽に向かって傾くため、北半球では夜が長くなります。
              赤道付近ではこの影響が小さく、年間を通じてほぼ12時間ずつです。
              北極圏・南極圏では白夜や極夜が発生します。
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
