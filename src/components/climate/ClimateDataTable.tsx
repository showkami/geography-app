"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import { CityClimateData, MONTH_NAMES_JA } from "@/lib/climate-types";

interface ClimateDataTableProps {
  cities: CityClimateData[];
}

export default function ClimateDataTable({ cities }: ClimateDataTableProps) {
  const [selectedCityId, setSelectedCityId] = useState<string>("");

  const selectedCity =
    cities.find((c) => c.city.id === selectedCityId) ??
    (cities.length > 0 ? cities[cities.length - 1] : null);

  if (cities.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
        都市を追加するとデータが表示されます
      </Typography>
    );
  }

  const normals = selectedCity?.normals;
  if (!normals) return null;

  const Tann = normals.temperature.reduce((a, b) => a + b, 0) / 12;
  const Pann = normals.precipitation.reduce((a, b) => a + b, 0);

  return (
    <Box>
      {cities.length > 1 && (
        <FormControl size="small" fullWidth sx={{ mb: 1 }}>
          <Select
            value={selectedCity?.city.id ?? ""}
            onChange={(e) => setSelectedCityId(e.target.value)}
          >
            {cities.map((cd) => (
              <MenuItem key={cd.city.id} value={cd.city.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: cd.city.color,
                    }}
                  />
                  {cd.city.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Table size="small" sx={{ "& td, & th": { px: 0.5, py: 0.3, fontSize: "0.7rem" } }}>
        <TableHead>
          <TableRow>
            <TableCell />
            {MONTH_NAMES_JA.map((m) => (
              <TableCell key={m} align="right" sx={{ fontWeight: 700 }}>
                {m.replace("月", "")}
              </TableCell>
            ))}
            <TableCell align="right" sx={{ fontWeight: 700, borderLeft: "1px solid rgba(148, 163, 184, 0.15)" }}>
              年
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>気温°C</TableCell>
            {normals.temperature.map((t, i) => (
              <TableCell key={i} align="right">
                {t.toFixed(1)}
              </TableCell>
            ))}
            <TableCell align="right" sx={{ fontWeight: 600, borderLeft: "1px solid rgba(148, 163, 184, 0.15)" }}>
              {Tann.toFixed(1)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>降水mm</TableCell>
            {normals.precipitation.map((p, i) => (
              <TableCell key={i} align="right">
                {p.toFixed(0)}
              </TableCell>
            ))}
            <TableCell align="right" sx={{ fontWeight: 600, borderLeft: "1px solid rgba(148, 163, 184, 0.15)" }}>
              {Pann.toFixed(0)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}
