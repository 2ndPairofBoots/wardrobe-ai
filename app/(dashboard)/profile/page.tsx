import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

type ProfilePageProps = {
  searchParams?: {
    error?: string;
    success?: string;
    analysis_success?: string;
  };
};

const styleOptions = ["casual", "streetwear", "minimal", "formal", "sport", "smart-casual"];

type ProfileRow = {
  style_preferences: string[] | null;
  location_city: string | null;
  location_lat: number | null;
  location_lng: number | null;
  body_photo_url: string | null;
  body_type: string | null;
  body_fit_notes: string[] | null;
  onboarding_complete: boolean;
};

function getProfilePhotoPath(value: string): string {
  if (value.startsWith("profile-photos/")) {
    return value.replace("profile-photos/", "");
  }
  if (value.includes("/storage/v1/object/profile-photos/")) {
    return value.split("/storage/v1/object/profile-photos/")[1] ?? value;
  }
  if (value.includes("/storage/v1/object/public/profile-photos/")) {
    return value.split("/storage/v1/object/public/profile-photos/")[1] ?? value;
  }
  return value;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  let profile: ProfileRow | null = null;
  let bodyPhotoSignedUrl: string | null = null;

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
        "style_preferences, location_city, location_lat, location_lng, body_photo_url, body_type, body_fit_notes, onboarding_complete"
      )
      .eq("id", user.id)
      .single();

    if (!error) {
      profile = data as ProfileRow;

      if (profile.body_photo_url) {
        const photoPath = getProfilePhotoPath(profile.body_photo_url);
        const { data: signedData } = await supabase.storage
          .from("profile-photos")
          .createSignedUrl(photoPath, 3600);
        bodyPhotoSignedUrl = signedData?.signedUrl ?? null;
      }
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

    if (!locationCity || stylePreferences.length === 0) {
      redirect("/profile?error=Please%20select%20at%20least%20one%20style%20and%20enter%20a%20city.");
    }

    const locationLat = locationLatRaw ? Number(locationLatRaw) : null;
    const locationLng = locationLngRaw ? Number(locationLngRaw) : null;

    if (
      (locationLatRaw && Number.isNaN(locationLat)) ||
      (locationLngRaw && Number.isNaN(locationLng))
    ) {
      redirect("/profile?error=Latitude%20and%20longitude%20must%20be%20valid%20numbers.");
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

  async function uploadBodyPhotoAndAnalyze(formData: FormData) {
    "use server";

    const photo = formData.get("body_photo");
    if (!(photo instanceof File) || photo.size === 0) {
      redirect("/profile?error=Please%20select%20a%20body%20photo%20to%20analyze.");
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

      const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${user.id}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(storagePath, photo, {
          contentType: photo.type || "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        redirect("/profile?error=Unable%20to%20upload%20body%20photo.");
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from("profile-photos")
        .createSignedUrl(storagePath, 900);

      if (signedError || !signedData?.signedUrl) {
        redirect("/profile?error=Unable%20to%20prepare%20body%20photo%20analysis.");
      }

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          body_photo_url: `profile-photos/${storagePath}`,
        })
        .eq("id", user.id);

      if (profileUpdateError) {
        redirect("/profile?error=Unable%20to%20save%20body%20photo.");
      }

      const origin = headers().get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;
      if (!origin) {
        redirect("/profile?error=Unable%20to%20run%20body%20analysis.%20Missing%20app%20URL.");
      }

      const analysisResponse = await fetch(`${origin}/api/profile/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: headers().get("cookie") ?? "",
        },
        body: JSON.stringify({ bodyPhotoUrl: signedData.signedUrl }),
      });

      if (!analysisResponse.ok) {
        const responseBody = (await analysisResponse.json()) as { error?: string };
        const message = responseBody.error ?? "Unable to analyze body photo.";
        redirect(`/profile?error=${encodeURIComponent(message)}`);
      }
    } catch {
      redirect("/profile?error=Unable%20to%20analyze%20body%20photo.");
    }

    redirect("/profile?analysis_success=1");
  }

  const selectedStyles = profile?.style_preferences ?? [];
  const error = searchParams?.error;
  const success = searchParams?.success === "1";
  const analysisSuccess = searchParams?.analysis_success === "1";

  return (
    <main className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Profile</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Manage your preferences, location, and body-fit profile.
      </p>

      {profile?.onboarding_complete ? (
        <p className="mt-4 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success">
          Onboarding is complete. You can update your preferences anytime.
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success">
          Onboarding details saved successfully.
        </p>
      ) : null}
      {analysisSuccess ? (
        <p className="mt-4 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success">
          Body photo uploaded and analyzed successfully.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-text-primary">Body fit analysis</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Upload a full-body photo to receive styling guidance tailored to your proportions.
        </p>

        {bodyPhotoSignedUrl ? (
          <div className="relative mt-4 h-64 w-full overflow-hidden rounded-xl border border-border">
            <Image
              src={bodyPhotoSignedUrl}
              alt="Body photo"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : null}

        <form action={uploadBodyPhotoAndAnalyze} className="mt-4 space-y-4">
          <input
            name="body_photo"
            type="file"
            accept="image/*"
            required
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary"
          />
          <Button variant="primary" size="md" loading={false}>
            Upload and analyze
          </Button>
        </form>

        <div className="mt-5 space-y-2">
          <p className="text-sm font-medium text-text-primary">
            Body type: {profile?.body_type ? profile.body_type : "Not analyzed yet"}
          </p>
          {profile?.body_fit_notes && profile.body_fit_notes.length > 0 ? (
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-sm text-text-secondary">
                Based on your proportions, here are practical styling tips:
              </p>
              <ul className="mt-2 space-y-1">
                {profile.body_fit_notes.map((note, index) => (
                  <li key={`${index}-${note}`} className="text-sm text-text-primary">
                    - {note}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">
              Your personalized fit notes will appear here after analysis.
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
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
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
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
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
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
            />
          </div>
        </div>

        <Button variant="primary" size="md" loading={false}>
          Save onboarding
        </Button>
      </form>
    </main>
  );
}
