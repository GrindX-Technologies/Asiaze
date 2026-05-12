"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Eye, Trash2, Ban, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useToken } from "@/components/TokenProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function UsersListPage() {
  const [usersData, setUsersData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [viewingUser, setViewingUser] = useState<any>(null);
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const token = useToken();

  const toggleSelectAll = () => {
    if (selectedUsers.length === usersData.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(usersData.map((u) => u._id));
    }
  };

  const toggleSelectUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((uId) => uId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const fetchUsersList = async () => {
    try {
      setFetchError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersData(Array.isArray(data) ? data : data.users || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData?.message || "Failed to fetch users";
        setFetchError(message);
        setUsersData([]);
      }
    } catch (err) {
      setFetchError("Network error while fetching users");
      setUsersData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, [token]);

  const handleBulkStatusUpdate = async (status: 'active' | 'blocked') => {
    if (selectedUsers.length === 0) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/users/bulk-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userIds: selectedUsers, status })
      });
      
      if (res.ok) {
        setSelectedUsers([]);
        fetchUsersList();
      } else {
        const err = await res.json();
        setFetchError(err.message || `Failed to ${status === 'blocked' ? 'block' : 'unblock'} users`);
      }
    } catch (err) {
      setFetchError("Network error occurred during bulk update");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm("Are you sure you want to delete the selected users? This action cannot be undone.")) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/users/bulk-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userIds: selectedUsers })
      });
      
      if (res.ok) {
        setSelectedUsers([]);
        fetchUsersList();
      } else {
        const err = await res.json();
        setFetchError(err.message || "Failed to delete users");
      }
    } catch (err) {
      setFetchError("Network error occurred during bulk delete");
    }
  };

  const handleSingleStatusUpdate = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/users/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        fetchUsersList();
      }
    } catch (err) {
      setFetchError("Network error occurred");
    }
  };

  const handleSingleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        fetchUsersList();
      }
    } catch (err) {
      setFetchError("Network error occurred");
    }
  };

  const handleExportCSV = () => {
    if (selectedUsers.length === 0) return;
    
    // Filter out the selected users from our state
    const usersToExport = usersData.filter(u => selectedUsers.includes(u._id));
    
    // Create CSV Headers
    const headers = ["Name", "Email", "Phone", "Role", "Status", "Date Registered", "Referral ID"];
    
    // Map user data to CSV rows
    const rows = usersToExport.map(user => [
      `"${user.name || ''}"`,
      `"${user.email || ''}"`,
      `"${user.phone || ''}"`,
      `"${user.role || ''}"`,
      `"${!user.isBlocked ? 'active' : 'blocked'}"`,
      `"${new Date(user.createdAt).toLocaleDateString()}"`,
      `"${user.referralId || ''}"`
    ]);
    
    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `asiaze_users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddUser = async () => {
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/users`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name, email, phone, password, role: "user" })
      });

      if (res.ok) {
        setIsAddUserModalOpen(false);
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        const fetchUsers = async () => {
          const res = await fetch(`${apiUrl}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            setUsersData(Array.isArray(data) ? data : data.users || []);
          }
        };
        fetchUsers();
      } else {
        const err = await res.json();
        setError(err.message || "Failed to add user");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    setError(null);
    try {
      const payload: any = { name, email, phone };
      if (password) payload.password = password;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/users/${editingUser._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsEditUserModalOpen(false);
        setEditingUser(null);
        const fetchUsers = async () => {
          const res = await fetch(`${apiUrl}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            setUsersData(Array.isArray(data) ? data : data.users || []);
          }
        };
        fetchUsers();
      } else {
        const err = await res.json();
        setError(err.message || "Failed to update user");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    setPassword("");
    setError(null);
    setIsEditUserModalOpen(true);
  };

  const openViewModal = (user: any) => {
    setViewingUser(user);
    setIsViewUserModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fetchError}
        </div>
      )}
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-black tracking-tight">Manage Users</h2>
        <Button 
          onClick={() => setIsAddUserModalOpen(true)}
          className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6 py-2 h-auto"
        >
          + Add User
        </Button>
        {/* View User Modal */}
      <Dialog open={isViewUserModalOpen} onOpenChange={setIsViewUserModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 bg-white rounded-xl shadow-lg border-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-black">User Details</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Name</p>
                  <p className="text-base text-black font-semibold">{viewingUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-base text-black font-semibold break-all break-words">{viewingUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Phone</p>
                  <p className="text-base text-black font-semibold">{viewingUser.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Referral ID</p>
                  <p className="text-base text-black font-semibold">{viewingUser.referralId || "N/A"}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-lg font-bold text-black mb-3">Rewards & Points</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <p className="text-sm text-[#E0202B] font-medium">Total Points</p>
                    <p className="text-2xl text-[#E0202B] font-bold">{viewingUser.points || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium">Total Redeemed</p>
                    <p className="text-2xl text-gray-900 font-bold">0</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-lg font-bold text-black mb-3">Recent Redeem Records</h4>
                <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                  No redemption records found.
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search by name, email, or phone..." 
            className="w-full bg-white border-gray-200 h-11"
          />
        </div>
        <div className="flex gap-4">
          <Select>
            <SelectTrigger className="w-[160px] bg-white border-gray-200 h-11">
              <SelectValue placeholder="User Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[140px] bg-white border-gray-200 h-11">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow className="hover:bg-transparent border-b border-gray-100">
              <TableHead className="w-[40px] py-4">
                <Checkbox 
                  className="ml-4 border-gray-300" 
                  checked={selectedUsers.length > 0 && selectedUsers.length === usersData.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="font-bold text-black py-4">Name</TableHead>
              <TableHead className="font-bold text-black">Email/Phone</TableHead>
              <TableHead className="font-bold text-black">Role</TableHead>
              <TableHead className="font-bold text-black">Status</TableHead>
              <TableHead className="font-bold text-black">Date Registered</TableHead>
              <TableHead className="font-bold text-black text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : usersData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">No users found.</TableCell>
              </TableRow>
            ) : (
              usersData.map((item) => (
                <TableRow key={item._id} className="border-b border-gray-50">
                  <TableCell className="py-4">
                    <Checkbox 
                      className="ml-4 border-gray-300" 
                      checked={selectedUsers.includes(item._id)}
                      onCheckedChange={() => toggleSelectUser(item._id)}
                    />
                  </TableCell>
                  <TableCell className="text-gray-900 font-medium">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {item.email}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`text-white border-none rounded-full px-3 py-0.5 font-medium ${
                        item.role === 'admin' 
                          ? 'bg-[#E0202B] hover:bg-[#C11B24]' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {item.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`text-white border-none rounded-full px-3 py-0.5 font-medium ${
                        !item.isBlocked
                          ? 'bg-[#22C55E] hover:bg-[#22C55E]/90' 
                          : 'bg-[#9CA3AF] hover:bg-[#9CA3AF]/90'
                      }`}
                    >
                      {!item.isBlocked ? "active" : "blocked"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-900 font-medium">{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex items-center justify-end gap-3 text-gray-700">
                      <Eye 
                        className="w-[18px] h-[18px] cursor-pointer hover:text-black transition-colors" 
                        onClick={() => openViewModal(item)}
                      />
                      <Pencil 
                        className="w-[18px] h-[18px] cursor-pointer hover:text-black transition-colors" 
                        onClick={() => openEditModal(item)}
                      />
                      {item.isBlocked ? (
                         <CheckCircle2 
                           className="w-[18px] h-[18px] cursor-pointer hover:text-green-600 text-gray-700 transition-colors" 
                           onClick={() => handleSingleStatusUpdate(item._id, 'blocked')}
                         />
                      ) : (
                        <Ban 
                          className="w-[18px] h-[18px] cursor-pointer hover:text-red-600 text-gray-700 transition-colors" 
                          onClick={() => handleSingleStatusUpdate(item._id, 'active')}
                        />
                      )}
                      <Trash2 
                        className="w-[18px] h-[18px] cursor-pointer hover:text-red-600 text-[#E0202B] transition-colors" 
                        onClick={() => handleSingleDelete(item._id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-4">
          <Button 
            onClick={() => handleBulkStatusUpdate('blocked')}
            className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6"
          >
            Block Users
          </Button>
          <Button 
            onClick={() => handleBulkStatusUpdate('active')}
            className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6"
          >
            Unblock Users
          </Button>
          <Button 
            onClick={handleBulkDelete}
            className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6"
          >
            Delete Users
          </Button>
          <Button 
            onClick={handleExportCSV}
            className="bg-[#22C55E] hover:bg-[#16a34a] text-white rounded-full font-bold px-6"
          >
            USER EXPORT
          </Button>
        </div>
      )}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-xl shadow-lg border-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-black">Add New User</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-[#E0202B] rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-black font-bold text-sm">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white border-gray-200" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-black font-bold text-sm">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-gray-200" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-black font-bold text-sm">Phone (Optional)</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white border-gray-200" placeholder="+1234567890" />
            </div>
            <div className="space-y-2">
              <label className="text-black font-bold text-sm">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-gray-200" placeholder="••••••••" />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleAddUser} className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6">
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-xl shadow-lg border-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-black">Edit User</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-[#E0202B] rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-black font-bold text-sm">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-black font-bold text-sm">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-black font-bold text-sm">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-black font-bold text-sm">New Password (Optional)</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-gray-200" placeholder="Leave blank to keep current" />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleEditUser} className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
