"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bookmark, Share2 } from "lucide-react";

export default function ViewNewsPage() {
  return (
    <div className="h-full flex items-start gap-8">
      {/* Left Column: Preview Card */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto">
        <div className="w-full h-64 bg-gray-200 relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center"></div>
        </div>
        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-bold text-black tracking-tight leading-snug">
            Breaking News: Major Event in the City
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            This is a short summary of the news article, providing a brief overview of the major event happening in the city, limited to approximately 60 words to give a quick insight for readers.
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

      {/* Right Column: Details Panel */}
      <div className="flex-1 bg-[#F8F8F8] rounded-xl p-8 border border-gray-200 space-y-6 max-w-xl">
        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Headline</h3>
          <p className="text-black text-sm">Breaking News: Major Event in the City</p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Summary</h3>
          <p className="text-black text-sm leading-relaxed">
            This section contains the summary of the news article, providing a concise description of the event, limited to approximately 60 words for quick reading.
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Full Article Link</h3>
          <Link href="#" className="text-blue-500 text-sm hover:underline">
            Read Full Article
          </Link>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Category</h3>
          <p className="text-black text-sm">Politics</p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Language</h3>
          <p className="text-black text-sm">English</p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Source</h3>
          <p className="text-black text-sm">ASIAZE News Network</p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-black text-sm">Timestamp</h3>
          <p className="text-black text-sm">October 14, 2023 10:00 AM</p>
        </div>

        <div className="pt-6 flex items-center gap-4">
          <Link href="/dashboard/news/edit/1">
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