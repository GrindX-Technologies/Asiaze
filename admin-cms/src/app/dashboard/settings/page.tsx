"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToken } from "@/components/TokenProvider";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const token = useToken();

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // Fetch profile
      const profileRes = await fetch(`${apiUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setName(profileData.name || "");
        setEmail(profileData.email || "");
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (password && password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload: any = { name, email };
      if (password) {
        payload.password = password;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/auth/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          document.cookie = `token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
        }
        setMessage({ text: "Profile updated successfully.", type: "success" });
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
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-black tracking-tight">Settings</h2>
      
      <div className="max-w-2xl">
        {/* Admin Profile */}
        <form onSubmit={handleProfileSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h3 className="text-xl font-bold text-black border-b border-gray-100 pb-4">Admin Profile</h3>
          
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
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="bg-white border-gray-200" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white border-gray-200" />
            </div>

            <div className="pt-2 border-t border-gray-100 mt-4">
              <p className="text-sm text-gray-500 mb-2">Leave blank if you don't want to change your password.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-black font-bold">New Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" className="bg-white border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-black font-bold">Confirm New Password</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="bg-white border-gray-200" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isSavingProfile} className="bg-black hover:bg-gray-800 text-white rounded-full font-bold px-8">
              {isSavingProfile ? "Saving..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
