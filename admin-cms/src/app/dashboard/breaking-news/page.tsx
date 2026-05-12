"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function BreakingNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [limit, setLimit] = useState("5");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return "";
  };

  const fetchData = async () => {
    try {
      const token = getCookie("token");
      
      const [newsRes, settingsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/news?status=published`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setNews(newsData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        const limitSetting = settingsData.find((s: any) => s.key === "breaking_news_limit");
        if (limitSetting) {
          setLimit(limitSetting.value.toString());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const token = getCookie("token");
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          key: "breaking_news_limit",
          value: Number(limit),
          group: "general",
          description: "Number of breaking news to display in the app ticker"
        })
      });

      if (res.ok) {
        alert("Breaking news limit saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const toggleBreaking = async (id: string, currentStatus: boolean) => {
    const activeCount = news.filter(n => n.isBreaking).length;
    
    if (!currentStatus && activeCount >= Number(limit)) {
      alert(`You can only select up to ${limit} breaking news items. Please increase the limit or deselect others first.`);
      return;
    }

    try {
      const token = getCookie("token");
      const res = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isBreaking: !currentStatus })
      });

      if (res.ok) {
        setNews(news.map(n => n._id === id ? { ...n, isBreaking: !currentStatus } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNews = news.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-black tracking-tight">Breaking News Management</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 h-fit">
          <h3 className="text-xl font-bold text-black border-b border-gray-100 pb-3">Ticker Settings</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-black font-bold text-sm">Max Breaking News Limit</label>
              <Input 
                type="number" 
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="bg-white border-gray-200" 
              />
              <p className="text-xs text-gray-500">
                Number of breaking news that will be shown in the app home page ticker.
              </p>
            </div>
          </div>

          <Button 
            onClick={saveSettings} 
            disabled={isSavingSettings}
            className="w-full bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold"
          >
            {isSavingSettings ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        {/* News Table */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-xl font-bold text-black">Select Breaking News</h3>
            <Input 
              placeholder="Search news..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs bg-white border-gray-200"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F9FAFB]">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="font-bold text-black py-3">Title</TableHead>
                  <TableHead className="font-bold text-black">Category</TableHead>
                  <TableHead className="font-bold text-black">Status</TableHead>
                  <TableHead className="font-bold text-black text-right">Breaking?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : filteredNews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">No published news found.</TableCell>
                  </TableRow>
                ) : (
                  filteredNews.map((item) => (
                    <TableRow key={item._id} className="border-b border-gray-50">
                      <TableCell className="font-bold text-gray-900 max-w-[200px] truncate">{item.title}</TableCell>
                      <TableCell className="text-gray-600">{item.category?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`text-white border-none rounded-full px-3 py-0.5 font-medium ${
                            item.isBreaking ? 'bg-[#E0202B]' : 'bg-gray-400'
                          }`}
                        >
                          {item.isBreaking ? "Breaking" : "Standard"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          onClick={() => toggleBreaking(item._id, item.isBreaking)}
                          variant={item.isBreaking ? "destructive" : "outline"}
                          className={`rounded-full text-xs h-8 px-4 ${!item.isBreaking && 'hover:bg-gray-100'}`}
                        >
                          {item.isBreaking ? "Remove" : "Set Breaking"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}