import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const event = request.headers.get("x-github-event") ?? "unknown";

  const signature = request.headers.get("x-hub-signature-256");
  if (!signature) {
    return NextResponse.json(
      { error: { message: "Missing signature", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  // Webhook handling
  console.log(`GitHub webhook received: event=${event}`, {
    repository: body.repository?.full_name,
    ref: body.ref,
    commits: body.commits?.length ?? 0,
  });

  if (event === "push" && body.ref === "refs/heads/main") {
    // Trigger deploy
    console.log("Deploy triggered for", body.repository?.full_name);
  }

  return NextResponse.json({ received: true });
}
