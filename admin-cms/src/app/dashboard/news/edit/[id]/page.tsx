"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useState, useEffect, useRef } from "react";
import { useToken } from "@/components/TokenProvider";
import { Loader2 } from "lucide-react";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function EditNewsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const token = useToken();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [tagsList, setTagsList] = useState<any[]>([]);
  
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [source, setSource] = useState("");
  const [language, setLanguage] = useState("en");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [states, setStates] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  
  const [currentImage, setCurrentImage] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        const [newsRes, catsRes, tagsRes] = await Promise.all([
          fetch(`${apiUrl}/api/news`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/categories`, { headers: { Authorization: `Bearer ${token}` } }),
          // Assuming a tags endpoint exists or we can mock it
          fetch(`${apiUrl}/api/tags`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ ok: false, json: () => [] }))
        ]);

        if (newsRes.ok) {
          const data = await newsRes.json();
          const item = data.find((n: any) => n._id === id);
          if (item) {
            setTitle(item.title || "");
            setSummary(item.summary || "");
            setContent(item.content || "");
            setSourceUrl(item.sourceUrl || "");
            setSource(item.source || "");
            setLanguage(item.language || "en");
            setCategoryId(item.category?._id || item.category || "");
            setStatus(item.status || "draft");
            setStates(item.states || []);
            setCurrentImage(item.coverImage || "");
            setSelectedTags(item.tags?.map((t: any) => t._id || t) || []);
          } else {
            setFetchError("News article not found.");
          }
        } else {
          setFetchError("Failed to fetch news.");
        }

        if (catsRes.ok) {
          setCategories(await catsRes.json());
        }
        
        if ('ok' in tagsRes && (tagsRes as any).ok) {
           setTagsList(await (tagsRes as any).json());
        }

      } catch (err) {
        setFetchError("Network error while loading data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setSaveError("Headline is required.");
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      let finalImageUrl = currentImage;

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

      // If a new image was selected, upload it first
      if (newImage) {
        const formData = new FormData();
        formData.append("file", newImage);
        const uploadRes = await fetch(`${apiUrl}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalImageUrl = uploadData.url;
        } else {
          const err = await uploadRes.json().catch(() => ({ message: "Failed to upload image" }));
          setSaveError(err.message || "Failed to upload image");
          setIsSaving(false);
          return;
        }
      }

      const updatePayload = {
        title,
        summary,
        content,
        sourceUrl,
        source,
        language,
        category: categoryId,
        status,
        states,
        tags: finalTags,
        coverImage: finalImageUrl
      };

      const res = await fetch(`${apiUrl}/api/news/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      });

      if (res.ok) {
        router.push("/dashboard/news");
      } else {
        const err = await res.json();
        setSaveError(err.message || "Failed to update news.");
      }
    } catch (err) {
      setSaveError("Network error. Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#E0202B]" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
        {fetchError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black tracking-tight">Edit News</h2>
      
      {saveError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-black font-bold">Headline *</Label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter headline" 
                className="bg-white border-gray-200 text-black"
                maxLength={250}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Summary <span className="font-normal text-gray-400 text-sm">(60 words max)</span></Label>
              <Textarea 
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Enter summary text" 
                className="bg-white border-gray-200 resize-none h-32 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black font-bold">Full Article Content</Label>
              <Textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter full article content" 
                className="bg-white border-gray-200 resize-none h-48 text-black"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Full Article Link</Label>
              <Input 
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..." 
                className="bg-white border-gray-200 text-black"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-white border-gray-200 text-black">
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
                <SelectTrigger className="bg-white border-gray-200 text-black">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="hin">HIN</SelectItem>
                  <SelectItem value="ben">BEN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-black font-bold">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white border-gray-200 text-black">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
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
                      className="rounded border-gray-300 text-[#E0202B] focus:ring-[#E0202B]"
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
              <p className="text-xs text-gray-500">Edit states for local news distribution.</p>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-black font-bold">Current Image</Label>
              <div className="w-full max-w-sm h-48 bg-gray-200 rounded-lg overflow-hidden border border-gray-200 relative">
                {(newImage || currentImage) ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url('${newImage ? URL.createObjectURL(newImage) : (currentImage.startsWith('http') ? currentImage : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${currentImage}`)}')` 
                    }}
                  ></div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setNewImage(e.target.files[0]);
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                variant="secondary" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-full font-medium h-10 px-6"
              >
                {currentImage ? "Replace Image" : "Upload Image"}
              </Button>
            </div>
            
            <div className="space-y-2 pt-4">
              <Label className="text-black font-bold">Source</Label>
              <Input 
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. ASIAZE News Network" 
                className="bg-white border-gray-200 text-black"
              />
            </div>
            
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="mt-12 flex items-center justify-end gap-4 pt-6">
          <Link href="/dashboard/news">
            <Button variant="secondary" className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-full px-6 font-medium">
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isSaving}
            className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full px-8 font-bold disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}