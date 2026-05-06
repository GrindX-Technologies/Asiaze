"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";
import Image from "next/image";

export default function AddStoryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return "";
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent, status: "active" | "inactive" = "active") => {
    e.preventDefault();
    if (!title || !videoFile) {
      alert("Title and Video are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const videoUrl = await uploadFile(videoFile);
      let thumbnailUrl = "";
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile);
      }

      const token = getCookie("token");
      const res = await fetch("/api/storys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          videoUrl,
          thumbnailUrl,
          status
        })
      });

      if (res.status === 401) {
        router.push("/");
        return;
      }

      if (res.ok) {
        router.push("/dashboard/storys");
      } else {
        const errorData = await res.json();
        alert("Failed to create story: " + errorData.message);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, "active")} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-[1200px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        
        {/* Left Column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Story Title/Headline</Label>
            <Input 
              placeholder="Enter title" 
              className="bg-white border-gray-200 h-12"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Summary/Caption</Label>
            <Textarea 
              placeholder="Enter summary" 
              className="bg-white border-gray-200 min-h-[160px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Upload Video</Label>
            <div 
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between overflow-hidden h-[180px] cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <input 
                type="file" 
                accept="video/*" 
                className="hidden" 
                ref={videoInputRef}
                onChange={handleVideoChange}
              />
              <div className="flex-1 px-8 text-center sm:text-left">
                {videoFile ? (
                  <p className="text-green-600 font-medium truncate max-w-[200px]">{videoFile.name}</p>
                ) : (
                  <p className="text-gray-500 font-medium">
                    Drag & drop video here or click to <br className="hidden sm:block" />
                    <span className="text-[#3b82f6] cursor-pointer hover:underline">browse</span>
                  </p>
                )}
              </div>
              <div className="w-[200px] h-full bg-gray-200 relative flex items-center justify-center text-gray-400">
                {videoPreview ? (
                  <video src={videoPreview} className="object-cover w-full h-full" muted />
                ) : (
                  <span>No Video</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Upload Thumbnail (Optional)</Label>
            <div 
              onClick={() => thumbnailInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center h-[200px] cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden relative w-[112px] mx-auto"
            >
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={thumbnailInputRef}
                onChange={handleThumbnailChange}
              />
              {thumbnailPreview ? (
                <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-[#E0202B] mb-2" />
                  <p className="text-gray-500 font-medium text-xs text-center px-2">Click to upload thumbnail</p>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1 text-center">Recommended dimensions: 1080x1920px (9:16 ratio)</p>
          </div>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-gray-100">
        <Button type="button" onClick={() => router.back()} variant="outline" className="bg-gray-400/80 hover:bg-gray-400 text-white border-0 rounded-full font-bold px-8">
          Cancel
        </Button>
        <Button 
          type="button"
          variant="secondary" 
          disabled={isSubmitting}
          onClick={(e) => handleSubmit(e, "inactive")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-full px-6 font-medium"
        >
          {isSubmitting ? "Saving..." : "Save as Draft"}
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
          onClick={(e) => handleSubmit(e, "active")}
          className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full px-8 font-bold"
        >
          {isSubmitting ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </form>
  );
}
