"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const loginHistory = [
  { id: 1, timestamp: "2023-10-10 10:00 AM", device: "Chrome on Windows 10" },
  { id: 2, timestamp: "2023-09-28 09:45", device: "Safari on iOS" },
  { id: 3, timestamp: "2023-09-20 14:30", device: "Firefox on MacOS" },
];

export default function EditUserPage() {
  return (
    <div className="space-y-8 max-w-[1200px]">
      
      {/* Edit Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-black mb-8">User Profile & Edit</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Name</Label>
            <Input 
              defaultValue="John Smith" 
              className="bg-white border-gray-200 h-12 text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Email</Label>
            <Input 
              defaultValue="john.smith@example.com" 
              className="bg-white border-gray-200 h-12 text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Phone</Label>
            <Input 
              defaultValue="1234567890" 
              className="bg-white border-gray-200 h-12 text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Role</Label>
            <Select defaultValue="user">
              <SelectTrigger className="bg-white border-gray-200 h-12 text-gray-500">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base block mb-3">Status</Label>
            <Switch id="status" className="data-[state=unchecked]:bg-[#E0202B]" />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold text-base">Date Registered</Label>
            <Input 
              defaultValue="2021-07-16" 
              readOnly
              className="bg-gray-50 border-gray-200 h-12 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-black mb-6">Login History</h3>
        
        <div className="rounded-lg border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="font-bold text-black py-4">Timestamp</TableHead>
                <TableHead className="font-bold text-black">Device</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loginHistory.map((item) => (
                <TableRow key={item.id} className="border-b border-gray-50">
                  <TableCell className="py-4 text-gray-900 font-medium">
                    {item.timestamp}
                  </TableCell>
                  <TableCell className="text-gray-900 font-medium">
                    {item.device}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" className="bg-gray-200 hover:bg-gray-300 text-gray-900 border-0 rounded-full font-bold px-8">
          Cancel
        </Button>
        <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-8">
          Save Changes
        </Button>
      </div>

    </div>
  );
}
