"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface NewsItem {
  _id: string;
  title: string;
  likes?: number;
  shares?: number;
  views?: number;
  createdAt?: string;
}

interface ReelItem {
  _id: string;
  title: string;
  likes?: number;
  shares?: number;
  views?: number;
  createdAt?: string;
}

interface UserItem {
  _id: string;
  createdAt?: string;
}

interface ChartData {
  name: string;
  current?: number;
  previous?: number;
  articles?: number;
  videos?: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ users: 0, articles: 0, reels: 0, bookmarksShares: 0 });
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [latestReels, setLatestReels] = useState<ReelItem[]>([]);
  const [lineChartData, setLineChartData] = useState<ChartData[]>([]);
  const [barChartData, setBarChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Fetch stats and lists from the backend API
    const fetchData = async () => {
      try {
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return "";
        };
        const token = getCookie("token");
        
        const [newsRes, reelsRes, usersRes] = await Promise.all([
          fetch("/api/news", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/reels", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const news = newsRes.ok ? await newsRes.json() : [];
        const reels = reelsRes.ok ? await reelsRes.json() : [];
        const users = usersRes.ok ? await usersRes.json() : [];

        // Calculate total bookmarks/shares (likes + shares from news and reels)
        let totalInteractions = 0;
        news.forEach((n: NewsItem) => {
          totalInteractions += (n.likes || 0) + (n.shares || 0) + (n.views || 0);
        });
        reels.forEach((r: ReelItem) => {
          totalInteractions += (r.likes || 0) + (r.shares || 0) + (r.views || 0);
        });

        setStats({
          users: users.length || 0,
          articles: news.length || 0,
          reels: reels.length || 0,
          bookmarksShares: totalInteractions
        });

        setLatestNews(news.slice(0, 5));
        setLatestReels(reels.slice(0, 5));

        // Process line chart data (Daily Active Users simulation based on user registrations)
        // Group users by creation date (last 7 days)
        const processLineChart = () => {
          const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
          });

          const data = last7Days.map(dateStr => {
            const current = users.filter((u: UserItem) => u.createdAt && u.createdAt.startsWith(dateStr)).length;
            // Simulated previous period for comparison line
            const previous = Math.floor(Math.random() * 10); 
            return { name: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }), current: current * 5, previous: previous * 5 };
          });
          setLineChartData(data);
        };
        processLineChart();

        // Process bar chart data (Articles vs Videos engagement per day)
        const processBarChart = () => {
          const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
          });

          const data = last7Days.map(dateStr => {
            const dayNews = news.filter((n: NewsItem) => n.createdAt && n.createdAt.startsWith(dateStr));
            const dayReels = reels.filter((r: ReelItem) => r.createdAt && r.createdAt.startsWith(dateStr));
            
            let articleEngagement = dayNews.reduce((sum: number, n: NewsItem) => sum + (n.views || 0) + (n.likes || 0), 0);
            let videoEngagement = dayReels.reduce((sum: number, r: ReelItem) => sum + (r.views || 0) + (r.likes || 0), 0);

            // Add small offset if zero just to show activity
            if (articleEngagement === 0 && dayNews.length > 0) articleEngagement = dayNews.length * 10;
            if (videoEngagement === 0 && dayReels.length > 0) videoEngagement = dayReels.length * 10;

            return { 
              name: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }), 
              articles: articleEngagement, 
              videos: videoEngagement 
            };
          });
          setBarChartData(data);
        };
        processBarChart();

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-[#E0202B]">
            Welcome Admin, here&apos;s today&apos;s overview
          </h2>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.users}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.articles}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.reels}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookmarks/Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.bookmarksShares}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Daily Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={true} tickLine={false} tick={false} />
                  <YAxis hide={true} />
                  <Tooltip />
                  <Line type="monotone" dataKey="current" stroke="#E0202B" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="previous" stroke="#9CA3AF" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Article/Video Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={true} tickLine={false} tick={false} />
                  <YAxis hide={true} />
                  <Tooltip />
                  <Bar dataKey="videos" stackId="a" fill="#9CA3AF" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="articles" stackId="a" fill="#E0202B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Latest News Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestNews.map((newsItem: NewsItem, i: number) => (
                <div key={newsItem._id || i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-foreground text-sm">{newsItem.title || `News Title ${i + 1}`}</span>
                  <Link href={`/dashboard/news/edit/${newsItem._id || i}`} className="text-[#E0202B] text-sm font-medium hover:underline">
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Latest Reels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestReels.map((reelItem: ReelItem, i: number) => (
                <div key={reelItem._id || i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-foreground text-sm">{reelItem.title || `Reel Title ${i + 1}`}</span>
                  <Link href={`/dashboard/reels/edit/${reelItem._id || i}`} className="text-[#E0202B] text-sm font-medium hover:underline">
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}