"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Smartphone, Bell, Clock, Search } from "lucide-react";

export default function PushNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [actionLink, setActionLink] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [isSending, setIsSending] = useState(false);

  // News selection
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const token = getCookie("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/news`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNewsList(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchNews();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const token = getCookie("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, body: message, actionLink, targetAudience })
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Push notification sent successfully! Success: ${data.successCount}, Failed: ${data.failureCount}`);
        setTitle("");
        setMessage("");
        setActionLink("");
      } else {
        alert(data.message || "Failed to send notification.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending notification.");
    } finally {
      setIsSending(false);
    }
  };

  const selectNews = (news: any) => {
    setTitle(news.title);
    // Remove HTML tags for plain text notification body
    const contentToParse = news.summary || news.description || news.content || "";
    const plainTextBody = contentToParse.replace(/<[^>]+>/g, '').substring(0, 150) + "...";
    setMessage(plainTextBody);
    setActionLink(`/news/${news._id}`);
    setIsNewsModalOpen(false);
  };

  const filteredNews = newsList.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-black tracking-tight">Push Notifications</h2>
        
        <Dialog open={isNewsModalOpen} onOpenChange={setIsNewsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black hover:bg-gray-800 text-white rounded-full font-bold px-6">
              News-to-Push Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-white text-black max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-black">Select News to Broadcast</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search news..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                {filteredNews.map(news => (
                  <div 
                    key={news._id} 
                    className="flex gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer items-center transition-colors"
                    onClick={() => selectNews(news)}
                  >
                    <img 
                      src={news.imageUrl?.startsWith('http') ? news.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${news.imageUrl}`} 
                      alt="" 
                      className="w-16 h-16 object-cover rounded-md shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm line-clamp-1">{news.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">{new Date(news.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {filteredNews.length === 0 && (
                  <p className="text-center text-sm text-gray-500 py-4">No news found.</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Composer Form */}
        <form onSubmit={handleSend} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-black font-bold text-base">Target Audience</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger className="bg-white border-gray-200 text-black">
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Users Only</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-black font-bold text-base">Notification Title</Label>
              <Input 
                placeholder="Enter title" 
                className="bg-white border-gray-200 text-black"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black font-bold text-base">Notification Message</Label>
              <Textarea 
                placeholder="Enter message" 
                className="bg-white border-gray-200 min-h-[120px] resize-none text-black"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black font-bold text-base">Action Link (Optional)</Label>
              <Input 
                placeholder="e.g. /news/123" 
                className="bg-white border-gray-200 text-black"
                value={actionLink}
                onChange={(e) => setActionLink(e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                type="submit" 
                disabled={isSending || (!title && !message)}
                className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-8 w-full md:w-auto"
              >
                {isSending ? "Sending..." : "Send Push Notification"}
              </Button>
            </div>
          </div>
        </form>

        {/* Live Preview Device Mockup */}
        <div className="flex flex-col items-center justify-start bg-gray-50 rounded-xl border border-gray-100 p-8">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Smartphone className="w-5 h-5" /> Live Device Preview
          </h3>
          
          <div className="relative w-[300px] h-[600px] bg-black rounded-[40px] shadow-2xl border-8 border-gray-900 overflow-hidden flex flex-col">
            {/* Fake Device Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-3xl w-1/2 mx-auto z-20"></div>
            
            {/* Fake Lock Screen Wallpaper */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-900 to-purple-900 opacity-80 z-0"></div>

            {/* Time */}
            <div className="relative z-10 mt-12 text-center">
              <h1 className="text-white text-5xl font-light tracking-wider">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </h1>
              <p className="text-white/80 text-sm mt-1">
                {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Notification Banner */}
            <div className="relative z-10 mt-8 px-4 w-full transition-all duration-300 ease-in-out">
              {(title || message) ? (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-[#E0202B] rounded flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">A</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-800 tracking-wide uppercase">Asiaze</span>
                    </div>
                    <span className="text-xs text-gray-500">now</span>
                  </div>
                  <h4 className="text-sm font-bold text-black mb-1 leading-tight">{title || "Notification Title"}</h4>
                  <p className="text-sm text-gray-700 leading-snug line-clamp-3">
                    {message || "Your notification message will appear here..."}
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-white/20 rounded-2xl p-4 text-center">
                  <Bell className="w-8 h-8 text-white/40 mx-auto mb-2" />
                  <p className="text-xs text-white/50">Start typing to see preview</p>
                </div>
              )}
            </div>

            {/* Fake bottom indicator */}
            <div className="mt-auto mb-2 mx-auto w-1/3 h-1 bg-white/40 rounded-full z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
