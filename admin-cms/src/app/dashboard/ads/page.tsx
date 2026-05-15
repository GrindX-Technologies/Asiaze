"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdsManagementPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Settings state
  const [feedFreq, setFeedFreq] = useState("5");
  const [storyFreq, setStoryFreq] = useState("3");
  const [reelFreq, setReelFreq] = useState("5");

  // New Ad state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adTitle, setAdTitle] = useState("");
  const [adType, setAdType] = useState("feed");
  const [adLink, setAdLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // View / Edit Ad state
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("feed");
  const [editLink, setEditLink] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  const fetchData = async () => {
    try {
      const token = getCookie("token");
      const [adsRes, settingsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ads`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (adsRes.ok) {
        const data = await adsRes.json();
        setAds(data);
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        const settingsMap: any = {};
        data.forEach((s: any) => { settingsMap[s.key] = s.value; });
        setSettings(settingsMap);
        if (settingsMap["ad_frequency_feed"]) setFeedFreq(settingsMap["ad_frequency_feed"].toString());
        if (settingsMap["ad_frequency_story"]) setStoryFreq(settingsMap["ad_frequency_story"].toString());
        if (settingsMap["ad_frequency_reel"]) setReelFreq(settingsMap["ad_frequency_reel"].toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const token = getCookie("token");
      const updates = [
        { key: "ad_frequency_feed", value: parseInt(feedFreq), group: "ads" },
        { key: "ad_frequency_story", value: parseInt(storyFreq), group: "ads" },
        { key: "ad_frequency_reel", value: parseInt(reelFreq), group: "ads" }
      ];

      for (const update of updates) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(update)
        });
      }
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
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

  const handleAddAd = async () => {
    if (!adTitle || !imageFile) {
      alert("Title and image are required");
      return;
    }
    
    let finalLinkUrl = adLink.trim();
    if (finalLinkUrl && !/^https?:\/\//i.test(finalLinkUrl)) {
      finalLinkUrl = `https://${finalLinkUrl}`;
    }

    setIsUploading(true);
    try {
      const mediaUrl = await uploadFile(imageFile);
      const token = getCookie("token");
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: adTitle,
          type: adType,
          mediaUrl,
          linkUrl: finalLinkUrl,
          isActive: true
        })
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setAdTitle("");
        setAdLink("");
        setImageFile(null);
        fetchData();
        alert("Advertisement created successfully!");
      } else {
        alert("Failed to create ad");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading ad");
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewClick = (ad: any) => {
    setSelectedAd(ad);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (ad: any) => {
    setSelectedAd(ad);
    setEditTitle(ad.title || "");
    setEditType(ad.type || "feed");
    setEditLink(ad.linkUrl || "");
    setEditImageFile(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateAd = async () => {
    if (!editTitle) {
      alert("Title is required");
      return;
    }
    
    let finalEditLinkUrl = editLink.trim();
    if (finalEditLinkUrl && !/^https?:\/\//i.test(finalEditLinkUrl)) {
      finalEditLinkUrl = `https://${finalEditLinkUrl}`;
    }

    setIsUpdating(true);
    try {
      let mediaUrl = selectedAd.mediaUrl;
      if (editImageFile) {
        mediaUrl = await uploadFile(editImageFile);
      }

      const token = getCookie("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ads/${selectedAd._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: editTitle,
          type: editType,
          mediaUrl,
          linkUrl: finalEditLinkUrl,
        })
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        fetchData();
        alert("Advertisement updated successfully!");
      } else {
        alert("Failed to update ad");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating ad");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleAdStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = getCookie("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    try {
      const token = getCookie("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getFullMediaUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${url}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black">Ads Management</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white">Add New Ad</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-black">Create Ad</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-bold text-black">Title</label>
                <Input value={adTitle} onChange={(e) => setAdTitle(e.target.value)} placeholder="e.g. Summer Sale Promo" />
              </div>
              <div>
                <label className="text-sm font-bold text-black">Ad Type / Placement</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-black mt-1"
                  value={adType} 
                  onChange={(e) => setAdType(e.target.value)}
                >
                  <option value="feed">Feed Ad (Recommended 16:9 or 1:1)</option>
                  <option value="story">Story Ad (Required 9:16)</option>
                  <option value="reel">Reel Ad (Required 9:16)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Please ensure your uploaded image matches the recommended ratio for this placement.</p>
              </div>
              <div>
                <label className="text-sm font-bold text-black">Link URL (Optional)</label>
                <Input value={adLink} onChange={(e) => setAdLink(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="text-sm font-bold text-black">Creative (Image/Video)</label>
                <Input type="file" accept="image/*,video/mp4" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </div>
              <Button 
                onClick={handleAddAd} 
                disabled={isUploading} 
                className="w-full bg-[#E0202B] hover:bg-[#C11B24] text-white"
              >
                {isUploading ? "Uploading..." : "Save Ad"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-black border-b pb-2">Frequency Settings</h3>
          <div>
            <label className="text-sm font-bold text-black">Feed Ad Frequency</label>
            <Input type="number" value={feedFreq} onChange={(e) => setFeedFreq(e.target.value)} className="mt-1" />
            <p className="text-xs text-gray-500 mt-1">Show an ad every N news items.</p>
          </div>
          <div>
            <label className="text-sm font-bold text-black">Story Ad Frequency</label>
            <Input type="number" value={storyFreq} onChange={(e) => setStoryFreq(e.target.value)} className="mt-1" />
            <p className="text-xs text-gray-500 mt-1">Show an ad every N stories.</p>
          </div>
          <div>
            <label className="text-sm font-bold text-black">Reel Ad Frequency</label>
            <Input type="number" value={reelFreq} onChange={(e) => setReelFreq(e.target.value)} className="mt-1" />
            <p className="text-xs text-gray-500 mt-1">Show an ad every N reels.</p>
          </div>
          <Button onClick={handleSaveSettings} className="w-full bg-black hover:bg-gray-800 text-white">
            Save Settings
          </Button>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-black">Active & Inactive Ads</h3>
          </div>
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-bold text-black">Preview</TableHead>
                <TableHead className="font-bold text-black">Title</TableHead>
                <TableHead className="font-bold text-black">Type</TableHead>
                <TableHead className="font-bold text-black">Status</TableHead>
                <TableHead className="text-right font-bold text-black">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : ads.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No ads found</TableCell></TableRow>
              ) : (
                ads.map((ad) => (
                  <TableRow key={ad._id}>
                    <TableCell>
                      {ad.mediaUrl?.match(/\.(mp4|mov|avi)$/i) ? (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">Video</div>
                      ) : (
                        <img 
                          src={getFullMediaUrl(ad.mediaUrl)} 
                          className="w-12 h-12 object-cover rounded" 
                          alt="" 
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-black">{ad.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{ad.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={ad.isActive ? "bg-green-500" : "bg-gray-400"}>
                        {ad.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                      <Button variant="outline" size="sm" onClick={() => handleViewClick(ad)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(ad)}>Edit</Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleAdStatus(ad._id, ad.isActive)}
                      >
                        {ad.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteAd(ad._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-black">View Advertisement</DialogTitle>
          </DialogHeader>
          {selectedAd && (
            <div className="space-y-4 mt-4">
              <div className="flex justify-center bg-gray-100 rounded-lg p-2">
                {selectedAd.mediaUrl?.match(/\.(mp4|mov|avi)$/i) ? (
                  <video src={getFullMediaUrl(selectedAd.mediaUrl)} controls className="max-h-64 rounded-md" />
                ) : (
                  <img src={getFullMediaUrl(selectedAd.mediaUrl)} alt={selectedAd.title} className="max-h-64 object-contain rounded-md" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-bold">Title</p>
                  <p className="text-sm">{selectedAd.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold">Type / Placement</p>
                  <Badge variant="outline" className="capitalize mt-1">{selectedAd.type}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold">Status</p>
                  <Badge className={selectedAd.isActive ? "bg-green-500 mt-1" : "bg-gray-400 mt-1"}>
                    {selectedAd.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold">Created At</p>
                  <p className="text-sm">{new Date(selectedAd.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-bold">Link URL</p>
                  <a href={selectedAd.linkUrl || "#"} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                    {selectedAd.linkUrl || "No link provided"}
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Edit Advertisement</DialogTitle>
          </DialogHeader>
          {selectedAd && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-bold text-black">Title</label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="e.g. Summer Sale Promo" />
              </div>
              <div>
                <label className="text-sm font-bold text-black">Ad Type / Placement</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-black mt-1"
                  value={editType} 
                  onChange={(e) => setEditType(e.target.value)}
                >
                  <option value="feed">Feed Ad</option>
                  <option value="story">Story Ad</option>
                  <option value="reel">Reel Ad</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-black">Link URL (Optional)</label>
                <Input value={editLink} onChange={(e) => setEditLink(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="text-sm font-bold text-black">Creative (Leave empty to keep current)</label>
                <Input type="file" accept="image/*,video/mp4" onChange={(e) => setEditImageFile(e.target.files?.[0] || null)} />
              </div>
              <Button 
                onClick={handleUpdateAd} 
                disabled={isUpdating} 
                className="w-full bg-[#E0202B] hover:bg-[#C11B24] text-white"
              >
                {isUpdating ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
