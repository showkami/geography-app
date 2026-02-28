import { GeocodingResult, MonthlyNormals } from "./climate-types";

const normalsCache = new Map<string, MonthlyNormals>();

function cacheKey(lat: number, lon: number, startYear: number, endYear: number): string {
  return `${lat.toFixed(2)}_${lon.toFixed(2)}_${startYear}_${endYear}`;
}

/** Open-Meteo Geocoding APIで都市を検索 */
export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=ja`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocoding error: ${response.status}`);
  const data = await response.json();
  return data.results ?? [];
}

/** 429レート制限時に自動リトライするfetch */
async function fetchWithRetry(url: string, maxRetries = 3): Promise<unknown> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url);
    if (response.status === 429) {
      if (attempt === maxRetries) throw new Error("APIレート制限に達しました。しばらく待ってから再試行してください。");
      const retryAfter = response.headers.get("Retry-After");
      const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000 * (attempt + 1);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    if (!response.ok) throw new Error(`Climate API error: ${response.status}`);
    return response.json();
  }
  throw new Error("リトライ回数超過");
}

/** Open-Meteo Historical APIで指定年範囲の日別データを取得し月別平年値に集約 */
export async function fetchMonthlyNormals(
  latitude: number,
  longitude: number,
  startYear: number = 1991,
  endYear: number = 2020
): Promise<MonthlyNormals> {
  const key = cacheKey(latitude, longitude, startYear, endYear);
  const cached = normalsCache.get(key);
  if (cached) return cached;

  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  url.searchParams.set("latitude", latitude.toFixed(4));
  url.searchParams.set("longitude", longitude.toFixed(4));
  url.searchParams.set("start_date", `${startYear}-01-01`);
  url.searchParams.set("end_date", `${endYear}-12-31`);
  url.searchParams.set("daily", "temperature_2m_mean,precipitation_sum");
  url.searchParams.set("timezone", "auto");

  const data = await fetchWithRetry(url.toString()) as { daily: { time: string[]; temperature_2m_mean: (number | null)[]; precipitation_sum: (number | null)[] } };

  const years = endYear - startYear + 1;
  const normals = aggregateToMonthlyNormals(data.daily, years);
  normalsCache.set(key, normals);
  return normals;
}

function aggregateToMonthlyNormals(daily: {
  time: string[];
  temperature_2m_mean: (number | null)[];
  precipitation_sum: (number | null)[];
}, years: number): MonthlyNormals {
  const tempSums = new Float64Array(12);
  const tempCounts = new Uint32Array(12);
  const precipSums = new Float64Array(12);
  const precipCounts = new Float64Array(12);

  for (let i = 0; i < daily.time.length; i++) {
    const month = parseInt(daily.time[i].substring(5, 7), 10) - 1;
    const temp = daily.temperature_2m_mean[i];
    const precip = daily.precipitation_sum[i];

    if (temp !== null && !isNaN(temp)) {
      tempSums[month] += temp;
      tempCounts[month]++;
    }
    if (precip !== null && !isNaN(precip)) {
      precipSums[month] += precip;
      precipCounts[month]++;
    }
  }

  const temperature: number[] = [];
  const precipitation: number[] = [];

  for (let m = 0; m < 12; m++) {
    temperature.push(
      tempCounts[m] > 0 ? tempSums[m] / tempCounts[m] : 0
    );
    // 月降水量 = 全日降水量合計 / 30年
    precipitation.push(
      precipCounts[m] > 0 ? precipSums[m] / years : 0
    );
  }

  return { temperature, precipitation };
}
