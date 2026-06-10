import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
) {
  const { formId } = await params;
  const body = await request.json();
  const { data, honeypot, token } = body;

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { site: true },
  });

  if (!form) {
    return NextResponse.json(
      { error: { message: "Form not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }

  if (honeypot && typeof honeypot === "string" && honeypot.length > 0) {
    return NextResponse.json({ success: true, id: null });
  }

  const settings = form.site.settings as Record<string, unknown> | null;
  const recaptchaSecret = settings?.recaptcha_secret_key as string | undefined;

  if (recaptchaSecret && token) {
    const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
    const verifyRes = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: recaptchaSecret, response: token }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return NextResponse.json(
        { error: { message: "reCAPTCHA verification failed", code: "RECAPTCHA_FAILED" } },
        { status: 400 },
      );
    }
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";

  if (ip) {
    const lastSubmission = await prisma.formSubmission.findFirst({
      where: { formId, ip },
      orderBy: { createdAt: "desc" },
    });

    if (lastSubmission) {
      const sixtySeconds = 60 * 1000;
      const elapsed = Date.now() - new Date(lastSubmission.createdAt).getTime();
      if (elapsed < sixtySeconds) {
        return NextResponse.json(
          { error: { message: "Too many submissions. Please wait.", code: "RATE_LIMITED" } },
          { status: 429 },
        );
      }
    }
  }

  const submission = await prisma.formSubmission.create({
    data: {
      formId,
      data: data ?? {},
      ip: ip || null,
      userAgent: request.headers.get("user-agent") || null,
    },
  });

  return NextResponse.json({ success: true, id: submission.id }, { status: 201 });
}
