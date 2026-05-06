"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function EditReelPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-[1200px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        
        {/* Left Column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Reel Title/Headline</Label>
            <Input 
              defaultValue="Current Reel Title" 
              className="bg-white border-gray-200 h-12 text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Summary/Caption</Label>
            <Textarea 
              defaultValue="Current summary text, limited to 60 words." 
              className="bg-white border-gray-200 min-h-[160px] resize-none text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Full Article Link</Label>
            <Input 
              defaultValue="https://currentarticlelink.com" 
              className="bg-white border-gray-200 h-12 text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Category</Label>
            <Select defaultValue="entertainment">
              <SelectTrigger className="bg-white border-gray-200 h-12 text-gray-500">
                <SelectValue placeholder="Current Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="politics">Politics</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="entertainment">Current Category</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger className="bg-white border-gray-200 h-12 text-gray-500">
                <SelectValue placeholder="EN" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="hin">HIN</SelectItem>
                <SelectItem value="ben">BEN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Tags</Label>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-gray-100 text-gray-800 px-4 py-1.5 rounded-full text-sm font-medium">
                Tag1
              </span>
              <span className="bg-gray-100 text-gray-800 px-4 py-1.5 rounded-full text-sm font-medium">
                Tag2
              </span>
              <span className="bg-gray-100 text-gray-800 px-4 py-1.5 rounded-full text-sm font-medium">
                Tag3
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-black font-bold text-base">Current Video</Label>
            <div className="bg-gray-100 rounded-xl flex items-center justify-center h-[240px] border border-gray-200">
              <p className="text-gray-900 font-medium text-lg">Video Preview</p>
            </div>
            <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6">
              Replace Video
            </Button>
          </div>

          <div className="space-y-4">
            <Label className="text-black font-bold text-base">Current Thumbnail</Label>
            <div className="bg-gray-100 rounded-xl flex items-center justify-center h-[160px] border border-gray-200">
              <p className="text-gray-900 font-medium text-lg">Thumbnail Preview</p>
            </div>
            <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6">
              Replace Thumbnail
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Source Name</Label>
            <Input 
              defaultValue="Current Source Name" 
              className="bg-white border-gray-200 h-12 text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Duration</Label>
            <Input 
              defaultValue="00:02:30" 
              className="bg-white border-gray-200 h-12 text-gray-500"
            />
          </div>

          <div className="flex items-center gap-12 pt-2">
            <div className="flex items-center gap-4">
              <Label className="text-black font-bold text-base cursor-pointer" htmlFor="featured">Featured/Breaking</Label>
              <Switch id="featured" defaultChecked className="data-[state=checked]:bg-[#E0202B]" />
            </div>
            
            <div className="flex items-center gap-4">
              <Label className="text-black font-bold text-base cursor-pointer" htmlFor="comments">Enable Comments</Label>
              <Switch id="comments" defaultChecked className="data-[state=checked]:bg-[#E0202B]" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-gray-100">
        <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-8">
          Update
        </Button>
        <Button variant="outline" className="bg-gray-200 hover:bg-gray-300 text-gray-900 border-0 rounded-full font-bold px-8">
          Cancel
        </Button>
      </div>
    </div>
  );
}
