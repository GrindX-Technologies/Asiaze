"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfileClient({ token }: { token: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const getClientToken = () => {
    if (typeof document === "undefined") return token;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || token;
    return token;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentToken = getClientToken();
        if (!currentToken) return;

        const res = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setEmail(data.email || "");
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (password && password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      const currentToken = getClientToken();
      const payload: any = { name, email };
      if (password) {
        payload.password = password;
      }

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          document.cookie = `token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
        }
        setMessage({ text: "Profile updated successfully. Refresh to see changes in header.", type: "success" });
        setPassword("");
        setConfirmPassword("");
      } else {
        const errData = await res.json();
        setMessage({ text: errData.message || "Failed to update profile.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "An error occurred while updating profile.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-black tracking-tight">Admin Profile</h2>
      
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl space-y-6">
        
        {message.text && (
          <div className={`p-3 rounded-lg text-sm font-medium border ${
            message.type === "error" ? "bg-red-50 text-[#E0202B] border-red-100" : "bg-green-50 text-green-700 border-green-100"
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-black font-bold">Name</Label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border-gray-200" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-black font-bold">Email</Label>
            <Input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-gray-200" 
              required
            />
          </div>

          <h3 className="text-lg font-bold text-black border-b border-gray-100 pb-2 pt-4">Change Password</h3>
          <p className="text-sm text-gray-500">Leave blank if you don't want to change your password.</p>

          <div className="space-y-2">
            <Label className="text-black font-bold">New Password</Label>
            <Input 
              type="password" 
              placeholder="Enter new password" 
              className="bg-white border-gray-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold">Confirm New Password</Label>
            <Input 
              type="password" 
              placeholder="Confirm new password" 
              className="bg-white border-gray-200"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-8"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
