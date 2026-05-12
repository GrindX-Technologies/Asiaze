"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";

export default function EditReelPage() {
  const router = useRouter();
  const params = useParams();
  const reelId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [articleLink, setArticleLink] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState("");

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return "";
  };

  useEffect(() => {
    const fetchReel = async () => {
      try {
        const token = getCookie("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/reels/${reelId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || "");
          setDescription(data.description || "");
          setArticleLink(data.articleLink || "");
          setStatus(data.status || "active");
          setCurrentVideoUrl(data.videoUrl || "");
          setCurrentThumbnailUrl(data.thumbnailUrl || "");
        } else {
          alert("Failed to fetch reel details");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (reelId) fetchReel();
  }, [reelId]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
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

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

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

  const handleSubmit = async (e: React.FormEvent, submitStatus?: "active" | "inactive") => {
    e.preventDefault();
    if (!title) {
      alert("Title is required");
      return;
    }

    setIsSubmitting(true);
    const finalStatus = submitStatus || status;

    try {
      let finalVideoUrl = currentVideoUrl;
      let finalThumbnailUrl = currentThumbnailUrl;

      if (videoFile || thumbnailFile) {
        setIsUploading(true);
        setUploadProgress(0);
      }

      if (videoFile) finalVideoUrl = await uploadFile(videoFile);
      if (thumbnailFile) finalThumbnailUrl = await uploadFile(thumbnailFile);
      
      setIsUploading(false);

      const token = getCookie("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/reels/${reelId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          articleLink,
          videoUrl: finalVideoUrl,
          thumbnailUrl: finalThumbnailUrl,
          status: finalStatus
        })
      });

      if (res.ok) {
        router.push("/dashboard/reels");
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert("Failed to update reel: " + (errorData.message || ""));
      }
    } catch (err: any) {
      console.error(err);
      alert(`An error occurred: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-[1200px]">
      <form onSubmit={(e) => handleSubmit(e)} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        
        {/* Left Column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Reel Title/Headline</Label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title" 
              className="bg-white border-gray-200 h-12 text-gray-900"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Summary/Caption</Label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter summary" 
              className="bg-white border-gray-200 min-h-[160px] resize-none text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Full Article Link (Optional)</Label>
            <Input 
              value={articleLink}
              onChange={(e) => setArticleLink(e.target.value)}
              placeholder="https://example.com/article" 
              className="bg-white border-gray-200 h-12 text-gray-900"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-black font-bold text-base">Current Video</Label>
            
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row gap-6">
                <div 
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors h-[400px] flex-1"
                >
                  <input 
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    ref={videoInputRef}
                    onChange={handleVideoChange}
                  />
                  <div className="px-8 text-center">
                    {videoFile ? (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-600 font-medium truncate max-w-[200px]">{videoFile.name}</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[#E0202B] mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">
                          Drag & drop video here or click to <br />
                          <span className="text-[#3b82f6] cursor-pointer hover:underline">replace</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="w-[225px] h-[400px] bg-black rounded-xl overflow-hidden relative flex shrink-0 items-center justify-center text-gray-400 shadow-md">
                  {videoPreview ? (
                    <video src={videoPreview} className="object-cover w-full h-full" controls playsInline />
                  ) : currentVideoUrl ? (
                    <video src={currentVideoUrl.startsWith('http') ? currentVideoUrl : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${currentVideoUrl}`} className="object-cover w-full h-full" controls playsInline />
                  ) : (
                    <span>No Video</span>
                  )}
                </div>
              </div>
              
              {isUploading && videoFile && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}%</p>
                </div>
              )}
              
              <p className="text-sm text-gray-500">Recommended dimensions: 1080x1920px (9:16 ratio)</p>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-black font-bold text-base">Current Thumbnail (Optional)</Label>
            
            <div 
              onClick={() => thumbnailInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center h-[400px] cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden relative w-[225px] shadow-md"
            >
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={thumbnailInputRef}
                onChange={handleThumbnailChange}
              />
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail preview" className="object-cover w-full h-full absolute inset-0" />
              ) : currentThumbnailUrl ? (
                <img src={currentThumbnailUrl.startsWith('http') ? currentThumbnailUrl : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${currentThumbnailUrl}`} alt="Current thumbnail" className="object-cover w-full h-full absolute inset-0" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-[#E0202B] mb-2" />
                  <p className="text-gray-500 font-medium text-xs text-center px-2">Click to replace thumbnail</p>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Recommended dimensions: 1080x1920px (9:16 ratio)</p>
          </div>
        </div>

      {/* Footer Actions */}
      <div className="col-span-1 lg:col-span-2 flex justify-end gap-4 mt-12 pt-8 border-t border-gray-100">
        <Button 
          type="button"
          onClick={() => router.back()} 
          variant="outline" 
          className="bg-gray-400/80 hover:bg-gray-400 text-white border-0 rounded-full font-bold px-8"
        >
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
          {isSubmitting ? "Updating..." : "Update"}
        </Button>
      </div>
      </form>
    </div>
  );
}
