"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { loginAction } from "./actions";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

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
        <form action={formAction} className="w-full space-y-6">
          <div className="space-y-4">
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 text-center">
                {state.error}
              </div>
            )}
            
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
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  className="w-full h-12 text-center px-10 text-black border-[#D9D9D9] placeholder:text-gray-400 focus-visible:ring-[#E0202B]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 pl-2">
              <Checkbox id="remember" name="remember" value="true" className="border-gray-300 data-[state=checked]:bg-[#E0202B] data-[state=checked]:border-[#E0202B]" />
              <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#4B4B4B]">
                Remember me
              </Label>
            </div>
            <Link 
              href="/forgot-password" 
              className="text-[#E0202B] text-sm font-semibold hover:underline pr-2"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="pt-4 flex justify-center">
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full w-48 h-12 text-base font-bold disabled:opacity-50"
            >
              {isPending ? "Logging in..." : "Login"}
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
