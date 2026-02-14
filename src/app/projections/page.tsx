"use client";

import React, { useState, useCallback } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import ProjectionMap from "@/components/projections/ProjectionMap";
import ProjectionSelector from "@/components/projections/ProjectionSelector";
import RotationControls from "@/components/projections/RotationControls";
import { PROJECTIONS } from "@/lib/projections";

export default function ProjectionsPage() {
  const [projectionId, setProjectionId] = useState("mercator");
  const [lambda, setLambda] = useState(0);
  const [phi, setPhi] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [showTissot, setShowTissot] = useState(false);

  const currentProj = PROJECTIONS.find((p) => p.id === projectionId);

  const handleRotationChange = useCallback(
    (newLambda: number, newPhi: number) => {
      setLambda(newLambda);
      setPhi(newPhi);
    },
    []
  );

  const handleReset = useCallback(() => {
    setLambda(0);
    setPhi(0);
    setGamma(0);
  }, []);

  const handleProjectionChange = useCallback((id: string) => {
    setProjectionId(id);
    setLambda(0);
    setPhi(0);
    setGamma(0);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        地図投影法エクスプローラー
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        球面である地球を平面の地図に変換する方法を「投影法」といいます。
        それぞれの投影法にはメリット・デメリットがあり、用途に応じて使い分けます。
        投影法を切り替え、ドラッグやスライダーで投影の中心を変えてみましょう。
      </Typography>

      <Grid container spacing={3}>
        {/* 左サイドバー: 投影法選択 + 回転コントロール */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper elevation={2} sx={{ mb: 2 }}>
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="h6" gutterBottom>
                投影法を選択
              </Typography>
            </Box>
            <ProjectionSelector
              selectedId={projectionId}
              onSelect={handleProjectionChange}
            />
          </Paper>

          <Paper elevation={2} sx={{ mb: 2 }}>
            <RotationControls
              lambda={lambda}
              phi={phi}
              gamma={gamma}
              onLambdaChange={setLambda}
              onPhiChange={setPhi}
              onGammaChange={setGamma}
              onReset={handleReset}
            />
          </Paper>

          <Paper elevation={2} sx={{ p: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showTissot}
                  onChange={(e) => setShowTissot(e.target.checked)}
                  color="secondary"
                />
              }
              label="ティソーの指示楕円を表示"
            />
            {showTissot && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                ピンクの円は、球面上では全て同じサイズの円です。
                投影によって形やサイズが変わる様子が歪みを表しています。
                正角図法では円のまま（サイズのみ変化）、正積図法では面積が一定（形が変化）です。
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* メインエリア: 地図 + 情報 */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <ProjectionMap
                projectionId={projectionId}
                lambda={lambda}
                phi={phi}
                gamma={gamma}
                showTissot={showTissot}
                onRotationChange={handleRotationChange}
                width={800}
                height={500}
              />
            </Box>
          </Paper>

          {/* 投影法情報パネル */}
          {currentProj && (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="h5">
                  {currentProj.nameJa}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({currentProj.name})
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Chip
                  label={currentProj.categoryJa}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                {currentProj.propertiesJa.map((prop) => (
                  <Chip
                    key={prop}
                    label={prop}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {currentProj.description}
              </Typography>

              {projectionId === "mercator" && (phi !== 0 || gamma !== 0) && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  φ（緯度回転）やγ（ロール回転）を変更すると、赤道以外の大円を投影の中心軸にした
                  メルカトル図法になります。通常のメルカトル図法は赤道を中心に地球を切り開きますが、
                  この操作により任意の大円を中心にした地図を作ることができます。
                </Alert>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
