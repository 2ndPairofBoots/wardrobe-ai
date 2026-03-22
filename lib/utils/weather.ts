type OpenWeatherResponse = {
  weather?: Array<{
    main?: string;
    description?: string;
  }>;
  main?: {
    temp?: number;
  };
};

export type CurrentWeather = {
  tempC: number;
  conditions: string;
};

export async function getCurrentWeatherByCoordinates(lat: number, lng: number): Promise<CurrentWeather> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenWeatherMap API key.");
  }

  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch weather.");
  }

  const data = (await response.json()) as OpenWeatherResponse;
  const temp = data.main?.temp;
  const primaryCondition = data.weather?.[0];
  const conditions = primaryCondition?.main ?? primaryCondition?.description ?? "Unknown";

  if (typeof temp !== "number") {
    throw new Error("Invalid weather response.");
  }

  return {
    tempC: temp,
    conditions,
  };
}
