"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { forgotPasswordAction } from "../actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, { error: null, success: null });

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between p-4">
      <div className="flex-1"></div>

      <div className="w-full max-w-md flex flex-col items-center space-y-12">
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

        <div className="w-full space-y-6 text-center">
          <h1 className="text-2xl font-bold text-[#2B2B2B]">Reset Password</h1>
          <p className="text-sm text-gray-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form action={formAction} className="w-full space-y-6">
          <div className="space-y-4">
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 text-center">
                {state.error}
              </div>
            )}
            
            {state?.success && (
              <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg p-3 text-center">
                {state.success}
              </div>
            )}

            <div className="space-y-2 text-center">
              <Label htmlFor="email" className="text-[#2B2B2B] text-base font-semibold">
                Email Address
              </Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full h-12 text-center text-black border-[#D9D9D9] placeholder:text-gray-400 focus-visible:ring-[#E0202B]"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col space-y-4 items-center">
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full w-48 h-12 text-base font-bold disabled:opacity-50"
            >
              {isPending ? "Sending..." : "Send Reset Link"}
            </Button>
            
            <Link 
              href="/" 
              className="text-[#4B4B4B] text-sm font-semibold hover:text-black transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>

      <div className="flex-1"></div>

      <div className="w-full py-6 flex justify-center space-x-8 text-sm text-[#4B4B4B] bg-[#F8F8F8] mt-8 absolute bottom-0 left-0">
        <Link href="#" className="hover:text-black transition-colors">Terms of Service</Link>
        <Link href="#" className="hover:text-black transition-colors">Privacy Policy</Link>
        <Link href="#" className="hover:text-black transition-colors">Contact Us</Link>
      </div>
    </div>
  );
}