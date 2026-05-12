"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToken } from "@/components/TokenProvider";

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any | null>(null);
  
  const [newTagName, setNewTagName] = useState("");
  const [newTagStatus, setNewTagStatus] = useState("active");
  const [editTagName, setEditTagName] = useState("");
  const [editTagStatus, setEditTagStatus] = useState("active");
  
  const token = useToken();

  const getCookieToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
    return "";
  };

  const fetchTags = async () => {
    try {
      const authToken = token || getCookieToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tags`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (err) {
      console.error("Failed to fetch tags", err);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [token]);

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const authToken = token || getCookieToken();
      const slug = newTagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ name: newTagName, slug, status: newTagStatus })
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewTagName("");
        fetchTags();
      } else {
        alert("Failed to add tag");
      }
    } catch (err) {
      alert("Error adding tag");
    }
  };

  const handleEditTag = async () => {
    if (!editingTag || !editTagName.trim()) return;
    try {
      const authToken = token || getCookieToken();
      const slug = editTagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tags/${editingTag._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ name: editTagName, slug, status: editTagStatus })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingTag(null);
        fetchTags();
      } else {
        alert("Failed to update tag");
      }
    } catch (err) {
      alert("Error updating tag");
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    try {
      const authToken = token || getCookieToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tags/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        fetchTags();
      } else {
        alert("Failed to delete tag");
      }
    } catch (err) {
      alert("Error deleting tag");
    }
  };

  const openEditModal = (tag: any) => {
    setEditingTag(tag);
    setEditTagName(tag.name);
    setEditTagStatus(tag.status || "active");
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black tracking-tight">Manage Tags</h2>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6">
              + Add Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-xl shadow-lg border-0">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold text-black">Add New Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Input
                  id="name"
                  placeholder="Enter tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="outline"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-0 rounded-full font-bold px-6"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6"
                  onClick={handleAddTag}
                >
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-xl shadow-lg border-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-black">Edit Tag</DialogTitle>
          </DialogHeader>
          {editingTag && (
            <div className="space-y-6">
              <div>
                <Input
                  id="edit-name"
                  placeholder="Edit tag name"
                  value={editTagName}
                  onChange={(e) => setEditTagName(e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="outline"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-0 rounded-full font-bold px-6"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6"
                  onClick={handleEditTag}
                >
                  Update
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-black py-4">Tag Name</TableHead>
              <TableHead className="font-bold text-black">Status</TableHead>
              <TableHead className="font-bold text-black">Date Created</TableHead>
              <TableHead className="font-bold text-black text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-gray-500 font-medium">
                  No tags are available.
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => (
                <TableRow key={tag._id}>
                  <TableCell className="font-medium text-gray-900 py-4">{tag.name}</TableCell>
                  <TableCell>
                    <Badge 
                      className={`text-white border-none rounded-full px-4 py-1 font-normal ${
                        tag.status === 'active' 
                          ? 'bg-[#22C55E] hover:bg-[#22C55E]/90' 
                          : 'bg-[#9CA3AF] hover:bg-[#9CA3AF]/90'
                      }`}
                    >
                      {tag.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-900">{new Date(tag.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-4">
                      <Pencil 
                        className="w-4 h-4 cursor-pointer text-[#E0202B] hover:text-[#C11B24] transition-colors" 
                        onClick={() => openEditModal(tag)}
                      />
                      <Trash2 
                        className="w-4 h-4 cursor-pointer text-[#E0202B] hover:text-[#C11B24] transition-colors" 
                        onClick={() => handleDeleteTag(tag._id)}
                      />
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
