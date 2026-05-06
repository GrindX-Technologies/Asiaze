import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";
    
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.token) {
        const cookieStore = await cookies();
        cookieStore.set("token", data.token, { 
          path: "/", 
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax"
        });
        redirect("/dashboard");
      } else {
        console.error("Login failed:", data.message);
        // You could handle UI error here by returning state
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between p-4">
      {/* Top spacer */}
      <div className="flex-1"></div>

      {/* Main Content */}
      <div className="w-full max-w-md flex flex-col items-center space-y-12">
        {/* Brand/Logo */}
        <div className="flex justify-center w-full">
          <Image 
            src="/logo.svg" 
            alt="asiaze logo" 
            width={120} 
            height={120} 
            className="rounded-xl shadow-sm"
            priority
          />
        </div>

        {/* Login Form */}
        <form action={handleLogin} className="w-full space-y-6">
          <div className="space-y-4">
            <div className="space-y-2 text-center">
              <Label htmlFor="email" className="text-[#2B2B2B] text-base font-semibold">
                Username
              </Label>
              <Input 
                id="email" 
                name="email" 
                type="text" 
                placeholder="Enter your username" 
                className="w-full h-12 text-center text-black border-[#D9D9D9] placeholder:text-gray-400 focus-visible:ring-[#E0202B]"
                required
              />
            </div>

            <div className="space-y-2 text-center">
              <Label htmlFor="password" className="text-[#2B2B2B] text-base font-semibold">
                Password
              </Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Enter your password" 
                className="w-full h-12 text-center text-black border-[#D9D9D9] placeholder:text-gray-400 focus-visible:ring-[#E0202B]"
                required
              />
            </div>
          </div>

          <div className="text-center pt-2">
            <Link 
              href="#" 
              className="text-[#E0202B] text-sm font-semibold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="pt-4 flex justify-center">
            <Button 
              type="submit" 
              className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full w-48 h-12 text-base font-bold"
            >
              Login
            </Button>
          </div>
        </form>
      </div>

      {/* Bottom spacer */}
      <div className="flex-1"></div>

      {/* Footer Links */}
      <div className="w-full py-6 flex justify-center space-x-8 text-sm text-[#4B4B4B] bg-[#F8F8F8] mt-8 absolute bottom-0 left-0">
        <Link href="#" className="hover:text-black transition-colors">Terms of Service</Link>
        <Link href="#" className="hover:text-black transition-colors">Privacy Policy</Link>
        <Link href="#" className="hover:text-black transition-colors">Contact Us</Link>
      </div>
    </div>
  );
}