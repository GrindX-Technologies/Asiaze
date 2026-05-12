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

export default function ReelsListPage() {
  const [reelsData, setReelsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReels, setSelectedReels] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (!Array.isArray(reelsData)) return;
    if (selectedReels.length === reelsData.length) {
      setSelectedReels([]);
    } else {
      setSelectedReels(reelsData.map((r) => r._id));
    }
  };

  const toggleSelectReel = (id: string) => {
    if (selectedReels.includes(id)) {
      setSelectedReels(selectedReels.filter((rId) => rId !== id));
    } else {
      setSelectedReels([...selectedReels, id]);
    }
  };

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return "";
        };
        const token = getCookie("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/reels?status=all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReelsData(Array.isArray(data) ? data : []);
        } else {
          setReelsData([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReels();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-black tracking-tight">Manage Reels – All Reels</h2>
        <Link href="/dashboard/reels/add">
          <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6 py-2 h-auto">
            + Add Reel
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex-1">
          <Input 
            placeholder="Search reels by headline or tags..." 
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
                  checked={selectedReels.length > 0 && Array.isArray(reelsData) && selectedReels.length === reelsData.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="font-bold text-black py-4">Reel Headline</TableHead>
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
                <TableCell colSpan={9} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : reelsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">No reels found.</TableCell>
              </TableRow>
            ) : (
              Array.isArray(reelsData) && reelsData.map((item) => (
                <TableRow key={item._id} className="border-b border-gray-50">
                  <TableCell className="py-4">
                    <Checkbox 
                      className="ml-2 border-gray-300" 
                      checked={selectedReels.includes(item._id)}
                      onCheckedChange={() => toggleSelectReel(item._id)}
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
                      <Link href={`/dashboard/reels/edit/${item._id}`}>
                        <Pencil className="w-[18px] h-[18px] cursor-pointer hover:text-black transition-colors" />
                      </Link>
                      <Link href={`/dashboard/reels/view/${item._id}`}>
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
      {selectedReels.length > 0 && (
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
