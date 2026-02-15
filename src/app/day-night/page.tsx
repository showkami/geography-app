"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import Globe from "@/components/day-night/Globe";
import DaylightContourChart from "@/components/day-night/DaylightContourChart";
import DateControls from "@/components/day-night/DateControls";

export default function DayNightPage() {
  const [dayOfYear, setDayOfYear] = useState(172); // 夏至から開始
  const [hourUTC, setHourUTC] = useState(12); // UTC正午から開始
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<NodeJS.Timeout | null>(null);
  const [contourOpen, setContourOpen] = useState(false);

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
              <Globe dayOfYear={dayOfYear} hourUTC={hourUTC} width={450} height={450} />
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
            />
          </Paper>
        </Grid>

        {/* 右カラム: 等高線プロット */}
        <Grid size={{ xs: 12, md: 7 }}>
          {/* 昼間時間の等高線プロット */}
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                昼間時間の分布（緯度 × 月）
              </Typography>
              <Tooltip title="クリックで拡大表示">
                <IconButton
                  size="small"
                  onClick={() => setContourOpen(true)}
                  sx={{ color: "text.secondary" }}
                >
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              縦軸に緯度、横軸に月をとり、昼間の長さを色で表した等高線図です。暖色ほど昼が長く、寒色ほど短いことを示します。
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: 1,
                transition: "box-shadow 0.2s",
                "&:hover": {
                  boxShadow: "0 0 0 2px rgba(29,78,216,0.3)",
                },
              }}
              onClick={() => setContourOpen(true)}
            >
              <DaylightContourChart
                dayOfYear={dayOfYear}
                width={650}
                height={420}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 拡大ダイアログ */}
      <Dialog
        open={contourOpen}
        onClose={() => setContourOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "min(95vw, 1200px)",
            maxHeight: "95vh",
            p: 2,
            borderRadius: 3,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            昼間時間の分布（緯度 × 月）
          </Typography>
          <IconButton onClick={() => setContourOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          縦軸に緯度、横軸に月をとり、昼間の長さを色で表した等高線図です。暖色ほど昼が長く、寒色ほど短いことを示します。
        </Typography>
        <DialogContent sx={{ p: 0, display: "flex", justifyContent: "center", overflow: "auto" }}>
          <DaylightContourChart
            dayOfYear={dayOfYear}
            width={1100}
            height={660}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
