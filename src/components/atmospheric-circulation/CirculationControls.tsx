"use client";

import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { MONTH_NAMES_JA } from "@/lib/atmospheric";
import CircularSlider from "@/components/common/CircularSlider";

interface CirculationControlsProps {
  month: number;
  onMonthChange: (month: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onReset: () => void;
  showCells: boolean;
  onShowCellsChange: (show: boolean) => void;
  showPressureZones: boolean;
  onShowPressureZonesChange: (show: boolean) => void;
  showWindArrows: boolean;
  onShowWindArrowsChange: (show: boolean) => void;
}

const SEASON_QUADRANT_MARKS = [
  { value: 1, label: "冬至" },
  { value: 4, label: "春分" },
  { value: 7, label: "夏至" },
  { value: 10, label: "秋分" },
];

export default function CirculationControls({
  month,
  onMonthChange,
  isPlaying,
  onPlayToggle,
  onReset,
  showCells,
  onShowCellsChange,
  showPressureZones,
  onShowPressureZonesChange,
  showWindArrows,
  onShowWindArrowsChange,
}: CirculationControlsProps) {
  return (
    <Box sx={{ p: 2 }}>
      {/* Month slider */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle2" color="text.secondary">
            月（季節）
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "primary.main", ml: "auto" }}
          >
            {MONTH_NAMES_JA[month - 1]}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <CircularSlider
            value={month}
            onChange={(v) => onMonthChange(Math.round(v))}
            min={1}
            max={12}
            step={1}
            size={180}
            color="#1976d2"
            labels={SEASON_QUADRANT_MARKS}
            fullCircleValue={12}
            startValue={1}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#e2e8f0",
                lineHeight: 1.2,
              }}
            >
              {MONTH_NAMES_JA[month - 1]}
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>月（季節）</div>
          </CircularSlider>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title={isPlaying ? "停止" : "季節を自動再生"}>
              <IconButton
                onClick={onPlayToggle}
                color="primary"
                size="small"
                sx={{
                  bgcolor: "rgba(56, 189, 248, 0.1)",
                  "&:hover": { bgcolor: "rgba(56, 189, 248, 0.2)" },
                }}
              >
                {isPlaying ? (
                  <PauseIcon sx={{ fontSize: 20 }} />
                ) : (
                  <PlayArrowIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="1月にリセット">
              <IconButton onClick={onReset} size="small">
                <RestartAltIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Layer toggles */}
      <Box
        sx={{
          pt: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          mb: 1.5,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
          表示レイヤー
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showCells}
                onChange={(_, v) => onShowCellsChange(v)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                循環セル
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={showPressureZones}
                onChange={(_, v) => onShowPressureZonesChange(v)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                気圧帯
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={showWindArrows}
                onChange={(_, v) => onShowWindArrowsChange(v)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                地表風
              </Typography>
            }
          />
        </Box>
      </Box>

    </Box>
  );
}
