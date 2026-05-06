"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PastNotificationsPage() {
  const dummyNotifications = [
    { id: 1, title: "Welcome to ASIAZE", message: "Check out the latest news and reels today!", target: "All Users", status: "Sent", date: "2023-10-15" },
    { id: 2, title: "New Feature Update", message: "We've added a new way to bookmark your favorite articles.", target: "Active Users Only", status: "Sent", date: "2023-10-10" },
    { id: 3, title: "We miss you", message: "Come back and see what's trending in politics and sports.", target: "Inactive Users", status: "Failed", date: "2023-09-28" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-black tracking-tight">Past Notifications</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow className="hover:bg-transparent border-b border-gray-100">
              <TableHead className="font-bold text-black py-4 pl-6">Title</TableHead>
              <TableHead className="font-bold text-black">Message</TableHead>
              <TableHead className="font-bold text-black">Target</TableHead>
              <TableHead className="font-bold text-black">Status</TableHead>
              <TableHead className="font-bold text-black text-right pr-6">Date Sent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyNotifications.map((notif) => (
              <TableRow key={notif.id} className="border-b border-gray-50">
                <TableCell className="py-4 pl-6 font-medium text-gray-900">{notif.title}</TableCell>
                <TableCell className="text-gray-600 max-w-[300px] truncate">{notif.message}</TableCell>
                <TableCell className="text-gray-900">{notif.target}</TableCell>
                <TableCell>
                  <Badge 
                    className={`text-white border-none rounded-full px-3 py-0.5 font-medium ${
                      notif.status === 'Sent' 
                        ? 'bg-[#22C55E] hover:bg-[#22C55E]/90' 
                        : 'bg-[#E0202B] hover:bg-[#E0202B]/90'
                    }`}
                  >
                    {notif.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6 text-gray-600">{notif.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
