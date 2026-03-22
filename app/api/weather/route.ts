import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWeatherByCoordinates } from "@/lib/utils/weather";

type ProfileLocation = {
  location_lat: number | null;
  location_lng: number | null;
};

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("location_lat, location_lng")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Unable to load profile location." }, { status: 400 });
    }

    const typedProfile = profile as ProfileLocation;
    if (typedProfile.location_lat === null || typedProfile.location_lng === null) {
      return NextResponse.json({ error: "Location coordinates are missing from profile." }, { status: 400 });
    }

    const weather = await getCurrentWeatherByCoordinates(
      typedProfile.location_lat,
      typedProfile.location_lng
    );

    return NextResponse.json({
      temp_c: weather.tempC,
      conditions: weather.conditions,
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch weather." }, { status: 500 });
  }
}
