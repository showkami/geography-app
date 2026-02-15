"use client";

import React from "react";
import {
  Box,
  Slider,
  Typography,
} from "@mui/material";

interface RotationControlsProps {
  lambda: number;
  phi: number;
  gamma: number;
  onLambdaChange: (v: number) => void;
  onPhiChange: (v: number) => void;
  onGammaChange: (v: number) => void;
}

export default function RotationControls({
  lambda,
  phi,
  gamma,
  onLambdaChange,
  onPhiChange,
  onGammaChange,
}: RotationControlsProps) {
  const sliderSx = {
    py: 0.5,
    "& .MuiSlider-thumb": { width: 14, height: 14 },
    "& .MuiSlider-rail, & .MuiSlider-track": { height: 3 },
  };

  return (
    <Box sx={{ px: 2, pb: 1.5, pt: 0.5 }}>
      <Box sx={{ mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          λ（経度回転）: {lambda.toFixed(0)}°
        </Typography>
        <Slider
          value={lambda}
          onChange={(_, v) => onLambdaChange(v as number)}
          min={-180}
          max={180}
          step={1}
          size="small"
          sx={sliderSx}
        />
      </Box>

      <Box sx={{ mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          φ（緯度回転）: {phi.toFixed(0)}°
        </Typography>
        <Slider
          value={phi}
          onChange={(_, v) => onPhiChange(v as number)}
          min={-90}
          max={90}
          step={1}
          size="small"
          sx={sliderSx}
        />
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary">
          γ（ロール回転）: {gamma.toFixed(0)}°
        </Typography>
        <Slider
          value={gamma}
          onChange={(_, v) => onGammaChange(v as number)}
          min={-180}
          max={180}
          step={1}
          size="small"
          sx={sliderSx}
        />
      </Box>
    </Box>
  );
}
