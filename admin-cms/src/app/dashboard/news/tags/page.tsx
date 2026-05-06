"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

const initialTags = [
  {
    id: 1,
    name: "Breaking",
    status: "Active",
    dateCreated: "2023-10-01",
  },
  {
    id: 2,
    name: "Trending",
    status: "Inactive",
    dateCreated: "2023-09-15",
  },
  {
    id: 3,
    name: "Elections",
    status: "Active",
    dateCreated: "2023-08-20",
  },
];

export default function TagsPage() {
  const [tags, setTags] = useState(initialTags);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<typeof initialTags[0] | null>(null);

  const openEditModal = (tag: typeof initialTags[0]) => {
    setEditingTag(tag);
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
                  onClick={() => setIsAddModalOpen(false)}
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
                  defaultValue={editingTag.name}
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
                  onClick={() => setIsEditModalOpen(false)}
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
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium text-gray-900 py-4">{tag.name}</TableCell>
                <TableCell>
                  <Badge 
                    className={`text-white border-none rounded-full px-4 py-1 font-normal ${
                      tag.status === 'Active' 
                        ? 'bg-[#22C55E] hover:bg-[#22C55E]/90' 
                        : 'bg-[#9CA3AF] hover:bg-[#9CA3AF]/90'
                    }`}
                  >
                    {tag.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-900">{tag.dateCreated}</TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-4">
                    <Pencil 
                      className="w-4 h-4 cursor-pointer text-[#E0202B] hover:text-[#C11B24] transition-colors" 
                      onClick={() => openEditModal(tag)}
                    />
                    <Trash2 className="w-4 h-4 cursor-pointer text-[#E0202B] hover:text-[#C11B24] transition-colors" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
