import { NextResponse } from "next/server";
import { getCurrentWeatherByCoordinates } from "@/lib/utils/weather";

function parseCoordinate(raw: string | null): number | null {
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return value;
}

function isValidLatLng(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseCoordinate(searchParams.get("lat"));
    const lng = parseCoordinate(searchParams.get("lng"));

    if (lat === null || lng === null || !isValidLatLng(lat, lng)) {
      return NextResponse.json(
        { error: "lat and lng query parameters are required and must be valid coordinates." },
        { status: 400 }
      );
    }

    const weather = await getCurrentWeatherByCoordinates(lat, lng);

    return NextResponse.json({
      temp_c: weather.tempC,
      conditions: weather.conditions,
      city: weather.city ?? null,
      country_code: weather.countryCode ?? null,
      region: weather.region ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch weather." }, { status: 500 });
  }
}
