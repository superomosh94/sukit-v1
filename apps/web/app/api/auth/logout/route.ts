import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: true });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("next-auth.session-token", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("__Secure-next-auth.session-token", "", {
    maxAge: 0,
    path: "/",
  });
  return response;
}
