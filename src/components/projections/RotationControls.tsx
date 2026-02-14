"use client";

import React from "react";
import {
  Box,
  Slider,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

interface RotationControlsProps {
  lambda: number;
  phi: number;
  gamma: number;
  onLambdaChange: (v: number) => void;
  onPhiChange: (v: number) => void;
  onGammaChange: (v: number) => void;
  onReset: () => void;
}

export default function RotationControls({
  lambda,
  phi,
  gamma,
  onLambdaChange,
  onPhiChange,
  onGammaChange,
  onReset,
}: RotationControlsProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          投影の回転
        </Typography>
        <Button
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
        >
          リセット
        </Button>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          λ（経度回転）: {lambda.toFixed(0)}°
        </Typography>
        <Slider
          value={lambda}
          onChange={(_, v) => onLambdaChange(v as number)}
          min={-180}
          max={180}
          step={1}
          size="small"
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          φ（緯度回転）: {phi.toFixed(0)}°
        </Typography>
        <Slider
          value={phi}
          onChange={(_, v) => onPhiChange(v as number)}
          min={-90}
          max={90}
          step={1}
          size="small"
        />
      </Box>

      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" gutterBottom>
          γ（ロール回転）: {gamma.toFixed(0)}°
        </Typography>
        <Slider
          value={gamma}
          onChange={(_, v) => onGammaChange(v as number)}
          min={-180}
          max={180}
          step={1}
          size="small"
        />
      </Box>

      <Typography variant="caption" color="text.secondary">
        スライダーを動かすか、地図をドラッグして投影の中心を変更できます。
        メルカトル図法でφやγを変えると、赤道以外の大円を中心にした地図が作れます。
      </Typography>
    </Box>
  );
}
