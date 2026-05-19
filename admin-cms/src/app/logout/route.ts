import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protoHeader = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const isLocalHost = !!forwardedHost && (forwardedHost.includes("localhost") || forwardedHost.startsWith("127.0.0.1"));
  const protocol = isLocalHost ? (protoHeader || "http") : "https";
  const origin = forwardedHost ? `${protocol}://${forwardedHost}` : new URL(request.url).origin;
  const loginUrl = new URL("/", origin);
  const response = NextResponse.redirect(loginUrl);
  
  // Clear the cookie, ensuring domain matches the login action
  response.cookies.set("token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: false,
    sameSite: "lax",
    domain: isLocalHost ? undefined : ".asiaze.cloud",
    secure: process.env.NODE_ENV === "production",
  });
  
  // Also use next/headers to delete as a fallback
  const cookieStore = await cookies();
  cookieStore.delete({
    name: 'token',
    path: '/',
    domain: isLocalHost ? undefined : '.asiaze.cloud',
  });

  return response;
}
