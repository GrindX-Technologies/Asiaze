import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protoHeader = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const isLocalHost = !!forwardedHost && (forwardedHost.includes("localhost") || forwardedHost.startsWith("127.0.0.1"));
  const protocol = isLocalHost ? (protoHeader || "http") : "https";
  const origin = forwardedHost ? `${protocol}://${forwardedHost}` : new URL(request.url).origin;
  const loginUrl = new URL("/", origin);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set("token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
