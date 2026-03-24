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
  conditions: string;
  city?: string;
  countryCode?: string;
  /** State / province when provided by geocoder (e.g. GA, ON). */
  region?: string;
};

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
      cache: "no-store",
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

  const [weatherResponse, locality] = await Promise.all([
    fetch(weatherUrl.toString(), {
      method: "GET",
      cache: "no-store",
    }),
    reverseGeocodeLocality(lat, lng, apiKey),
  ]);

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

  const city = locality.city ?? data.name;
  const countryCode = locality.countryCode ?? data.sys?.country;
  const region = locality.region;

  return {
    tempC: temp,
    conditions,
    city,
    countryCode,
    region,
  };
}
