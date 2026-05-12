"use client";

import { useEffect, useState } from "react";
import { useToken } from "@/components/TokenProvider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserCheck, FileText, Film } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const token = useToken();

  useEffect(() => {
    const getCookieToken = () => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; token=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
      return "";
    };

    const fetchData = async () => {
      try {
        setFetchError(null);
        const authToken = token || getCookieToken();
        if (!authToken) {
          setFetchError("Unauthorized. Your session may have expired.");
          return;
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const [usersRes, newsRes, reelsRes, categoriesRes] = await Promise.all([
          fetch(`${apiUrl}/api/users`, { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch(`${apiUrl}/api/news`, { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch(`${apiUrl}/api/reels`, { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch(`${apiUrl}/api/categories`, { headers: { Authorization: `Bearer ${authToken}` } })
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
        const ugData = last7Days.map((dateStr, index) => {
          const current = users.filter((u: any) => u.createdAt && u.createdAt.startsWith(dateStr)).length;
          
          // Realistic previous period calculation (7 days before the current dateStr)
          const prevDate = new Date(dateStr);
          prevDate.setDate(prevDate.getDate() - 7);
          const prevDateStr = prevDate.toISOString().split('T')[0];
          const previous = users.filter((u: any) => u.createdAt && u.createdAt.startsWith(prevDateStr)).length;
          
          return { name: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }), new: current, returning: previous };
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
  }, [token]);

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // KPI Stats
      csvContent += "KPI Statistics\\n";
      csvContent += "Total Users,Active Users,Total Articles,Total Reels\\n";
      csvContent += `${stats.totalUsers},${stats.activeUsers},${stats.totalArticles},${stats.totalReels}\\n\\n`;

      // Top Articles
      csvContent += "Top 10 Articles\\n";
      csvContent += "Title,Views,Likes,Shares\\n";
      topArticles.forEach(a => {
        csvContent += `"${(a.title || "").replace(/"/g, '""')}",${a.views || 0},${a.likes || 0},${a.shares || 0}\\n`;
      });
      csvContent += "\\n";

      // Top Reels
      csvContent += "Top 10 Reels\\n";
      csvContent += "Title,Views,Likes,Shares\\n";
      topReels.forEach(r => {
        csvContent += `"${(r.title || "").replace(/"/g, '""')}",${r.views || 0},${r.likes || 0},${r.shares || 0}\\n`;
      });
      csvContent += "\\n";

      // User Growth
      csvContent += "User Growth (Last 7 Days)\\n";
      csvContent += "Day,New Users,Returning Users\\n";
      userGrowthData.forEach(ug => {
        csvContent += `${ug.name},${ug.new},${ug.returning}\\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `asiaze_analytics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("CSV Export Error:", error);
      alert("Failed to export CSV. Please try again.");
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("ASIAZE Analytics Report", 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

      // KPI Table
      autoTable(doc, {
        startY: 40,
        head: [['Metric', 'Value']],
        body: [
          ['Total Users', stats.totalUsers],
          ['Active Users', stats.activeUsers],
          ['Total Articles', stats.totalArticles],
          ['Total Reels', stats.totalReels],
        ],
        theme: 'grid',
        headStyles: { fillColor: [224, 32, 43] }
      });

      let finalY = (doc as any).lastAutoTable.finalY || 40;

      // Top Articles Table
      doc.text("Top 10 Articles", 14, finalY + 15);
      autoTable(doc, {
        startY: finalY + 20,
        head: [['Title', 'Views', 'Likes', 'Shares']],
        body: topArticles.map(a => [a.title || 'N/A', a.views || 0, a.likes || 0, a.shares || 0]),
        theme: 'striped',
        headStyles: { fillColor: [224, 32, 43] }
      });

      finalY = (doc as any).lastAutoTable.finalY || finalY + 20;

      // Top Reels Table
      doc.text("Top 10 Reels", 14, finalY + 15);
      autoTable(doc, {
        startY: finalY + 20,
        head: [['Title', 'Views', 'Likes', 'Shares']],
        body: topReels.map(r => [r.title || 'N/A', r.views || 0, r.likes || 0, r.shares || 0]),
        theme: 'striped',
        headStyles: { fillColor: [224, 32, 43] }
      });

      doc.save(`asiaze_analytics_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExportingPDF(false);
    }
  };

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
        <Button 
          onClick={handleExportPDF} 
          disabled={isExportingPDF}
          className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-8"
        >
          {isExportingPDF ? "Exporting PDF..." : "Export as PDF"}
        </Button>
        <Button 
          onClick={handleExportCSV}
          disabled={isExportingCSV}
          variant="outline" 
          className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-0 rounded-full font-bold px-8"
        >
          {isExportingCSV ? "Exporting CSV..." : "Export as CSV"}
        </Button>
      </div>

    </div>
  );
}
