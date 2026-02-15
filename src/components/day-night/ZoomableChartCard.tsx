"use client";

import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

interface ZoomableChartCardProps {
  title: string;
  description?: string;
  renderChart: (width: number, height: number) => React.ReactNode;
  cardSize?: { width: number; height: number };
  dialogSize?: { width: number; height: number };
  paperSx?: SxProps<Theme>;
}

export default function ZoomableChartCard({
  title,
  description,
  renderChart,
  cardSize = { width: 650, height: 420 },
  dialogSize = { width: 1100, height: 660 },
  paperSx,
}: ZoomableChartCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Paper elevation={2} sx={{ p: 2, ...paperSx }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            {title}
          </Typography>
          <Tooltip title="クリックで拡大表示">
            <IconButton
              size="small"
              onClick={() => setOpen(true)}
              sx={{ color: "text.secondary" }}
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {description}
          </Typography>
        )}
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
          onClick={() => setOpen(true)}
        >
          {renderChart(cardSize.width, cardSize.height)}
        </Box>
      </Paper>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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
            {title}
          </Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {description}
          </Typography>
        )}
        <DialogContent sx={{ p: 0, display: "flex", justifyContent: "center", overflow: "auto" }}>
          {renderChart(dialogSize.width, dialogSize.height)}
        </DialogContent>
      </Dialog>
    </>
  );
}
