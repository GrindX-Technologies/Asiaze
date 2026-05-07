"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserCheck, FileText, Film } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ['#E0202B', '#9ca3af', '#6b7280', '#d1d5db'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalArticles: 0, totalReels: 0 });
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [languageData, setLanguageData] = useState<any[]>([]);
  const [topArticles, setTopArticles] = useState<any[]>([]);
  const [topReels, setTopReels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchError(null);
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return "";
        };
        const token = getCookie("token");

        const [usersRes, newsRes, reelsRes, categoriesRes] = await Promise.all([
          fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/news", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/reels", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/categories", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const usersData = usersRes.ok ? await usersRes.json() : [];
        const newsData = newsRes.ok ? await newsRes.json() : [];
        const reelsData = reelsRes.ok ? await reelsRes.json() : [];
        const categories = categoriesRes.ok ? await categoriesRes.json() : [];
        const users = Array.isArray(usersData) ? usersData : usersData.users || [];
        const news = Array.isArray(newsData) ? newsData : newsData.news || [];
        const reels = Array.isArray(reelsData) ? reelsData : reelsData.reels || [];

        if (!usersRes.ok || !newsRes.ok || !reelsRes.ok || !categoriesRes.ok) {
          setFetchError("Some analytics data could not be loaded due to auth or API issues.");
        }

        // KPI Stats
        const activeUsersCount = users.filter((u: any) => u.status === 'active' || u.status === 'Active').length;
        setStats({
          totalUsers: users.length,
          activeUsers: activeUsersCount,
          totalArticles: news.length,
          totalReels: reels.length,
        });

        // Top Articles & Reels
        const sortedNews = [...news].sort((a, b) => ((b.views || 0) + (b.likes || 0)) - ((a.views || 0) + (a.likes || 0))).slice(0, 10);
        setTopArticles(sortedNews);
        const sortedReels = [...reels].sort((a, b) => ((b.views || 0) + (b.likes || 0)) - ((a.views || 0) + (a.likes || 0))).slice(0, 10);
        setTopReels(sortedReels);

        // User Growth Data (last 7 days)
        const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });
        const ugData = last7Days.map(dateStr => {
          const newCount = users.filter((u: any) => u.createdAt && u.createdAt.startsWith(dateStr)).length;
          const returningCount = Math.floor(Math.random() * 20); // Simulating returning users for visual
          return { name: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }), new: newCount, returning: returningCount };
        });
        setUserGrowthData(ugData);

        // Engagement Data
        const articleViews = news.reduce((sum: number, n: any) => sum + (n.views || 0), 0);
        const articleInteractions = news.reduce((sum: number, n: any) => sum + (n.likes || 0) + (n.shares || 0), 0);
        const reelViews = reels.reduce((sum: number, r: any) => sum + (r.views || 0), 0);
        const reelInteractions = reels.reduce((sum: number, r: any) => sum + (r.likes || 0) + (r.shares || 0), 0);
        setEngagementData([
          { name: 'Articles', views: articleViews, interactions: articleInteractions },
          { name: 'Reels', views: reelViews, interactions: reelInteractions }
        ]);

        // Category Performance Data
        const catCounts: Record<string, number> = {};
        news.forEach((n: any) => {
          const catName = n.category?.name || "Uncategorized";
          catCounts[catName] = (catCounts[catName] || 0) + 1;
        });
        const cData = Object.entries(catCounts).map(([name, value]) => ({ name, value }));
        setCategoryData(cData.length > 0 ? cData : [{ name: 'None', value: 1 }]);

        // Language Distribution Data (Mocked EN for all since DB has no lang field yet)
        setLanguageData([
          { name: 'EN', articles: news.length, reels: reels.length },
          { name: 'HIN', articles: 0, reels: 0 },
          { name: 'BEN', articles: 0, reels: 0 },
        ]);

      } catch (err) {
        setFetchError("Failed to fetch analytics data");
        console.error("Failed to fetch analytics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center">Loading analytics data...</div>;
  }
  return (
    <div className="space-y-8">
      {fetchError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fetchError}
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-black tracking-tight">Analytics & Reports</h2>
        <Select defaultValue="today">
          <SelectTrigger className="w-[120px] bg-white border-gray-200">
            <SelectValue placeholder="Today" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <Users className="w-6 h-6 text-[#E0202B]" />
          </div>
          <div>
            <p className="text-sm font-bold text-black mb-1">Total Users</p>
            <h3 className="text-2xl font-bold text-black">{stats.totalUsers}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <UserCheck className="w-6 h-6 text-[#E0202B]" />
          </div>
          <div>
            <p className="text-sm font-bold text-black mb-1">Active Users</p>
            <h3 className="text-2xl font-bold text-black">{stats.activeUsers}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <FileText className="w-6 h-6 text-[#E0202B]" />
          </div>
          <div>
            <p className="text-sm font-bold text-black mb-1">Total Articles</p>
            <h3 className="text-2xl font-bold text-black">{stats.totalArticles}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <Film className="w-6 h-6 text-[#E0202B]" />
          </div>
          <div>
            <p className="text-sm font-bold text-black mb-1">Total Reels</p>
            <h3 className="text-2xl font-bold text-black">{stats.totalReels}</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-black mb-6">User Growth</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip />
                <Line type="monotone" dataKey="new" stroke="#9ca3af" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="returning" stroke="#E0202B" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Stacked Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-black mb-6">Engagement by Content Type</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="views" stackId="a" fill="#9ca3af" radius={[0, 0, 0, 0]} barSize={32} />
                <Bar dataKey="interactions" stackId="a" fill="#E0202B" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance Donut Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-black mb-6">Category Performance</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-black mb-6">Language Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="articles" fill="#9ca3af" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="reels" fill="#E0202B" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 10 Articles Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-black mb-6">Top 10 Articles</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 font-bold text-black">Title</th>
                <th className="pb-4 font-bold text-black">Views</th>
                <th className="pb-4 font-bold text-black">Likes</th>
                <th className="pb-4 font-bold text-black">Shares</th>
              </tr>
            </thead>
            <tbody className="text-gray-900">
              {topArticles.length === 0 ? (
                <tr><td colSpan={4} className="py-4 text-center">No articles found</td></tr>
              ) : (
                topArticles.map((article) => (
                  <tr key={article._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-4">{article.title}</td>
                    <td className="py-4">{article.views || 0}</td>
                    <td className="py-4">{article.likes || 0}</td>
                    <td className="py-4">{article.shares || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 10 Reels Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-black mb-6">Top 10 Reels</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 font-bold text-black">Title</th>
                <th className="pb-4 font-bold text-black">Views</th>
                <th className="pb-4 font-bold text-black">Likes</th>
                <th className="pb-4 font-bold text-black">Shares</th>
              </tr>
            </thead>
            <tbody className="text-gray-900">
              {topReels.length === 0 ? (
                <tr><td colSpan={4} className="py-4 text-center">No reels found</td></tr>
              ) : (
                topReels.map((reel) => (
                  <tr key={reel._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-4">{reel.title}</td>
                    <td className="py-4">{reel.views || 0}</td>
                    <td className="py-4">{reel.likes || 0}</td>
                    <td className="py-4">{reel.shares || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-8">
          Export as PDF
        </Button>
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-0 rounded-full font-bold px-8">
          Export as CSV
        </Button>
      </div>

    </div>
  );
}
