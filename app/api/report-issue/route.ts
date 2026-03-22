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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPageUrl(value: string): boolean {
  if (!value) return true;

  if (value.startsWith("/")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (!isValidPageUrl(pageUrl)) {
      return NextResponse.json({ error: "page_url must be a relative path or valid http(s) URL." }, { status: 400 });
    }

    if (message.length < 15) {
      return NextResponse.json(
        { error: "Please include a bit more detail so we can reproduce the issue." },
        { status: 400 }
      );
    }

    if (message.length > 5000 || reproSteps.length > 5000) {
      return NextResponse.json(
        { error: "message and repro_steps must be 5000 characters or fewer." },
        { status: 400 }
      );
    }

    const issueId = randomUUID();

    // Log only metadata to avoid exposing raw message/email content in logs.
    console.info("[report-issue]", {
      issueId,
      category,
      pageUrl,
      hasName: Boolean(name),
      hasEmail: Boolean(email),
      messageLength: message.length,
      reproStepsLength: reproSteps.length,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, issue_id: issueId });
  } catch {
    return NextResponse.json({ error: "Unable to submit issue report." }, { status: 500 });
  }
}
