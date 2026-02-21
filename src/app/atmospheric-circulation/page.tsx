"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Grid, Paper, Typography, Box } from "@mui/material";
import CirculationCrossSection from "@/components/atmospheric-circulation/CirculationCrossSection";
import WindPatternGlobe from "@/components/atmospheric-circulation/WindPatternGlobe";
import CirculationControls from "@/components/atmospheric-circulation/CirculationControls";
import CellInfoCard from "@/components/atmospheric-circulation/CellInfoCard";
import { CELLS, type CellId, type TopicId } from "@/lib/atmospheric";

export default function AtmosphericCirculationPage() {
  const [month, setMonth] = useState(7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicId | null>(null);
  const [showCells, setShowCells] = useState(true);
  const [showPressureZones, setShowPressureZones] = useState(true);
  const [showWindArrows, setShowWindArrows] = useState(true);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  const highlightedCell: CellId | null =
    selectedTopic &&
    CELLS.some((c) => c.id === selectedTopic)
      ? (selectedTopic as CellId)
      : null;

  const handlePlayToggle = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setMonth(1);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      animRef.current = setInterval(() => {
        setMonth((prev) => (prev >= 12 ? 1 : prev + 1));
      }, 800);
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
        {/* Cross-section diagram */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              大気循環の断面図
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CirculationCrossSection
                month={month}
                highlightedCell={highlightedCell}
                showPressureZones={showPressureZones}
                showWindArrows={showWindArrows}
                showCells={showCells}
                width={780}
                height={480}
              />
            </Box>
            <Box
              sx={{
                mt: 1,
                display: "flex",
                gap: 1.5,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {CELLS.map((cell) => (
                <Box
                  key={cell.id}
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: cell.color,
                      opacity: 0.5,
                      borderRadius: 0.5,
                    }}
                  />
                  <Typography variant="caption">{cell.name}</Typography>
                </Box>
              ))}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 2,
                    bgcolor: "#ef5350",
                    borderTop: "2px dashed #ef5350",
                  }}
                />
                <Typography variant="caption">ITCZ</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Controls */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2}>
            <CirculationControls
              month={month}
              onMonthChange={setMonth}
              isPlaying={isPlaying}
              onPlayToggle={handlePlayToggle}
              onReset={handleReset}
              selectedTopic={selectedTopic}
              onTopicChange={setSelectedTopic}
              showCells={showCells}
              onShowCellsChange={setShowCells}
              showPressureZones={showPressureZones}
              onShowPressureZonesChange={setShowPressureZones}
              showWindArrows={showWindArrows}
              onShowWindArrowsChange={setShowWindArrows}
            />
          </Paper>
        </Grid>

        {/* Globe */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              風向・気圧帯の地球儀
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <WindPatternGlobe
                month={month}
                highlightedCell={highlightedCell}
                showPressureZones={showPressureZones}
                showWindArrows={showWindArrows}
                width={400}
                height={400}
              />
            </Box>
            <Box
              sx={{
                mt: 1,
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 2,
                    bgcolor: "#bdbdbd",
                    borderTop: "1px dashed #bdbdbd",
                  }}
                />
                <Typography variant="caption">赤道</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 2,
                    bgcolor: "#ef5350",
                    borderTop: "2px dashed #ef5350",
                  }}
                />
                <Typography variant="caption">ITCZ</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 8,
                    bgcolor: "#81c784",
                    border: "0.5px solid #388e3c",
                  }}
                />
                <Typography variant="caption">陸地</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Info card */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={2} sx={{ minHeight: 300 }}>
            <CellInfoCard selectedTopic={selectedTopic} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
