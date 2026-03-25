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

async function getIpLocation(): Promise<{ lat: number; lng: number; countryCode?: string | null }> {
  // Uses a public IP geolocation endpoint (no API key required).
  // If this fails, we fall back to returning an error to the client.
  const response = await fetch("https://ipapi.co/json/", {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 60 * 60 }, // 1 hour
  });

  if (!response.ok) {
    throw new Error("Unable to detect IP location.");
  }

  const data = (await response.json()) as {
    latitude?: number;
    longitude?: number;
    country_code?: string;
  };

  const lat = typeof data.latitude === "number" ? data.latitude : Number(data.latitude);
  const lng = typeof data.longitude === "number" ? data.longitude : Number(data.longitude);
  const countryCode = data.country_code ?? null;

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !isValidLatLng(lat, lng)) {
    throw new Error("Invalid IP location coordinates.");
  }

  return { lat, lng, countryCode };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseCoordinate(searchParams.get("lat"));
    const lng = parseCoordinate(searchParams.get("lng"));

    let latUse: number;
    let lngUse: number;
    let countryCodeOverride: string | null | undefined;

    // If lat/lng isn't provided (homepage load), use IP-based location so we can render faster.
    if (lat !== null && lng !== null && isValidLatLng(lat, lng)) {
      latUse = lat;
      lngUse = lng;
    } else {
      const ip = await getIpLocation();
      latUse = ip.lat;
      lngUse = ip.lng;
      countryCodeOverride = ip.countryCode ?? null;
    }

    // Quantize coordinates to increase cache hits and make homepage load faster.
    const latQ = Math.round(latUse * 100) / 100; // ~1km
    const lngQ = Math.round(lngUse * 100) / 100;

    const weather = await getCurrentWeatherByCoordinates(latQ, lngQ, { countryCodeOverride });

    return NextResponse.json({
      temp_c: weather.tempC,
      temp_f: weather.tempF,
      temp: weather.temp,
      unit: weather.unit,
      conditions: weather.conditions,
      city: weather.city ?? null,
      country_code: weather.countryCode ?? null,
      region: weather.region ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch weather." }, { status: 500 });
  }
}
