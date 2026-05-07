"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function AllNewsListPage() {
  const [newsData, setNewsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setFetchError(null);
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return "";
        };
        const token = getCookie("token");
        const res = await fetch("/api/news", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNewsData(data);
        } else {
          const errorData = await res.json().catch(() => ({}));
          const message = errorData?.message || "Failed to fetch news";
          setFetchError(message);
          setNewsData([]);
        }
      } catch (err) {
        setFetchError("Network error while fetching news");
        setNewsData([]);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fetchError}
        </div>
      )}
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-black tracking-tight">Manage News – All News</h2>
        
        <div className="flex items-center gap-3">
          <Link href="/dashboard/news/add">
            <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-medium px-6">
              + Add News
            </Button>
          </Link>
          
          <Input 
            placeholder="Search by headline or tags" 
            className="w-[250px] bg-white border-gray-200"
          />
          
          <Select>
            <SelectTrigger className="w-[120px] bg-white border-gray-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="politics">Politics</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
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
          <TableHeader className="bg-[#E5E7EB]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="font-bold text-black">Headline</TableHead>
              <TableHead className="font-bold text-black">Category</TableHead>
              <TableHead className="font-bold text-black">Language</TableHead>
              <TableHead className="font-bold text-black">Status</TableHead>
              <TableHead className="font-bold text-black">Date Created</TableHead>
              <TableHead className="font-bold text-black text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : newsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">No news found.</TableCell>
              </TableRow>
            ) : (
              newsData.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <div className="w-4 h-4 rounded border border-gray-300 bg-gray-100"></div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{item.title}</TableCell>
                  <TableCell>
                    <Badge className="bg-[#E0202B] hover:bg-[#E0202B]/90 text-white border-none rounded-full px-3 font-normal">
                      {item.category?.name || "General"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-900">EN</TableCell>
                  <TableCell>
                    <Badge 
                      className={`text-white border-none rounded-full px-3 font-normal ${
                        item.status === 'published' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-[#E0202B] hover:bg-[#E0202B]/90'
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-900 font-medium">{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-3 text-[#E0202B] text-sm font-medium">
                      <Link href={`/dashboard/news/edit/${item._id}`} className="hover:underline">Edit</Link>
                      <Link href={`/dashboard/news/view/${item._id}`} className="hover:underline">View</Link>
                      <button className="hover:underline">Delete</button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
