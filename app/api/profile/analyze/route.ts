import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Body photo analysis has been removed. Please save your body proportions manually in your profile.",
    },
    { status: 410 }
  );
}
