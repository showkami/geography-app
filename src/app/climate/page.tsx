"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Container, Grid, Paper, Typography, Box } from "@mui/material";
import CitySearch from "@/components/climate/CitySearch";
import CityList from "@/components/climate/CityList";
import Hythergraph from "@/components/climate/Hythergraph";
import KoppenBadge from "@/components/climate/KoppenBadge";
import ClimateDataTable from "@/components/climate/ClimateDataTable";
import { CityClimateData } from "@/lib/climate-types";
import { makeCityId, assignColor, MAX_CITIES } from "@/lib/climate-cities";
import { fetchMonthlyNormals } from "@/lib/climate-api";
import { classifyKoppen } from "@/lib/koppen";

export default function ClimatePage() {
  const [cities, setCities] = useState<CityClimateData[]>([]);

  const handleAddCity = useCallback(
    (input: { name: string; country: string; latitude: number; longitude: number }) => {
      const id = makeCityId(input.latitude, input.longitude);

      setCities((prev) => {
        if (prev.length >= MAX_CITIES) return prev;
        if (prev.some((c) => c.city.id === id)) return prev;

        const color = assignColor(prev.length);
        const newEntry: CityClimateData = {
          city: { id, name: input.name, country: input.country, latitude: input.latitude, longitude: input.longitude, color },
          normals: null,
          koppen: null,
          loading: true,
          error: null,
        };

        // データ取得を開始
        fetchMonthlyNormals(input.latitude, input.longitude)
          .then((normals) => {
            const koppen = classifyKoppen(normals.temperature, normals.precipitation, input.latitude);
            setCities((curr) =>
              curr.map((c) =>
                c.city.id === id ? { ...c, normals, koppen, loading: false } : c
              )
            );
          })
          .catch((err) => {
            setCities((curr) =>
              curr.map((c) =>
                c.city.id === id ? { ...c, loading: false, error: err.message } : c
              )
            );
          });

        return [...prev, newEntry];
      });
    },
    []
  );

  const handleRemoveCity = useCallback((cityId: string) => {
    setCities((prev) => prev.filter((c) => c.city.id !== cityId));
  }, []);

  const handleClearAll = useCallback(() => {
    setCities([]);
  }, []);

  const disabledIds = useMemo(
    () => new Set(cities.map((c) => c.city.id)),
    [cities]
  );

  const loadedCities = useMemo(
    () => cities.filter((c) => c.normals && c.koppen && !c.loading),
    [cities]
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* 左: ハイサーグラフ */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              ハイサーグラフ
            </Typography>
            <Hythergraph cities={loadedCities} />
          </Paper>
        </Grid>

        {/* 右: 都市検索・リスト */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              都市を選択
            </Typography>
            <CitySearch
              onAddCity={handleAddCity}
              disabledIds={disabledIds}
              disabled={cities.length >= MAX_CITIES}
            />
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              選択中の都市 ({cities.length}/{MAX_CITIES})
            </Typography>
            <CityList
              cities={cities}
              onRemoveCity={handleRemoveCity}
              onClearAll={handleClearAll}
            />
          </Paper>
        </Grid>

        {/* ケッペン分類バッジ */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              ケッペン気候区分
            </Typography>
            <KoppenBadge cities={loadedCities} />
          </Paper>
        </Grid>

        {/* データテーブル */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              月別データ
            </Typography>
            <ClimateDataTable cities={loadedCities} />
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
}
