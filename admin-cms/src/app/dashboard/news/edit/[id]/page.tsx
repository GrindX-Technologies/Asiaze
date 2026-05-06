"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditNewsPage() {
  const params = useParams();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black tracking-tight">Edit News</h2>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-black font-bold">Headline</Label>
              <Input 
                defaultValue="Pre-filled Headline" 
                className="bg-white border-gray-200 text-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Summary <span className="font-normal text-gray-400 text-sm">(60 words max)</span></Label>
              <Textarea 
                defaultValue="Pre-filled summary text with word counter visible." 
                className="bg-white border-gray-200 resize-none h-32 text-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Full Article Link</Label>
              <Input 
                defaultValue="https://existing-article-link.com" 
                className="bg-white border-gray-200 text-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Category</Label>
              <Select defaultValue="politics">
                <SelectTrigger className="bg-white border-gray-200 text-gray-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="politics">Politics</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger className="bg-white border-gray-200 text-gray-500">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="hin">HIN</SelectItem>
                  <SelectItem value="ben">BEN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label className="text-black font-bold">Tags</Label>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-[#E0202B] hover:bg-[#E0202B]/90 text-white rounded-full px-3 py-1 font-normal">
                  Breaking
                </Badge>
                <Badge variant="secondary" className="bg-gray-200 hover:bg-gray-300 text-black rounded-full px-3 py-1 font-normal">
                  World
                </Badge>
                <Badge variant="secondary" className="bg-gray-200 hover:bg-gray-300 text-black rounded-full px-3 py-1 font-normal">
                  Local
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-black font-bold">Current Image</Label>
              <div className="w-48 h-32 bg-gray-200 rounded-lg overflow-hidden border border-gray-200 relative">
                {/* Simulated existing image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center"></div>
              </div>
              <Button variant="secondary" className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-full font-medium h-10 px-6">
                Replace Image
              </Button>
            </div>
            
            <div className="space-y-2 pt-4">
              <Label className="text-black font-bold">Source</Label>
              <Input 
                defaultValue="Existing Source" 
                className="bg-white border-gray-200 text-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-black font-bold">Timestamp</Label>
              <Input 
                defaultValue="2023-10-14 10:00" 
                className="bg-white border-gray-200 text-gray-500"
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
          <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full px-8 font-bold">
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}