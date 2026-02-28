"use client";

import React, { useCallback } from "react";
import { Box, Slider, Typography } from "@mui/material";

/** Open-Meteo Archive APIが提供するデータの範囲 */
const MIN_YEAR = 1940;
const MAX_YEAR = 2024;

interface YearRangeSliderProps {
  value: [number, number];
  onChange: (range: [number, number]) => void;
  disabled?: boolean;
}

export default function YearRangeSlider({ value, onChange, disabled }: YearRangeSliderProps) {
  const handleChange = useCallback(
    (_: Event, newValue: number | number[]) => {
      onChange(newValue as [number, number]);
    },
    [onChange]
  );

  const years = value[1] - value[0] + 1;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 1 }}>
      <Typography variant="body2" sx={{ whiteSpace: "nowrap", minWidth: 80, color: "text.secondary" }}>
        {value[0]}–{value[1]}年
      </Typography>
      <Slider
        value={value}
        onChange={handleChange}
        min={MIN_YEAR}
        max={MAX_YEAR}
        disableSwap
        valueLabelDisplay="auto"
        disabled={disabled}
        sx={{ flex: 1 }}
      />
      <Typography variant="body2" sx={{ whiteSpace: "nowrap", minWidth: 40, color: "text.secondary" }}>
        {years}年間
      </Typography>
    </Box>
  );
}
