import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

type ReportIssueBody = {
  name?: string;
  email?: string;
  category?: string;
  page_url?: string;
  message?: string;
  repro_steps?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  try {
    const rawBody = (await request.json()) as unknown;
    if (!isRecord(rawBody)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const body = rawBody as ReportIssueBody;
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const category = String(body.category ?? "").trim();
    const pageUrl = String(body.page_url ?? "").trim();
    const message = String(body.message ?? "").trim();
    const reproSteps = String(body.repro_steps ?? "").trim();

    if (!name || !email || !category || !message) {
      return NextResponse.json(
        { error: "name, email, category, and message are required." },
        { status: 400 }
      );
    }

    if (message.length < 15) {
      return NextResponse.json(
        { error: "Please include a bit more detail so we can reproduce the issue." },
        { status: 400 }
      );
    }

    const issueId = randomUUID();

    // For now we log reports server-side; this can later be routed to email, Slack, or a DB table.
    console.info("[report-issue]", {
      issueId,
      name,
      email,
      category,
      pageUrl,
      message,
      reproSteps,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, issue_id: issueId });
  } catch {
    return NextResponse.json({ error: "Unable to submit issue report." }, { status: 500 });
  }
}
