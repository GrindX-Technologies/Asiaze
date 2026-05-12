"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, Pencil, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RewardsManagementPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [pointsForSharing, setPointsForSharing] = useState("15");
  const [pointsPerReferral, setPointsPerReferral] = useState("10");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(false);

  // Add Coupon Form
  const [couponCode, setCouponCode] = useState("");
  const [couponTitle, setCouponTitle] = useState("");
  const [appLink, setAppLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [requiredPoints, setRequiredPoints] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/coupons`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings`, { headers: { Authorization: `Bearer ${token}` } })
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
        const referralSetting = settingsData.find((s: any) => s.key === "pointsPerReferral");
        if (referralSetting) {
          setPointsPerReferral(referralSetting.value.toString());
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
      
      const res1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings`, {
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

      const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          key: "pointsPerReferral",
          value: Number(pointsPerReferral),
          group: "points",
          description: "Points awarded to a user when their referral code is used"
        })
      });

      if (res1.ok && res2.ok) {
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

  const openAddModal = () => {
    setEditingCouponId(null);
    setCouponCode("");
    setCouponTitle("");
    setAppLink("");
    setImageUrl("");
    setImageFile(null);
    setImagePreview("");
    setRequiredPoints("");
    setIsActive(true);
    setError(null);
    setIsAddCouponModalOpen(true);
  };

  const openEditModal = (coupon: any) => {
    setEditingCouponId(coupon._id);
    setCouponCode(coupon.code);
    setCouponTitle(coupon.title);
    setAppLink(coupon.appLink);
    setImageUrl(coupon.imageUrl || "");
    setImageFile(null);
    setImagePreview("");
    setRequiredPoints(coupon.requiredPoints.toString());
    setIsActive(coupon.isActive);
    setError(null);
    setIsAddCouponModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload`);
      
      const token = getCookie("token");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data.url);
          } catch (e) {
            reject(new Error("Invalid JSON response"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  };

  const handleAddCoupon = async () => {
    setError(null);
    if (!couponCode || !couponTitle || !appLink || !requiredPoints) {
      setError("All fields except image are required.");
      return;
    }
    
    setIsUploading(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadFile(imageFile);
      }

      const token = getCookie("token");
      
      const url = editingCouponId 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/coupons/${editingCouponId}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/coupons`;
        
      const method = editingCouponId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          code: couponCode,
          title: couponTitle,
          appLink,
          imageUrl: finalImageUrl,
          requiredPoints: Number(requiredPoints),
          isActive
        })
      });

      if (res.ok) {
        setIsAddCouponModalOpen(false);
        fetchData();
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to save coupon.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsUploading(false);
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
            <div className="space-y-2">
              <label className="text-black font-bold text-sm">Points per Referral</label>
              <Input 
                type="number" 
                value={pointsPerReferral}
                onChange={(e) => setPointsPerReferral(e.target.value)}
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
            <h3 className="text-xl font-bold text-black">Coupons Management</h3>
            <Button 
              onClick={openAddModal}
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
                            coupon.isActive ? 'bg-[#22C55E]' : 'bg-[#9CA3AF]'
                          }`}
                        >
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Pencil 
                            className="w-4 h-4 cursor-pointer hover:text-blue-600 text-gray-500 transition-colors" 
                            onClick={() => openEditModal(coupon)}
                          />
                          <Trash2 
                            className="w-4 h-4 cursor-pointer hover:text-red-600 text-gray-500 transition-colors" 
                            onClick={() => handleDeleteCoupon(coupon._id)}
                          />
                        </div>
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
            <DialogTitle className="text-xl font-bold text-black">{editingCouponId ? "Edit Coupon" : "Add New Coupon"}</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-[#E0202B] rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
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
              <label className="text-black font-bold text-sm">Title</label>
              <Input 
                value={couponTitle} 
                onChange={(e) => setCouponTitle(e.target.value)} 
                className="bg-white border-gray-200" 
                placeholder="e.g. ₹100 Amazon Gift Card" 
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
              <label className="text-black font-bold text-sm">Image Upload (1:1 Ratio Recommended)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden"
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                ) : imageUrl ? (
                  <img src={imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${imageUrl}`} alt="Current" className="w-full h-full object-cover absolute inset-0" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-black font-bold text-sm cursor-pointer" htmlFor="active-status">Active Status</label>
              <Switch 
                id="active-status" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
                className="data-[state=checked]:bg-[#22C55E]"
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
            
            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={() => setIsAddCouponModalOpen(false)} variant="outline" className="rounded-full px-6 border-0 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold">
                Cancel
              </Button>
              <Button onClick={handleAddCoupon} disabled={isUploading} className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6">
                {isUploading ? "Saving..." : editingCouponId ? "Update Coupon" : "Add Coupon"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
