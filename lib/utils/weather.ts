type OpenWeatherResponse = {
  weather?: Array<{
    main?: string;
    description?: string;
  }>;
  main?: {
    temp?: number;
  };
  name?: string;
  sys?: {
    country?: string;
  };
};

type OpenWeatherReverseItem = {
  name?: string;
  country?: string;
  state?: string;
};

export type CurrentWeather = {
  tempC: number;
  tempF: number;
  /** Temperature converted for display (depends on `unit`). */
  temp: number;
  unit: "C" | "F";
  conditions: string;
  city?: string;
  countryCode?: string;
  /** State / province when provided by geocoder (e.g. GA, ON). */
  region?: string;
};

function isImperialCountry(countryCode?: string | null): boolean {
  // Common convention: US, Liberia, and Myanmar use imperial (°F).
  // Everything else defaults to metric (°C).
  const code = countryCode?.toUpperCase();
  return code === "US" || code === "LR" || code === "MM";
}

/**
 * OpenWeather's /data/2.5/weather `name` field is often a regional hub or station city,
 * not the locality for the exact coordinates. Reverse geocoding matches coords better.
 */
async function reverseGeocodeLocality(
  lat: number,
  lng: number,
  apiKey: string
): Promise<{ city?: string; countryCode?: string; region?: string }> {
  const url = new URL("https://api.openweathermap.org/geo/1.0/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("limit", "5");
  url.searchParams.set("appid", apiKey);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
        // Weather/geo data doesn't need to be real-time for homepage display.
        cache: "force-cache",
        next: { revalidate: 60 * 60 }, // 1 hour
    });
    if (!response.ok) return {};
    const data = (await response.json()) as OpenWeatherReverseItem[];
    if (!Array.isArray(data) || data.length === 0) return {};
    const first = data[0];
    return {
      city: first.name,
      countryCode: first.country,
      region: first.state,
    };
  } catch {
    return {};
  }
}

export async function getCurrentWeatherByCoordinates(lat: number, lng: number): Promise<CurrentWeather> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenWeatherMap API key.");
  }

  const weatherUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
  weatherUrl.searchParams.set("lat", String(lat));
  weatherUrl.searchParams.set("lon", String(lng));
  weatherUrl.searchParams.set("appid", apiKey);
  weatherUrl.searchParams.set("units", "metric");

  // Fast path: rely on /weather's `sys.country` + `name` to determine units and display label.
  // Reverse geocoding is only used as a fallback when the country is missing.
  const weatherResponse = await fetch(weatherUrl.toString(), {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 5 * 60 }, // 5 minutes
  });

  if (!weatherResponse.ok) {
    throw new Error("Failed to fetch weather.");
  }

  const data = (await weatherResponse.json()) as OpenWeatherResponse;
  const temp = data.main?.temp;
  const primaryCondition = data.weather?.[0];
  const conditions = primaryCondition?.main ?? primaryCondition?.description ?? "Unknown";

  if (typeof temp !== "number") {
    throw new Error("Invalid weather response.");
  }

  const tempC = temp;
  const tempF = tempC * (9 / 5) + 32;
  const countryCodeFromWeather = data.sys?.country;

  let countryCode = countryCodeFromWeather;
  let region: string | undefined;
  let city = data.name;

  // Fallback for missing country code (rare).
  if (!countryCode) {
    const locality = await reverseGeocodeLocality(lat, lng, apiKey);
    countryCode = locality.countryCode;
    region = locality.region;
    city = locality.city ?? city;
  }

  const unit: "C" | "F" = isImperialCountry(countryCode) ? "F" : "C";
  const tempDisplay = unit === "F" ? tempF : tempC;

  return {
    tempC,
    tempF,
    temp: tempDisplay,
    unit,
    conditions,
    city,
    countryCode,
    region,
  };
}
