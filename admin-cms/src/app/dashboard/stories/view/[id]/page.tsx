"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ViewStoryPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-gray-50/50 -m-8 p-8 min-h-[calc(100vh-80px)]">
      {/* Left Pane - Preview */}
      <div className="relative w-full lg:w-[400px] h-[800px] bg-black rounded-[32px] overflow-hidden shadow-2xl shrink-0 mx-auto lg:mx-0">
        {/* Abstract shapes background matching the image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&h=800&fit=crop"
            alt="Story preview abstract"
            fill
            className="object-cover opacity-80"
          />
        </div>

        {/* Top actions */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-linear-to-b from-black/60 to-transparent z-10">
          <Link href="/dashboard/storys">
            <ArrowLeft className="w-6 h-6 text-white cursor-pointer hover:opacity-80" />
          </Link>
          <div className="flex gap-4">
            <Heart className="w-6 h-6 text-white fill-white cursor-pointer hover:opacity-80" />
            <MessageCircle className="w-6 h-6 text-white fill-white cursor-pointer hover:opacity-80" />
            <Share2 className="w-6 h-6 text-white fill-white cursor-pointer hover:opacity-80" />
          </div>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black via-black/80 to-transparent p-6 pt-20 z-10">
          <h2 className="text-2xl font-bold text-white mb-2">Story Headline</h2>
          <p className="text-gray-300 text-sm mb-3">
            This is a sample caption for the story preview.
          </p>
          <p className="text-gray-400 text-xs mb-4">
            Source Name · 2 hours ago
          </p>
          {/* Progress bar line */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-[#E0202B]"></div>
          </div>
        </div>
      </div>

      {/* Right Pane - Metadata */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col">
        <h2 className="text-2xl font-bold text-black mb-8">Story Metadata</h2>
        
        <div className="space-y-6 flex-1">
          <div>
            <h3 className="font-bold text-black text-base mb-1">Title:</h3>
            <p className="text-gray-600">Sample Story Title</p>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Caption:</h3>
            <p className="text-gray-600 leading-relaxed">
              This is a detailed caption for the story, providing more context and information.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Full Article Link:</h3>
            <a href="#" className="text-[#E0202B] hover:underline">Read full article</a>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Category:</h3>
            <p className="text-gray-600">Entertainment</p>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Language:</h3>
            <p className="text-gray-600">English</p>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-2">Tags:</h3>
            <div className="flex items-center gap-2">
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">Tag1</span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">Tag2</span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">Tag3</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Source & Duration:</h3>
            <p className="text-gray-600">News Network · 2 min read</p>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Status:</h3>
            <p className="text-gray-600">Published</p>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-100">
          <Link href="/dashboard/storys/edit/1">
            <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-8">
              Edit Story
            </Button>
          </Link>
          <Link href="/dashboard/storys">
            <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-0 rounded-full font-bold px-8">
              Back to All Storys
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
