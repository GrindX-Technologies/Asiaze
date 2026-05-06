"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function PushNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      alert("Push notification sent successfully!");
      setTitle("");
      setMessage("");
      setIsSending(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-black tracking-tight">Push Notifications</h2>
      
      <form onSubmit={handleSend} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Target Audience</Label>
            <Select defaultValue="all">
              <SelectTrigger className="bg-white border-gray-200">
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
              className="bg-white border-gray-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Notification Message</Label>
            <Textarea 
              placeholder="Enter message" 
              className="bg-white border-gray-200 min-h-[120px] resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Action Link (Optional)</Label>
            <Input 
              placeholder="e.g. /news/123" 
              className="bg-white border-gray-200"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSending}
              className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-8"
            >
              {isSending ? "Sending..." : "Send Notification"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
