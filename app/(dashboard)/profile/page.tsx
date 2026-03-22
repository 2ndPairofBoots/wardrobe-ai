import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

type ProfilePageProps = {
  searchParams?: {
    error?: string;
    success?: string;
  };
};

const styleOptions = ["casual", "streetwear", "minimal", "formal", "sport", "smart-casual"];
const buildOptions = ["slim", "average", "athletic", "curvy", "plus-size"];

type ProfileRow = {
  style_preferences: string[] | null;
  location_city: string | null;
  location_lat: number | null;
  location_lng: number | null;
  height_cm: number | null;
  body_type: string | null;
  body_fit_notes: string[] | null;
  onboarding_complete: boolean;
};

function parseMeasurement(notes: string[] | null, key: "waist_cm" | "leg_cm"): string {
  if (!notes || notes.length === 0) {
    return "";
  }

  const prefix = `${key}:`;
  const entry = notes.find((note) => note.startsWith(prefix));
  return entry ? entry.replace(prefix, "") : "";
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  let profile: ProfileRow | null = null;

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "style_preferences, location_city, location_lat, location_lng, height_cm, body_type, body_fit_notes, onboarding_complete"
      )
      .eq("id", user.id)
      .single();

    if (!error) {
      profile = data as ProfileRow;
    }
  } catch {
    redirect("/login");
  }

  async function completeOnboarding(formData: FormData) {
    "use server";

    const stylePreferences = formData
      .getAll("style_preferences")
      .map((value) => String(value).trim())
      .filter(Boolean);
    const locationCity = String(formData.get("location_city") ?? "").trim();
    const locationLatRaw = String(formData.get("location_lat") ?? "").trim();
    const locationLngRaw = String(formData.get("location_lng") ?? "").trim();
    const heightCmRaw = String(formData.get("height_cm") ?? "").trim();
    const bodyBuild = String(formData.get("body_build") ?? "").trim();
    const waistCmRaw = String(formData.get("waist_cm") ?? "").trim();
    const legCmRaw = String(formData.get("leg_cm") ?? "").trim();

    if (!locationCity || stylePreferences.length === 0) {
      redirect("/profile?error=Please%20select%20at%20least%20one%20style%20and%20enter%20a%20city.");
    }

    if (!bodyBuild || !heightCmRaw || !waistCmRaw || !legCmRaw) {
      redirect(
        "/profile?error=Please%20provide%20your%20body%20build%2C%20height%2C%20waist%2C%20and%20leg%20measurements."
      );
    }

    const locationLat = locationLatRaw ? Number(locationLatRaw) : null;
    const locationLng = locationLngRaw ? Number(locationLngRaw) : null;
    const heightCm = heightCmRaw ? Number(heightCmRaw) : null;
    const waistCm = waistCmRaw ? Number(waistCmRaw) : null;
    const legCm = legCmRaw ? Number(legCmRaw) : null;

    if (
      (locationLatRaw && Number.isNaN(locationLat)) ||
      (locationLngRaw && Number.isNaN(locationLng)) ||
      Number.isNaN(heightCm) ||
      Number.isNaN(waistCm) ||
      Number.isNaN(legCm)
    ) {
      redirect(
        "/profile?error=Latitude%2C%20longitude%2C%20height%2C%20waist%2C%20and%20leg%20size%20must%20be%20valid%20numbers."
      );
    }

    if ((heightCm ?? 0) <= 0 || (waistCm ?? 0) <= 0 || (legCm ?? 0) <= 0) {
      redirect("/profile?error=Height%2C%20waist%2C%20and%20leg%20measurements%20must%20be%20greater%20than%200.");
    }

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        redirect("/login");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          style_preferences: stylePreferences,
          location_city: locationCity,
          location_lat: locationLat,
          location_lng: locationLng,
          height_cm: heightCm,
          body_type: bodyBuild,
          body_fit_notes: [`waist_cm:${waistCm}`, `leg_cm:${legCm}`],
          body_photo_url: null,
          onboarding_complete: true,
        })
        .eq("id", user.id);

      if (error) {
        redirect("/profile?error=Unable%20to%20save%20onboarding%20details.");
      }
    } catch {
      redirect("/profile?error=Unable%20to%20save%20onboarding%20details.");
    }

    redirect("/profile?success=1");
  }

  const selectedStyles = profile?.style_preferences ?? [];
  const selectedBuild = profile?.body_type ?? "";
  const waistCm = parseMeasurement(profile?.body_fit_notes ?? null, "waist_cm");
  const legCm = parseMeasurement(profile?.body_fit_notes ?? null, "leg_cm");
  const error = searchParams?.error;
  const success = searchParams?.success === "1";

  return (
    <main className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Profile</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Manage your preferences, location, and body proportions for better outfit calculations.
      </p>

      {profile?.onboarding_complete ? (
        <p className="mt-4 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success">
          Onboarding is complete. You can update your preferences anytime.
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success">
          Profile details saved successfully.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-text-primary">Body proportions</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Enter your proportions manually. This gives us stable fit inputs without photo analysis.
        </p>

        <div className="mt-5 space-y-2">
          <p className="text-sm font-medium text-text-primary">
            Build: {profile?.body_type ? profile.body_type : "Not provided"}
          </p>
          {profile?.height_cm ? (
            <p className="text-sm text-text-secondary">Height: {profile.height_cm} cm</p>
          ) : null}
          {waistCm || legCm ? (
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-sm text-text-secondary">Saved measurements:</p>
              <ul className="mt-2 space-y-1">
                {waistCm ? <li className="text-sm text-text-primary">- Waist: {waistCm} cm</li> : null}
                {legCm ? <li className="text-sm text-text-primary">- Leg size: {legCm} cm</li> : null}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">
              Add your measurements below to improve fit-based calculations.
            </p>
          )}
        </div>
      </section>

      <form action={completeOnboarding} className="mt-6 space-y-6 rounded-xl border border-border bg-surface p-6">
        <div>
          <p className="mb-3 text-sm font-medium text-text-primary">Style preferences</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {styleOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-secondary"
              >
                <input
                  type="checkbox"
                  name="style_preferences"
                  value={option}
                  defaultChecked={selectedStyles.includes(option)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="capitalize">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="location_city" className="mb-1 block text-sm text-text-secondary">
            City
          </label>
          <input
            id="location_city"
            name="location_city"
            type="text"
            required
            defaultValue={profile?.location_city ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="location_lat" className="mb-1 block text-sm text-text-secondary">
              Latitude (optional)
            </label>
            <input
              id="location_lat"
              name="location_lat"
              type="text"
              defaultValue={profile?.location_lat ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="location_lng" className="mb-1 block text-sm text-text-secondary">
              Longitude (optional)
            </label>
            <input
              id="location_lng"
              name="location_lng"
              type="text"
              defaultValue={profile?.location_lng ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="body_build" className="mb-1 block text-sm text-text-secondary">
              Body build
            </label>
            <select
              id="body_build"
              name="body_build"
              required
              defaultValue={selectedBuild}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
            >
              <option value="" disabled>
                Select your build
              </option>
              {buildOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="height_cm" className="mb-1 block text-sm text-text-secondary">
              Height (cm)
            </label>
            <input
              id="height_cm"
              name="height_cm"
              type="number"
              required
              min={1}
              defaultValue={profile?.height_cm ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="waist_cm" className="mb-1 block text-sm text-text-secondary">
              Waist size (cm)
            </label>
            <input
              id="waist_cm"
              name="waist_cm"
              type="number"
              required
              min={1}
              defaultValue={waistCm}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="leg_cm" className="mb-1 block text-sm text-text-secondary">
              Leg size / inseam (cm)
            </label>
            <input
              id="leg_cm"
              name="leg_cm"
              type="number"
              required
              min={1}
              defaultValue={legCm}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
            />
          </div>
        </div>

        <Button variant="primary" size="md" loading={false}>
          Save profile details
        </Button>
      </form>
    </main>
  );
}
