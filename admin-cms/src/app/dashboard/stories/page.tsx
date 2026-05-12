"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export default function StorysListPage() {
  const [storiesData, setStoriesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedStories.length === storiesData.length) {
      setSelectedStories([]);
    } else {
      setSelectedStories(storiesData.map((r) => r._id));
    }
  };

  const toggleSelectStory = (id: string) => {
    if (selectedStories.includes(id)) {
      setSelectedStories(selectedStories.filter((rId) => rId !== id));
    } else {
      setSelectedStories([...selectedStories, id]);
    }
  };

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return "";
        };
        const token = getCookie("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/stories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStoriesData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-black tracking-tight">Manage Stories – All Stories</h2>
        <Link href="/dashboard/stories/add">
          <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6 py-2 h-auto">
            + Add Story
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex-1">
          <Input 
            placeholder="Search stories by headline or tags..." 
            className="w-full bg-white border-gray-200"
          />
        </div>
        <div className="flex gap-4">
          <Select>
            <SelectTrigger className="w-[140px] bg-white border-gray-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="politics">Politics</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[120px] bg-white border-gray-200">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="hin">HIN</SelectItem>
              <SelectItem value="ben">BEN</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[120px] bg-white border-gray-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow className="hover:bg-transparent border-b border-gray-100">
              <TableHead className="w-[40px] py-4">
                <Checkbox 
                  className="ml-2 border-gray-300" 
                  checked={selectedStories.length > 0 && selectedStories.length === storiesData.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="font-bold text-black py-4">Story Headline</TableHead>
              <TableHead className="font-bold text-black">Category</TableHead>
              <TableHead className="font-bold text-black">Language</TableHead>
              <TableHead className="font-bold text-black">Status</TableHead>
              <TableHead className="font-bold text-black">Views Count</TableHead>
              <TableHead className="font-bold text-black">Likes Count</TableHead>
              <TableHead className="font-bold text-black">Date Created</TableHead>
              <TableHead className="font-bold text-black text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : storiesData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">No stories found.</TableCell>
              </TableRow>
            ) : (
              storiesData.map((item) => (
                <TableRow key={item._id} className="border-b border-gray-50">
                  <TableCell className="py-4">
                    <Checkbox 
                      className="ml-2 border-gray-300" 
                      checked={selectedStories.includes(item._id)}
                      onCheckedChange={() => toggleSelectStory(item._id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-[#2563EB] hover:underline cursor-pointer">
                    {item.title}
                  </TableCell>
                  <TableCell>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      General
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-900 font-medium">EN</TableCell>
                  <TableCell>
                    <Badge 
                      className={`text-white border-none rounded-full px-3 py-0.5 font-medium ${
                        item.status === 'active' 
                          ? 'bg-[#22C55E] hover:bg-[#22C55E]/90' 
                          : 'bg-[#9CA3AF] hover:bg-[#9CA3AF]/90'
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-900 font-medium">{item.views}</TableCell>
                  <TableCell className="text-gray-900 font-medium">{item.likes}</TableCell>
                  <TableCell className="text-gray-900 font-medium">{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-3 text-gray-700">
                      <Link href={`/dashboard/stories/edit/${item._id}`}>
                        <Pencil className="w-[18px] h-[18px] cursor-pointer hover:text-black transition-colors" />
                      </Link>
                      <Link href={`/dashboard/stories/view/${item._id}`}>
                        <Eye className="w-[18px] h-[18px] cursor-pointer hover:text-black transition-colors" />
                      </Link>
                      <Trash2 className="w-[18px] h-[18px] cursor-pointer hover:text-red-600 text-red-500 transition-colors" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Bulk Actions */}
      {selectedStories.length > 0 && (
        <div className="flex justify-end gap-3 pt-4">
          <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6">
            Publish Selected
          </Button>
          <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-0 rounded-full font-bold px-6">
            Unpublish Selected
          </Button>
          <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-0 rounded-full font-bold px-6">
            Delete Selected
          </Button>
        </div>
      )}
    </div>
  );
}
