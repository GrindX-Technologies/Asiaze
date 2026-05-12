"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function loginAction(prevState: any, formData: FormData): Promise<{ error: string | null }> {
  const email = formData.get("email");
  const password = formData.get("password");
  const remember = formData.get("remember") === "true";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login` 
      : (process.env.NODE_ENV === "production" ? "http://127.0.0.1:5000/api/auth/login" : "http://localhost:5000/api/auth/login");
    
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    
    if (res.ok && data.token) {
      const cookieStore = await cookies();
      
      const cookieOptions: any = {
        path: "/", 
        httpOnly: false,
        sameSite: "lax",
        domain: ".asiaze.cloud",
      };

      // If "Remember Me" is checked, keep cookie for 30 days. Otherwise, default 24h to prevent random drops.
      if (remember) {
        cookieOptions.maxAge = 60 * 60 * 24 * 30; // 30 days
      } else {
        cookieOptions.maxAge = 60 * 60 * 24; // 24 hours
      }

      cookieStore.set("token", data.token, cookieOptions);
      // Do not redirect inside the try block where error is caught
    } else {
      return { error: data.message || "Invalid email or password" };
    }
  } catch (err: any) {
    console.error("Login error:", err);
    return { error: "Network error. Please make sure the backend is running." };
  }

  redirect("/dashboard");
}

export async function forgotPasswordAction(prevState: any, formData: FormData): Promise<{ error: string | null, success: string | null }> {
  const email = formData.get("email");

  if (!email) {
    return { error: "Email is required.", success: null };
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password` 
      : (process.env.NODE_ENV === "production" ? "http://127.0.0.1:5000/api/auth/forgot-password" : "http://localhost:5000/api/auth/forgot-password");
    
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    
    const data = await res.json();
    
    if (res.ok) {
      return { error: null, success: data.message || "Password reset link sent successfully." };
    } else {
      return { error: data.message || "Failed to send password reset link.", success: null };
    }
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return { error: "Network error. Please make sure the backend is running.", success: null };
  }
}
