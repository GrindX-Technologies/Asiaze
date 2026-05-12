"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ViewStoryPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params?.id as string;
  
  const [story, setStory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return "";
  };

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const token = getCookie("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/stories/${storyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Failed to load story");
        
        const data = await res.json();
        setStory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (storyId) fetchStory();
  }, [storyId]);

  if (isLoading) return <div className="p-8 text-center">Loading story...</div>;
  if (error || !story) return <div className="p-8 text-center text-red-500">{error || "Story not found"}</div>;

  const currentPage = story.pages && story.pages.length > 0 ? story.pages[currentPageIndex] : null;

  const next = () => {
    if (currentPageIndex < story.pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const prev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-gray-50/50 -m-8 p-8 min-h-[calc(100vh-80px)]">
      {/* Left Pane - Preview */}
      <div className="relative w-full lg:w-[400px] h-[800px] bg-black rounded-[32px] overflow-hidden shadow-2xl shrink-0 mx-auto lg:mx-0 flex flex-col">
        {currentPage ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image 
                src={currentPage.imageUrl.startsWith('http') ? currentPage.imageUrl : `https://asiaze.cloud${currentPage.imageUrl}`}
                alt="Story preview"
                fill
                className="object-cover opacity-80"
              />
            </div>

            {/* Top actions */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-linear-to-b from-black/60 to-transparent z-10">
              <Link href="/dashboard/stories">
                <ArrowLeft className="w-6 h-6 text-white cursor-pointer hover:opacity-80" />
              </Link>
              <div className="text-white font-medium bg-black/40 px-3 py-1 rounded-full text-sm">
                {currentPageIndex + 1} / {story.pages.length}
              </div>
            </div>

            {/* Navigation Overlays */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer" onClick={prev}></div>
            <div className="absolute inset-y-0 right-0 w-2/3 z-20 cursor-pointer" onClick={next}></div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black via-black/80 to-transparent p-6 pt-20 z-10 pointer-events-none">
              <h2 className="text-2xl font-bold text-white mb-2">{currentPage.title}</h2>
              <p className="text-gray-300 text-sm mb-4">
                {currentPage.description}
              </p>
              
              {/* Progress bar segments */}
              <div className="w-full flex gap-1 h-1 rounded-full overflow-hidden">
                {story.pages.map((_: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`flex-1 h-full ${idx <= currentPageIndex ? 'bg-white' : 'bg-white/30'}`}
                  ></div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            No pages found
          </div>
        )}
      </div>

      {/* Right Pane - Metadata */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col">
        <h2 className="text-2xl font-bold text-black mb-8">Story Metadata</h2>
        
        <div className="space-y-6 flex-1">
          <div>
            <h3 className="font-bold text-black text-base mb-1">Story Group Name:</h3>
            <p className="text-gray-600">{story.title}</p>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Category:</h3>
            <p className="text-gray-600 capitalize">{story.category}</p>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Total Pages:</h3>
            <p className="text-gray-600">{story.pages?.length || 0}</p>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Views Count:</h3>
            <p className="text-gray-600">{story.views || 0}</p>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Likes Count:</h3>
            <p className="text-gray-600">{story.likes || 0}</p>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Status:</h3>
            <p className="text-gray-600">
              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${story.status === 'published' ? 'bg-green-500' : 'bg-gray-500'}`}>
                {story.status}
              </span>
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-black text-base mb-1">Created At:</h3>
            <p className="text-gray-600">{new Date(story.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-100">
          <Link href={`/dashboard/stories/edit/${story._id}`}>
            <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-8">
              Edit Story
            </Button>
          </Link>
          <Link href="/dashboard/stories">
            <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-0 rounded-full font-bold px-8">
              Back to All Stories
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
