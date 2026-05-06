"use client";

import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Topbar({ token }: { token?: string }) {
  const [adminName, setAdminName] = useState("Admin Name");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let currentToken = token;
        if (!currentToken) {
          const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return "";
          };
          currentToken = getCookie("token");
        }
        
        if (!currentToken) return;

        const res = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.name) {
            setAdminName(data.name);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="flex h-16 items-center px-8 border-b bg-[#F8F8F8] border-gray-200">
      <div className="flex-1">
        <div className="w-full max-w-sm">
          <Input 
            type="search" 
            placeholder="Search..." 
            className="bg-white border-gray-200"
          />
        </div>
      </div>
      <div className="flex items-center space-x-6 text-sm font-medium text-gray-900">
        <span>{adminName}</span>
        <Link href="/dashboard/profile" className="hover:underline">Profile</Link>
      </div>
    </div>
  );
}