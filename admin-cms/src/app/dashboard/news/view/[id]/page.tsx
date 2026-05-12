"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bookmark, Share2, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToken } from "@/components/TokenProvider";

export default function ViewNewsPage() {
  const params = useParams();
  const id = params.id as string;
  const token = useToken();
  const [newsItem, setNewsItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchNewsDetail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        // To fetch a single news item, we might need a specific endpoint like GET /api/news/:id
        // If it doesn't exist, we can fetch all and filter, but let's assume /api/news/:id exists.
        // Actually, backend has `GET /api/news` which returns all. Let's fetch all and find it, or use the direct endpoint if added.
        const res = await fetch(`${apiUrl}/api/news`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          const item = data.find((n: any) => n._id === id);
          if (item) {
            setNewsItem(item);
          } else {
            setFetchError("News article not found.");
          }
        } else {
          setFetchError("Failed to fetch news article details.");
        }
      } catch (err) {
        setFetchError("Network error while fetching details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id, token]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#E0202B]" />
      </div>
    );
  }

  if (fetchError || !newsItem) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
        {fetchError || "News article not found."}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row items-start gap-8">
      {/* Left Column: Preview Card */}
      <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Card Preview of Mobile</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="w-full h-64 bg-gray-200 relative">
            {newsItem.coverImage ? (
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url('${newsItem.coverImage.startsWith('http') ? newsItem.coverImage : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${newsItem.coverImage}`}')` }}
              ></div>
            ) : (
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
            )}
          </div>
          <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold text-black tracking-tight leading-snug">
              {newsItem.title}
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">
              {newsItem.summary || "No summary provided."}
            </p>
            <div className="pt-6 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Tap to open full article</span>
              <div className="flex items-center gap-4 text-gray-500">
                <Bookmark className="w-5 h-5 cursor-pointer hover:text-black transition-colors" />
                <Share2 className="w-5 h-5 cursor-pointer hover:text-black transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Details Panel */}
      <div className="flex-1 w-full bg-[#F8F8F8] rounded-xl p-8 border border-gray-200 space-y-6 max-w-xl">
        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Headline</h3>
          <p className="text-black text-sm">{newsItem.title}</p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Summary</h3>
          <p className="text-black text-sm leading-relaxed">
            {newsItem.summary || "N/A"}
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Full Article Content</h3>
          <p className="text-black text-sm leading-relaxed max-h-48 overflow-y-auto bg-white p-3 rounded border border-gray-200">
            {newsItem.content || "N/A"}
          </p>
        </div>

        {newsItem.sourceUrl && (
          <div className="space-y-1">
            <h3 className="font-bold text-black text-sm">Full Article Link</h3>
            <Link href={newsItem.sourceUrl} target="_blank" className="text-blue-500 text-sm hover:underline break-all">
              {newsItem.sourceUrl}
            </Link>
          </div>
        )}

        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Category</h3>
          <p className="text-black text-sm">{newsItem.category?.name || "N/A"}</p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Language</h3>
          <p className="text-black text-sm">{newsItem.language?.toUpperCase() || "EN"}</p>
        </div>

        {newsItem.tags && newsItem.tags.length > 0 && (
          <div className="space-y-1">
            <h3 className="font-bold text-black text-sm">Tags</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {newsItem.tags.map((tag: any) => (
                <Badge key={tag._id || tag} className="bg-gray-200 text-black hover:bg-gray-300 font-normal rounded-full px-3 py-1">
                  {tag.name || tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Source</h3>
          <p className="text-black text-sm">{newsItem.source || "ASIAZE News Network"}</p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Status</h3>
          <p className="text-black text-sm capitalize">{newsItem.status}</p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Timestamp</h3>
          <p className="text-black text-sm">
            {new Date(newsItem.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="pt-6 flex flex-wrap items-center gap-4">
          <Link href={`/dashboard/news/edit/${newsItem._id}`}>
            <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full px-6 font-bold">
              Edit News
            </Button>
          </Link>
          <Link href="/dashboard/news">
            <Button variant="secondary" className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-full px-6 font-medium">
              Back to All News
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}