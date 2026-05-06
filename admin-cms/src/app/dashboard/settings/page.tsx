"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-black tracking-tight">Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h3 className="text-xl font-bold text-black border-b border-gray-100 pb-4">General Settings</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-black font-bold">Site Name</Label>
              <Input defaultValue="ASIAZE" className="bg-white border-gray-200" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Admin Contact Email</Label>
              <Input defaultValue="admin@asiaze.cloud" className="bg-white border-gray-200" />
            </div>

            <div className="space-y-2">
              <Label className="text-black font-bold">Default Language</Label>
              <Input defaultValue="English" disabled className="bg-gray-50 border-gray-200 text-gray-500" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-8">
              Save Changes
            </Button>
          </div>
        </form>

        {/* Change Password */}
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h3 className="text-xl font-bold text-black border-b border-gray-100 pb-4">Security</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-black font-bold">Current Password</Label>
              <Input type="password" placeholder="••••••••" className="bg-white border-gray-200" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">New Password</Label>
              <Input type="password" placeholder="Enter new password" className="bg-white border-gray-200" />
            </div>

            <div className="space-y-2">
              <Label className="text-black font-bold">Confirm New Password</Label>
              <Input type="password" placeholder="Confirm new password" className="bg-white border-gray-200" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="bg-black hover:bg-gray-800 text-white rounded-full font-bold px-8">
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
