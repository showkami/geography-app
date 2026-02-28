"use client";

import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Chip,
  CircularProgress,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { CityClimateData } from "@/lib/climate-types";

interface CityListProps {
  cities: CityClimateData[];
  onRemoveCity: (cityId: string) => void;
  onClearAll: () => void;
}

export default function CityList({ cities, onRemoveCity, onClearAll }: CityListProps) {
  if (cities.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
        都市を追加してください
      </Typography>
    );
  }

  return (
    <Box>
      <List dense disablePadding>
        {cities.map((cd) => (
          <ListItem
            key={cd.city.id}
            disablePadding
            sx={{ py: 0.3 }}
            secondaryAction={
              <IconButton
                edge="end"
                size="small"
                onClick={() => onRemoveCity(cd.city.id)}
                aria-label={`${cd.city.name}を削除`}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            }
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: cd.city.color,
                mr: 1,
                flexShrink: 0,
              }}
            />
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {cd.city.name}
                  </Typography>
                  {cd.loading && <CircularProgress size={14} />}
                  {cd.koppen && (
                    <Chip
                      label={cd.koppen.code}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    />
                  )}
                </Box>
              }
              secondary={
                cd.error ? (
                  <Alert severity="error" sx={{ py: 0, mt: 0.5, fontSize: "0.7rem" }}>
                    {cd.error}
                  </Alert>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    {cd.city.country}
                  </Typography>
                )
              }
            />
          </ListItem>
        ))}
      </List>
      {cities.length > 1 && (
        <Button
          size="small"
          startIcon={<DeleteSweepIcon />}
          onClick={onClearAll}
          color="inherit"
          sx={{ mt: 0.5, fontSize: "0.75rem" }}
        >
          すべて削除
        </Button>
      )}
    </Box>
  );
}
