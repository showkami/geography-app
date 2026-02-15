"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AXIAL_TILT_DEFAULT } from "@/lib/solar";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import Globe from "@/components/day-night/Globe";
import DaylightContourChart from "@/components/day-night/DaylightContourChart";
import SolarAltitudeContourChart from "@/components/day-night/SolarAltitudeContourChart";
import DateControls from "@/components/day-night/DateControls";
import ZoomableChartCard from "@/components/day-night/ZoomableChartCard";

export default function DayNightPage() {
  const [dayOfYear, setDayOfYear] = useState(172); // 夏至から開始
  const [hourUTC, setHourUTC] = useState(12); // UTC正午から開始
  const [axialTilt, setAxialTilt] = useState(AXIAL_TILT_DEFAULT); // 地軸の傾き
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
      <Grid container spacing={3}>
        {/* 左カラム: 地球儀 + コントロール */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Globe dayOfYear={dayOfYear} hourUTC={hourUTC} axialTilt={axialTilt} width={450} height={450} />
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
              hourUTC={hourUTC}
              onHourChange={setHourUTC}
              isPlaying={isPlaying}
              onPlayToggle={handlePlayToggle}
              onReset={handleReset}
              axialTilt={axialTilt}
              onAxialTiltChange={setAxialTilt}
            />
          </Paper>
        </Grid>

        {/* 右カラム: 等高線プロット */}
        <Grid size={{ xs: 12, md: 7 }}>
          {/* 昼間時間の等高線プロット */}
          <ZoomableChartCard
            title="昼間時間の分布（緯度 × 月）"
            description=""
            renderChart={(w, h) => (
              <DaylightContourChart
                dayOfYear={dayOfYear}
                axialTilt={axialTilt}
                width={w}
                height={h}
              />
            )}
            paperSx={{ mb: 2 }}
          />

          {/* 太陽南中高度の等高線プロット */}
          <ZoomableChartCard
            title="太陽南中高度の分布（緯度 × 月）"
            description=""
            renderChart={(w, h) => (
              <SolarAltitudeContourChart
                dayOfYear={dayOfYear}
                axialTilt={axialTilt}
                width={w}
                height={h}
              />
            )}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
