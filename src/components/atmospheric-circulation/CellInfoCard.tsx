"use client";

import React from "react";
import {
  Box,
  Typography,
  Chip,
  Alert,
} from "@mui/material";
import { TOPIC_INFO, type TopicId } from "@/lib/atmospheric";

interface CellInfoCardProps {
  selectedTopic: TopicId | null;
}

export default function CellInfoCard({ selectedTopic }: CellInfoCardProps) {
  if (!selectedTopic) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info" sx={{ fontSize: "0.85rem" }}>
          左の「トピック選択」から項目を選ぶと、詳しい解説が表示されます。
          断面図・地球儀と連動してハイライトされます。
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            大気大循環とは
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            地球全体の大気は、赤道付近で太陽エネルギーを多く受け、極付近では少ないため、
            低緯度から高緯度へ熱を輸送する大規模な循環が生じます。
            この循環は3つのセル（ハドレー循環・フェレル循環・極循環）に分かれ、
            各セルの境界に気圧帯や風系が形成されます。
          </Typography>
        </Box>
      </Box>
    );
  }

  const info = TOPIC_INFO[selectedTopic];

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Box
          sx={{
            width: 8,
            height: 32,
            borderRadius: 4,
            bgcolor: info.color,
          }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {info.title}
          </Typography>
          <Chip
            label={info.subtitle}
            size="small"
            sx={{
              mt: 0.3,
              fontSize: "0.72rem",
              height: 22,
              bgcolor: `${info.color}14`,
              color: info.color,
              fontWeight: 500,
            }}
          />
        </Box>
      </Box>

      <Typography
        variant="body2"
        sx={{ mb: 1.5, lineHeight: 1.75, color: "text.secondary" }}
      >
        {info.description}
      </Typography>

      <Box
        sx={{
          bgcolor: "grey.50",
          borderRadius: 2,
          p: 1.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 0.5, fontSize: "0.8rem", color: info.color }}
        >
          詳細ポイント
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          {info.details.map((detail, i) => (
            <Box
              component="li"
              key={i}
              sx={{ mb: 0.3 }}
            >
              <Typography variant="body2" sx={{ fontSize: "0.82rem", lineHeight: 1.6 }}>
                {detail}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
