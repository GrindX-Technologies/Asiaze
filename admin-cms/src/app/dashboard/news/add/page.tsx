"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function AddNewsPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [source, setSource] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState("en");
  const [states, setStates] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsList, setTagsList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return "";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getCookie("token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        const [catsRes, tagsRes] = await Promise.all([
          fetch(`${apiUrl}/api/categories`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/tags`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ ok: false, json: () => [] }))
        ]);
        
        if (catsRes.ok) {
          const data = await catsRes.json();
          setCategories(data.filter((c: any) => c.status === 'active' || c.status === 'Active'));
        }
        
        if ('ok' in tagsRes && (tagsRes as any).ok) {
          setTagsList(await (tagsRes as any).json());
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert("Invalid file format. Please upload a supported image format: JPEG, JPG, PNG, or GIF. WebP, AVIF and other formats are not supported by the mobile app.");
        if (imageInputRef.current) {
          imageInputRef.current.value = '';
        }
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

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

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || "Image upload failed");
    }
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent, status: "published" | "draft") => {
    e.preventDefault();
    if (!title || !categoryId) {
      alert("Title and Category are required");
      return;
    }

    setIsSubmitting(true);
    try {
      let coverImage = "";
      if (imageFile) {
        coverImage = await uploadFile(imageFile);
      }

      const token = getCookie("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // Process new tags from input
      let finalTags = [...selectedTags];
      if (tagsInput.trim()) {
        const newTagNames = tagsInput.split(',').map(t => t.trim()).filter(t => t);
        for (const tagName of newTagNames) {
          const existing = tagsList.find(t => t.name.toLowerCase() === tagName.toLowerCase());
          if (existing) {
            if (!finalTags.includes(existing._id)) {
              finalTags.push(existing._id);
            }
          } else {
            // Create new tag
            const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const tagRes = await fetch(`${apiUrl}/api/tags`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ name: tagName, slug, status: 'active' })
            });
            if (tagRes.ok) {
              const newTag = await tagRes.json();
              finalTags.push(newTag._id);
            }
          }
        }
      }

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

      const payload = {
        title,
        slug,
        summary,
        content,
        sourceUrl,
        source,
        language,
        states,
        category: categoryId,
        coverImage,
        status,
        tags: finalTags
      };

      const res = await fetch(`${apiUrl}/api/news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        router.push("/");
        return;
      }

      if (res.ok) {
        router.push("/dashboard/news");
      } else {
        const errorData = await res.json().catch(() => null);
        console.error("Backend Error Data:", errorData);
        alert(`Failed to create news: ${errorData?.message || errorData?.error || res.statusText || 'Unknown backend error'}`);
      }
    } catch (err: any) {
      console.error("Submission Error:", err);
      alert(`An error occurred during submission: ${err.message || 'Network/Processing Error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black tracking-tight">Manage News</h2>
      
      <form className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-black font-bold">Headline *</Label>
              <Input 
                placeholder="Enter headline (max 250 chars)" 
                className="bg-white border-gray-200 text-black"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={250}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Summary (60 words max)</Label>
              <Textarea 
                placeholder="Enter summary (max ~60 words)" 
                className="bg-white border-gray-200 resize-none h-32"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
              <div className="text-right text-xs text-gray-500">{summary.split(/\s+/).filter(w => w.length > 0).length}/60 words</div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Full Article Content</Label>
              <Textarea 
                placeholder="Write the entire full article here..." 
                className="bg-white border-gray-200 resize-y min-h-[400px] text-base leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black font-bold">Full Article Link (Optional)</Label>
              <Input 
                placeholder="Enter full article link (e.g. https://...)" 
                className="bg-white border-gray-200"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-black font-bold">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (EN)</SelectItem>
                  <SelectItem value="hin">Hindi (HIN)</SelectItem>
                  <SelectItem value="ben">Bengali (BEN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Tags</Label>
              {tagsList.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tagsList.map(tag => {
                    const isSelected = selectedTags.includes(tag._id);
                    return (
                      <Badge 
                        key={tag._id}
                        onClick={() => {
                          if (isSelected) setSelectedTags(prev => prev.filter(id => id !== tag._id));
                          else setSelectedTags(prev => [...prev, tag._id]);
                        }}
                        className={`cursor-pointer rounded-full px-3 py-1 font-normal ${isSelected ? 'bg-[#E0202B] hover:bg-[#E0202B]/90 text-white border-none' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
                      >
                        {tag.name}
                      </Badge>
                    );
                  })}
                </div>
              )}
              <Input 
                placeholder="Type new tags separated by comma" 
                className="bg-white border-gray-200"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black font-bold">Target States (Optional)</Label>
              <div className="h-40 overflow-y-auto border border-gray-200 rounded-md p-3 bg-white space-y-2">
                {INDIAN_STATES.map((state) => (
                  <label key={state} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#DC143C] focus:ring-[#DC143C]"
                      checked={states.includes(state)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStates([...states, state]);
                        } else {
                          setStates(states.filter(s => s !== state));
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700">{state}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500">Select states for local news distribution.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-black font-bold">Upload Banner Image</Label>
              <div 
                onClick={() => imageInputRef.current?.click()}
                className="w-full h-64 bg-gray-50 rounded-lg overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors relative"
              >
                <input 
                  type="file" 
                  accept="image/jpeg, image/jpg, image/png, image/gif" 
                  className="hidden" 
                  ref={imageInputRef}
                  onChange={handleImageChange}
                />
                {imagePreview ? (
                  <Image src={imagePreview} alt="Banner preview" fill className="object-cover" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <span className="text-gray-500 font-medium text-center">Click to Upload/Replace Image</span>
                    <span className="text-gray-400 text-xs mt-2 text-center">Supported: JPEG, JPG, PNG, GIF<br/>(AVIF/WebP not supported)</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Recommended dimensions: 1200x630px</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Source Name</Label>
              <Input 
                placeholder="Enter source name (e.g. CNN, BBC)" 
                className="bg-white border-gray-200"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="mt-12 flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
          <Link href="/dashboard/news">
            <Button type="button" variant="ghost" className="text-gray-600 hover:text-black font-medium">
              Cancel
            </Button>
          </Link>
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
            type="button" 
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "published")}
            className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full px-8 font-bold"
          >
            {isSubmitting ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </form>
    </div>
  );
}