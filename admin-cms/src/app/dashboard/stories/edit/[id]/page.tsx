"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

export default function EditStoryPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params?.id as string;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [pages, setPages] = useState([{ title: "", description: "", imageFile: null as File | null, imagePreview: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return "";
  };

  useEffect(() => {
    if (storyId) {
      const token = getCookie("token");
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/stories/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setTitle(data.title || "");
        setCategory(data.category || "General");
        if (data.pages && data.pages.length > 0) {
          setPages(data.pages.map((p: any) => ({
            title: p.title || "",
            description: p.description || "",
            imageFile: null,
            imagePreview: p.imageUrl ? `https://asiaze.cloud${p.imageUrl}` : ""
          })));
        }
      })
      .catch(err => console.error("Failed to load story", err));
    }
  }, [storyId]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = getCookie("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  };

  const handlePageChange = (index: number, field: string, value: string) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], [field]: value };
    setPages(newPages);
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newPages = [...pages];
      newPages[index].imageFile = file;
      newPages[index].imagePreview = URL.createObjectURL(file);
      setPages(newPages);
    }
  };

  const addPage = () => {
    setPages([...pages, { title: "", description: "", imageFile: null, imagePreview: "" }]);
  };

  const removePage = (index: number) => {
    if (pages.length === 1) return;
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
  };

  const handleSubmit = async (e: React.FormEvent, status: "published" | "draft" = "published") => {
    e.preventDefault();
    if (!title) {
      alert("Story Group Title is required");
      return;
    }
    
    if (!category) {
      alert("Category is required");
      return;
    }
    
    // Validate pages
    for (let i = 0; i < pages.length; i++) {
      if (!pages[i].imagePreview || !pages[i].title || !pages[i].description) {
        alert(`Page ${i + 1} is missing an image, title, or description.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Upload all new images
      const uploadedPages = await Promise.all(pages.map(async (page) => {
        let imageUrl = page.imagePreview.replace("https://asiaze.cloud", ""); // reuse existing relative URL
        if (page.imageFile) {
          imageUrl = await uploadFile(page.imageFile);
        }
        return {
          title: page.title,
          description: page.description,
          imageUrl
        };
      }));

      const token = getCookie("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/stories/${storyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          category,
          pages: uploadedPages,
          status
        })
      });

      if (res.status === 401) {
        router.push("/");
        return;
      }

      if (res.ok) {
        router.push("/dashboard/stories");
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
    <form onSubmit={(e) => handleSubmit(e, "published")} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-[1200px]">
      <div className="space-y-8">
        
        {/* Story Group Details */}
        <div className="space-y-6 pb-6 border-b border-gray-200">
          <h3 className="text-xl font-bold">Story Group Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-black font-bold text-base">Story Group Name</Label>
              <Input 
                placeholder="Internal name for this story group" 
                className="bg-white border-gray-200 h-12"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-black font-bold text-base">Category</Label>
              <Input 
                placeholder="e.g. Tech, Business" 
                className="bg-white border-gray-200 h-12"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Web Story Pages */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Web Story Pages</h3>
            <Button type="button" onClick={addPage} variant="outline" className="flex items-center gap-2">
              <Plus size={16} /> Add Page
            </Button>
          </div>

          <div className="space-y-8">
            {pages.map((page, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-xl relative bg-gray-50">
                {pages.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removePage(index)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                
                <h4 className="font-bold mb-4">Page {index + 1}</h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Page Image */}
                  <div className="space-y-2">
                    <Label className="text-black font-bold">Background Image (9:16)</Label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        onChange={(e) => handleImageChange(index, e)}
                        required={!page.imagePreview}
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white flex flex-col items-center justify-center h-[300px] hover:bg-gray-50 transition-colors overflow-hidden w-[168px]">
                        {page.imagePreview ? (
                          <Image src={page.imagePreview} alt={`Page ${index + 1}`} fill className="object-cover" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-gray-500 font-medium text-xs text-center px-2">Upload Image</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Page Text */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-black font-bold">Page Title / Headline</Label>
                      <Input 
                        placeholder="Page Headline" 
                        className="bg-white border-gray-200"
                        value={page.title}
                        onChange={(e) => handlePageChange(index, "title", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-black font-bold">Page Description</Label>
                      <Textarea 
                        placeholder="Write the description text for this page..." 
                        className="bg-white border-gray-200 min-h-[150px] resize-y"
                        value={page.description}
                        onChange={(e) => handlePageChange(index, "description", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
          onClick={(e) => handleSubmit(e, "draft")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-full px-6 font-medium"
        >
          {isSubmitting ? "Saving..." : "Save as Draft"}
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
          onClick={(e) => handleSubmit(e, "published")}
          className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full px-8 font-bold"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
