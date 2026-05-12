"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MessageCircle, Share2, Play } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ViewReelPage() {
  const params = useParams();
  const reelId = params.id as string;
  const [reel, setReel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          setReel(data);
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

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!reel) return <div className="p-8">Reel not found.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-gray-50/50 -m-8 p-8 min-h-[calc(100vh-80px)]">
      {/* Left Pane - Preview */}
      <div className="relative w-full max-w-[400px] aspect-9/16 bg-black rounded-[32px] overflow-hidden shadow-2xl shrink-0 mx-auto lg:mx-0">
        <div className="absolute inset-0 flex items-center justify-center">
          {reel.videoUrl ? (
            <video 
              src={reel.videoUrl.startsWith('http') ? reel.videoUrl : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${reel.videoUrl}`} 
              className="object-cover w-full h-full opacity-90"
              controls
              playsInline
              poster={reel.thumbnailUrl ? (reel.thumbnailUrl.startsWith('http') ? reel.thumbnailUrl : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${reel.thumbnailUrl}`) : undefined}
            />
          ) : reel.thumbnailUrl ? (
            <img 
              src={reel.thumbnailUrl.startsWith('http') ? reel.thumbnailUrl : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${reel.thumbnailUrl}`}
              alt="Reel preview"
              className="object-cover w-full h-full absolute inset-0 opacity-80"
            />
          ) : (
            <div className="text-gray-500">No media available</div>
          )}
        </div>

        {/* Top actions */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-linear-to-b from-black/60 to-transparent z-10 pointer-events-none">
          <Link href="/dashboard/reels" className="pointer-events-auto">
            <ArrowLeft className="w-6 h-6 text-white cursor-pointer hover:opacity-80" />
          </Link>
          <div className="flex gap-4 pointer-events-auto">
            <Heart className="w-6 h-6 text-white fill-white cursor-pointer hover:opacity-80" />
            <MessageCircle className="w-6 h-6 text-white fill-white cursor-pointer hover:opacity-80" />
            <Share2 className="w-6 h-6 text-white fill-white cursor-pointer hover:opacity-80" />
          </div>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black via-black/80 to-transparent p-6 pt-20 z-10 pointer-events-none">
          <h2 className="text-2xl font-bold text-white mb-2">{reel.title || "Untitled Reel"}</h2>
          <p className="text-gray-300 text-sm mb-3">
            {reel.description || "No description provided."}
          </p>
          <p className="text-gray-400 text-xs mb-4">
            {reel.uploader?.name || "Unknown"} · {new Date(reel.createdAt).toLocaleDateString()}
          </p>
          {/* Progress bar line */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-[#E0202B]"></div>
          </div>
        </div>
      </div>

      {/* Right Pane - Metadata */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col">
        <h2 className="text-2xl font-bold text-black mb-8">Reel Metadata</h2>
        
        <div className="space-y-6 flex-1">
          <div>
            <h3 className="font-bold text-black text-base mb-1">Title:</h3>
            <p className="text-gray-600">{reel.title}</p>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Caption:</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {reel.description || "N/A"}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Full Article Link:</h3>
            {reel.articleLink ? (
              <a href={reel.articleLink} target="_blank" rel="noopener noreferrer" className="text-[#E0202B] hover:underline break-all">
                {reel.articleLink}
              </a>
            ) : (
              <p className="text-gray-600">N/A</p>
            )}
          </div>

          <div>
            <h3 className="font-bold text-black text-base mb-1">Status:</h3>
            <p className="text-gray-600">
              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${reel.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}>
                {reel.status || 'inactive'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-100">
          <Link href={`/dashboard/reels/edit/${reel._id}`}>
            <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-8">
              Edit Reel
            </Button>
          </Link>
          <Link href="/dashboard/reels">
            <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-0 rounded-full font-bold px-8">
              Back to All Reels
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
