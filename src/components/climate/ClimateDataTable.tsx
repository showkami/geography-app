"use client";

import React, { useMemo, useState } from "react";
import { FormControl, Select, MenuItem, Typography, Box } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  themeQuartz,
} from "ag-grid-community";
import { CityClimateData, MONTH_NAMES_JA } from "@/lib/climate-types";

ModuleRegistry.registerModules([AllCommunityModule]);

const gridTheme = themeQuartz.withParams({
  backgroundColor: "#151d30",
  foregroundColor: "#e2e8f0",
  headerBackgroundColor: "#0c1222",
  headerTextColor: "#94a3b8",
  headerFontWeight: 700,
  borderColor: "rgba(148, 163, 184, 0.12)",
  rowBorder: { color: "rgba(148, 163, 184, 0.08)" },
  oddRowBackgroundColor: "rgba(56, 189, 248, 0.03)",
  cellHorizontalPaddingScale: 0.6,
  rowVerticalPaddingScale: 0.5,
  fontSize: 12,
  headerFontSize: 12,
  browserColorScheme: "dark",
  wrapperBorder: false,
  wrapperBorderRadius: 0,
});

interface ClimateDataTableProps {
  cities: CityClimateData[];
}

interface RowData {
  month: string;
  temperature: string;
  precipitation: string;
}

export default function ClimateDataTable({ cities }: ClimateDataTableProps) {
  const [selectedCityId, setSelectedCityId] = useState<string>("");

  const selectedCity =
    cities.find((c) => c.city.id === selectedCityId) ??
    (cities.length > 0 ? cities[cities.length - 1] : null);

  const normals = selectedCity?.normals;

  const rowData = useMemo<RowData[]>(() => {
    if (!normals) return [];

    const rows: RowData[] = MONTH_NAMES_JA.map((m, i) => ({
      month: m,
      temperature: normals.temperature[i].toFixed(1),
      precipitation: normals.precipitation[i].toFixed(0),
    }));

    const Tann = normals.temperature.reduce((a, b) => a + b, 0) / 12;
    const Pann = normals.precipitation.reduce((a, b) => a + b, 0);

    rows.push({
      month: "年",
      temperature: Tann.toFixed(1),
      precipitation: Pann.toFixed(0),
    });

    return rows;
  }, [normals]);

  const colDefs = useMemo<ColDef<RowData>[]>(
    () => [
      {
        field: "month",
        headerName: "月",
        width: 70,
        pinned: "left",
        cellStyle: { fontWeight: 600 },
        sortable: false,
      },
      {
        field: "temperature",
        headerName: "気温 (°C)",
        width: 100,
        type: "rightAligned",
        sortable: false,
      },
      {
        field: "precipitation",
        headerName: "降水 (mm)",
        width: 100,
        type: "rightAligned",
        sortable: false,
      },
    ],
    [],
  );

  if (cities.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
        都市を追加するとデータが表示されます
      </Typography>
    );
  }

  if (!normals) return null;

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

      <Box sx={{ width: "100%", height: 410 }}>
        <AgGridReact<RowData>
          theme={gridTheme}
          rowData={rowData}
          columnDefs={colDefs}
          headerHeight={32}
          rowHeight={28}
          domLayout="autoHeight"
          suppressMovableColumns
          suppressCellFocus
          getRowStyle={(params) =>
            params.data?.month === "年"
              ? { fontWeight: "bold", borderTop: "2px solid rgba(148, 163, 184, 0.3)" }
              : undefined
          }
        />
      </Box>
    </Box>
  );
}
