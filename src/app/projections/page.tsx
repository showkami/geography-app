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
  Chip,
  Alert,
  Button,
  Divider,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ProjectionMap from "@/components/projections/ProjectionMap";
import ProjectionSelector from "@/components/projections/ProjectionSelector";
import RotationControls from "@/components/projections/RotationControls";
import RotationGlobe from "@/components/projections/RotationGlobe";
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
      <Box sx={{ mb: 3 }}>
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
          地図投影法エクスプローラー
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
          球面である地球を平面の地図に変換する方法を「投影法」といいます。
          それぞれの投影法にはメリット・デメリットがあり、用途に応じて使い分けます。
          投影法を切り替え、ドラッグやスライダーで投影の中心を変えてみましょう。
        </Typography>
      </Box>

      {/* ====== 上段: 地球儀+回転コントロール | 地図+ティソー ====== */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* 左: 地球儀 + 回転パラメータ（1枚のカードに統合） */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={2}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* ヘッダー: タイトル + リセット */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
                pt: 1.5,
                pb: 0.5,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                投影の回転
              </Typography>
              <Button
                size="small"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
              >
                リセット
              </Button>
            </Box>

            {/* 地球儀（残りの高さを埋める） */}
            <Box
              sx={{
                flex: "1 1 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                py: 1,
                minHeight: 0,
              }}
            >
              <RotationGlobe
                lambda={lambda}
                phi={phi}
                gamma={gamma}
                size={320}
              />
            </Box>

            <Divider />

            {/* スライダー */}
            <Box sx={{ flex: "none" }}>
              <RotationControls
                lambda={lambda}
                phi={phi}
                gamma={gamma}
                onLambdaChange={setLambda}
                onPhiChange={setPhi}
                onGammaChange={setGamma}
              />
            </Box>
          </Paper>
        </Grid>

        {/* 右: 地図 + ティソートグル */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
            {/* ティソートグル（右上） */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showTissot}
                    onChange={(e) => setShowTissot(e.target.checked)}
                    color="secondary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    ティソーの指示楕円
                  </Typography>
                }
              />
            </Box>

            {/* 地図本体 */}
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

            {/* ティソー補足（表示時のみ） */}
            {showTissot && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 1, textAlign: "center" }}
              >
                ピンクの円は球面上では全て同サイズ。正角図法では円のまま、正積図法では面積が一定。
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ====== 下段: 投影法選択 | 投影法説明 ====== */}
      <Grid container spacing={2}>
        {/* 左: 投影法選択 */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={2}>
            <Box sx={{ p: 2, pb: 0 }}>
              <Typography variant="h6" gutterBottom>
                投影法を選択
              </Typography>
            </Box>
            <ProjectionSelector
              selectedId={projectionId}
              onSelect={handleProjectionChange}
            />
          </Paper>
        </Grid>

        {/* 右: 投影法の説明 */}
        <Grid size={{ xs: 12, md: 5 }}>
          {currentProj && (
            <Paper elevation={2} sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 1,
                  mb: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  {currentProj.nameJa}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentProj.name}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 0.5, mb: 1.5, flexWrap: "wrap" }}>
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

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.8 }}
              >
                {currentProj.description}
              </Typography>

              {projectionId === "mercator" && (phi !== 0 || gamma !== 0) && (
                <Alert severity="info" sx={{ mt: 1.5 }} variant="outlined">
                  φやγを変更すると、赤道以外の大円を中心軸にしたメルカトル図法になります。
                  地球儀上の赤い大円が投影の中心軸です。
                </Alert>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
