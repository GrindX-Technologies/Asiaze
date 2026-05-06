"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RewardsManagementPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [pointsForSharing, setPointsForSharing] = useState("15");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(false);

  // Add Coupon Form
  const [couponCode, setCouponCode] = useState("");
  const [appLink, setAppLink] = useState("");
  const [requiredPoints, setRequiredPoints] = useState("");
  const [error, setError] = useState<string | null>(null);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return "";
  };

  const fetchData = async () => {
    try {
      const token = getCookie("token");
      
      const [couponsRes, settingsRes] = await Promise.all([
        fetch("/api/coupons", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/settings", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setCoupons(couponsData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        const shareSetting = settingsData.find((s: any) => s.key === "points_for_sharing");
        if (shareSetting) {
          setPointsForSharing(shareSetting.value.toString());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
  }, []);

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const token = getCookie("token");
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          key: "points_for_sharing",
          value: Number(pointsForSharing),
          group: "points",
          description: "Points awarded to user when they share an article or reel"
        })
      });
      if (res.ok) {
        alert("Reward settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddCoupon = async () => {
    setError(null);
    if (!couponCode || !appLink || !requiredPoints) {
      setError("All fields are required.");
      return;
    }
    
    try {
      const token = getCookie("token");
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          code: couponCode,
          appLink,
          requiredPoints: Number(requiredPoints),
          isActive: true
        })
      });

      if (res.ok) {
        setIsAddCouponModalOpen(false);
        setCouponCode("");
        setAppLink("");
        setRequiredPoints("");
        fetchData();
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to add coupon.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const token = getCookie("token");
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-black tracking-tight">Rewards Management</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 h-fit">
          <h3 className="text-xl font-bold text-black border-b border-gray-100 pb-3">Reward Settings</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-black font-bold text-sm">Points for Sharing</label>
              <Input 
                type="number" 
                value={pointsForSharing}
                onChange={(e) => setPointsForSharing(e.target.value)}
                className="bg-white border-gray-200" 
              />
            </div>
          </div>

          <Button 
            onClick={saveSettings} 
            disabled={isSavingSettings}
            className="w-full bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold"
          >
            {isSavingSettings ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        {/* Coupons Table */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-xl font-bold text-black">Active Coupons</h3>
            <Button 
              onClick={() => setIsAddCouponModalOpen(true)}
              className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-4 h-9"
            >
              + Add Coupon
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F9FAFB]">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="font-bold text-black py-3">Coupon Code</TableHead>
                  <TableHead className="font-bold text-black">App Link</TableHead>
                  <TableHead className="font-bold text-black">Required Points</TableHead>
                  <TableHead className="font-bold text-black">Status</TableHead>
                  <TableHead className="font-bold text-black text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">No coupons found. Add one to get started.</TableCell>
                  </TableRow>
                ) : (
                  coupons.map((coupon) => (
                    <TableRow key={coupon._id} className="border-b border-gray-50">
                      <TableCell className="font-bold text-[#E0202B]">{coupon.code}</TableCell>
                      <TableCell className="text-gray-600 max-w-[150px] truncate">
                        <a href={coupon.appLink} target="_blank" rel="noreferrer" className="hover:underline text-blue-600">
                          {coupon.appLink}
                        </a>
                      </TableCell>
                      <TableCell className="font-bold text-gray-900">{coupon.requiredPoints}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`text-white border-none rounded-full px-3 py-0.5 font-medium ${
                            coupon.isActive ? 'bg-[#22C55E]' : 'bg-gray-500'
                          }`}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Trash2 
                          className="w-4 h-4 cursor-pointer hover:text-red-600 text-gray-500 inline-block transition-colors" 
                          onClick={() => handleDeleteCoupon(coupon._id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add Coupon Modal */}
      <Dialog open={isAddCouponModalOpen} onOpenChange={setIsAddCouponModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-xl shadow-lg border-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-black">Add New Coupon</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-[#E0202B] rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-black font-bold text-sm">Coupon Code</label>
              <Input 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)} 
                className="bg-white border-gray-200" 
                placeholder="e.g. GET10OFF" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-black font-bold text-sm">App Link (Promotion URL)</label>
              <Input 
                value={appLink} 
                onChange={(e) => setAppLink(e.target.value)} 
                className="bg-white border-gray-200" 
                placeholder="https://..." 
              />
            </div>
            <div className="space-y-2">
              <label className="text-black font-bold text-sm">Required Points to Redeem</label>
              <Input 
                type="number"
                value={requiredPoints} 
                onChange={(e) => setRequiredPoints(e.target.value)} 
                className="bg-white border-gray-200" 
                placeholder="e.g. 500" 
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleAddCoupon} className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6">
                Add Coupon
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
