"use client";

import React, { useState } from "react";
import {
  Box,
  Chip,
  Typography,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { CityClimateData } from "@/lib/climate-types";
import { KOPPEN_GROUP_COLORS } from "@/lib/koppen";

interface KoppenBadgeProps {
  cities: CityClimateData[];
}

export default function KoppenBadge({ cities }: KoppenBadgeProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (cities.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
        都市を追加するとケッペン分類が表示されます
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      {cities.map((cd) => {
        if (!cd.koppen) return null;
        const isExpanded = expanded === cd.city.id;
        const groupColor = KOPPEN_GROUP_COLORS[cd.koppen.group] ?? "#999";

        return (
          <Box
            key={cd.city.id}
            sx={{
              flex: "1 1 280px",
              maxWidth: 400,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: cd.city.color,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" fontWeight={700}>
                {cd.city.name}
              </Typography>
              <Chip
                label={cd.koppen.code}
                size="small"
                sx={{
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  bgcolor: groupColor,
                  color: "#fff",
                  height: 24,
                }}
              />
            </Box>

            <Typography variant="body2" fontWeight={600}>
              {cd.koppen.nameJa}
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                ({cd.koppen.nameEn})
              </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {cd.koppen.description}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                判定基準の詳細
              </Typography>
              <IconButton
                size="small"
                onClick={() => setExpanded(isExpanded ? null : cd.city.id)}
                sx={{
                  transform: isExpanded ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            </Box>

            <Collapse in={isExpanded}>
              <Table size="small" sx={{ mt: 0.5 }}>
                <TableBody>
                  {cd.koppen.criteria.map((c, i) => (
                    <TableRow key={i} sx={{ "& td": { py: 0.3, border: 0 } }}>
                      <TableCell sx={{ width: 20, px: 0 }}>
                        {c.met ? (
                          <CheckCircleIcon sx={{ fontSize: 14, color: "success.main" }} />
                        ) : (
                          <CancelIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{c.label}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" fontWeight={600}>
                          {c.value}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {c.threshold}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}
