"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useToken } from "@/components/TokenProvider";

export default function AllNewsListPage() {
  const [newsData, setNewsData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const token = useToken();

  const getCookieToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
    return "";
  };

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const authToken = token || getCookieToken();
      if (!authToken) {
        setFetchError("Unauthorized. Your session may have expired.");
        setNewsData([]);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/news`, {
        headers: { Authorization: `Bearer ${authToken}` }
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const authToken = token || getCookieToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchNews();
    fetchCategories();
  }, [token]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNews(filteredNewsData.map(n => n._id));
    } else {
      setSelectedNews([]);
    }
  };

  const handleSelectNews = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedNews(prev => [...prev, id]);
    } else {
      setSelectedNews(prev => prev.filter(nId => nId !== id));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news article?")) return;
    
    try {
      const authToken = token || getCookieToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/news/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        fetchNews();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to delete news article: ${err.message || res.statusText}`);
      }
    } catch (err: any) {
      alert(`Error deleting news article: ${err.message}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNews.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedNews.length} selected news articles?`)) return;

    try {
      const authToken = token || getCookieToken();
      // Wait for all deletions to complete
      await Promise.all(selectedNews.map(id => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/news/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ));
      setSelectedNews([]);
      fetchNews();
    } catch (err) {
      alert("Error performing bulk delete");
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedNews.length === 0) return;
    if (!confirm(`Are you sure you want to change status to ${status} for ${selectedNews.length} selected news articles?`)) return;

    try {
      const authToken = token || getCookieToken();
      // Wait for all updates to complete
      await Promise.all(selectedNews.map(id => {
        const item = newsData.find(n => n._id === id);
        if (!item) return Promise.resolve();
        
        // Logic: Cannot publish if already published. Cannot draft if already drafted.
        if (item.status === status) return Promise.resolve();
        
        return fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/news/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}` 
          },
          body: JSON.stringify({ ...item, status })
        });
      }));
      setSelectedNews([]);
      fetchNews();
    } catch (err) {
      alert("Error performing bulk status change");
    }
  };

  // Filter logic
  const filteredNewsData = useMemo(() => {
    return newsData.filter(item => {
      const matchQuery = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = categoryFilter === "all" || item.category?._id === categoryFilter;
      const matchLanguage = languageFilter === "all" || item.language?.toLowerCase() === languageFilter;
      const matchStatus = statusFilter === "all" || item.status === statusFilter;

      return matchQuery && matchCategory && matchLanguage && matchStatus;
    });
  }, [newsData, searchQuery, categoryFilter, languageFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fetchError}
        </div>
      )}
      {/* Header Actions */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-black tracking-tight">Manage News – All News</h2>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <Link href="/dashboard/news/add">
            <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-medium px-6">
              + Add News
            </Button>
          </Link>
          
          <Input 
            placeholder="Search by headline or tags" 
            className="w-full sm:w-[250px] bg-white border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[120px] bg-white border-gray-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-full sm:w-[120px] bg-white border-gray-200">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="hin">HIN</SelectItem>
              <SelectItem value="ben">BEN</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[120px] bg-white border-gray-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNews.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            {selectedNews.length} items selected
          </span>
          <div className="flex gap-2">
            {selectedNews.some(id => newsData.find(n => n._id === id)?.status === 'draft') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkStatusChange('published')}
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                Publish Selected
              </Button>
            )}
            {selectedNews.some(id => newsData.find(n => n._id === id)?.status === 'published') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkStatusChange('draft')}
                className="border-gray-500 text-gray-600 hover:bg-gray-50"
              >
                Draft Selected
              </Button>
            )}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader className="bg-[#E5E7EB]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedNews.length === filteredNewsData.length && filteredNewsData.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="border-gray-300 data-[state=checked]:bg-[#E0202B] data-[state=checked]:border-[#E0202B]"
                />
              </TableHead>
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
            ) : filteredNewsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">No news found.</TableCell>
              </TableRow>
            ) : (
              filteredNewsData.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedNews.includes(item._id)}
                      onCheckedChange={(checked) => handleSelectNews(item._id, checked as boolean)}
                      className="border-gray-300 data-[state=checked]:bg-[#E0202B] data-[state=checked]:border-[#E0202B]"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 max-w-[200px] lg:max-w-[300px] truncate" title={item.title}>
                    {item.title}
                  </TableCell>
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
                      <button onClick={() => handleDelete(item._id)} className="hover:underline text-red-600">Delete</button>
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
