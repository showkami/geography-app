"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Chip,
  Typography,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { searchCities } from "@/lib/climate-api";
import { GeocodingResult } from "@/lib/climate-types";
import { PRESET_CITIES, PresetCity } from "@/lib/climate-cities";

interface CitySearchProps {
  onAddCity: (city: { name: string; country: string; latitude: number; longitude: number }) => void;
  disabledIds: Set<string>;
  disabled: boolean;
}

export default function CitySearch({ onAddCity, disabledIds, disabled }: CitySearchProps) {
  const [options, setOptions] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleInputChange = useCallback(
    (_: React.SyntheticEvent, value: string) => {
      setInputValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.trim().length < 2) {
        setOptions([]);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const results = await searchCities(value);
          setOptions(results);
        } catch {
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    []
  );

  const handleSelect = useCallback(
    (_: React.SyntheticEvent, value: string | GeocodingResult | null) => {
      if (!value || typeof value === "string") return;
      onAddCity({
        name: value.name,
        country: value.country,
        latitude: value.latitude,
        longitude: value.longitude,
      });
      setInputValue("");
      setOptions([]);
    },
    [onAddCity]
  );

  const handlePresetClick = useCallback(
    (preset: PresetCity) => {
      onAddCity(preset);
    },
    [onAddCity]
  );

  const isPresetDisabled = (preset: PresetCity) => {
    return disabledIds.has(`${preset.latitude.toFixed(2)}_${preset.longitude.toFixed(2)}`);
  };

  return (
    <Box>
      <Autocomplete
        freeSolo
        options={options}
        loading={loading}
        disabled={disabled}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleSelect}
        getOptionLabel={(option) =>
          typeof option === "string"
            ? option
            : `${option.name}${option.admin1 ? `, ${option.admin1}` : ""}, ${option.country}`
        }
        getOptionKey={(option) =>
          typeof option === "string" ? option : `${option.id}`
        }
        renderOption={(props, option) =>
          typeof option === "string" ? null : (
            <li {...props} key={option.id}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {option.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.admin1 ? `${option.admin1}, ` : ""}{option.country}
                  {option.elevation != null && ` (${Math.round(option.elevation)}m)`}
                </Typography>
              </Box>
            </li>
          )
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="都市を検索"
            size="small"
            placeholder="例: Tokyo, Paris..."
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
        noOptionsText="都市が見つかりません"
        loadingText="検索中..."
        sx={{ mb: 1.5 }}
      />

      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
        プリセット都市
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {PRESET_CITIES.map((preset) => (
          <Chip
            key={`${preset.latitude}_${preset.longitude}`}
            label={preset.name}
            size="small"
            icon={<AddIcon />}
            onClick={() => handlePresetClick(preset)}
            disabled={disabled || isPresetDisabled(preset)}
            variant="outlined"
          />
        ))}
      </Box>
    </Box>
  );
}
