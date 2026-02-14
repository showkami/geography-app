"use client";

import React from "react";
import {
  Box,
  Slider,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { doyToDate, MONTH_NAMES_JA, LATITUDE_PRESETS } from "@/lib/solar";

interface DateControlsProps {
  dayOfYear: number;
  onDayChange: (day: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onReset: () => void;
  selectedLatitude: number;
  onLatitudeChange: (lat: number) => void;
}

// 特別な日付
const SPECIAL_DATES = [
  { label: "春分 (3/20)", doy: 80 },
  { label: "夏至 (6/21)", doy: 172 },
  { label: "秋分 (9/22)", doy: 266 },
  { label: "冬至 (12/21)", doy: 355 },
];

export default function DateControls({
  dayOfYear,
  onDayChange,
  isPlaying,
  onPlayToggle,
  onReset,
  selectedLatitude,
  onLatitudeChange,
}: DateControlsProps) {
  const dateInfo = doyToDate(dayOfYear);
  const dateLabel = `${MONTH_NAMES_JA[dateInfo.month - 1]}${dateInfo.day}日`;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        日付選択
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <IconButton
          onClick={onPlayToggle}
          color="primary"
          size="small"
          sx={{ bgcolor: "primary.50", "&:hover": { bgcolor: "primary.100" } }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton onClick={onReset} size="small">
          <RestartAltIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ minWidth: 100, textAlign: "center", fontWeight: 600 }}
        >
          {dateLabel}
        </Typography>
      </Box>

      <Slider
        value={dayOfYear}
        onChange={(_, v) => onDayChange(v as number)}
        min={1}
        max={365}
        step={1}
        sx={{ mb: 2 }}
      />

      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {SPECIAL_DATES.map((d) => (
          <Chip
            key={d.doy}
            label={d.label}
            size="small"
            variant={Math.abs(dayOfYear - d.doy) < 3 ? "filled" : "outlined"}
            color={Math.abs(dayOfYear - d.doy) < 3 ? "primary" : "default"}
            onClick={() => onDayChange(d.doy)}
            sx={{ mb: 0.5 }}
          />
        ))}
      </Stack>

      <FormControl fullWidth size="small">
        <InputLabel>観測緯度</InputLabel>
        <Select
          value={selectedLatitude}
          label="観測緯度"
          onChange={(e) => onLatitudeChange(e.target.value as number)}
        >
          {LATITUDE_PRESETS.map((p) => (
            <MenuItem key={p.value} value={p.value}>
              {p.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
