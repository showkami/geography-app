"use client";

import React from "react";
import {
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { PROJECTIONS, CATEGORY_LABELS, type ProjectionInfo } from "@/lib/projections";

interface ProjectionSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function ProjectionSelector({
  selectedId,
  onSelect,
}: ProjectionSelectorProps) {
  // カテゴリごとにグループ化
  const grouped = PROJECTIONS.reduce(
    (acc, proj) => {
      if (!acc[proj.category]) acc[proj.category] = [];
      acc[proj.category].push(proj);
      return acc;
    },
    {} as Record<string, ProjectionInfo[]>
  );

  const categories = Object.keys(grouped);

  return (
    <Box>
      {categories.map((cat) => (
        <Accordion key={cat} defaultExpanded disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ minHeight: 40, "& .MuiAccordionSummary-content": { my: 0.5 } }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {CATEGORY_LABELS[cat] || cat}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 1 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {grouped[cat].map((proj) => (
                <Chip
                  key={proj.id}
                  label={proj.nameJa}
                  size="small"
                  variant={selectedId === proj.id ? "filled" : "outlined"}
                  color={selectedId === proj.id ? "primary" : "default"}
                  onClick={() => onSelect(proj.id)}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
