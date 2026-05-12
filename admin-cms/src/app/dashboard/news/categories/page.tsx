"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/components/TokenProvider";

export default function CategoriesPage() {
  const router = useRouter();
  const token = useToken();
  const [categories, setCategories] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        setError("Unauthorized to fetch categories. Please log in again.");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  const handleAddCategory = async () => {
    setError(null);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name, slug, description, status: "active" })
      });
      
      if (res.status === 401) {
        setError("Unauthorized to add category. Your session may have expired.");
        return;
      }

      if (res.ok) {
        setIsAddModalOpen(false);
        setName("");
        setDescription("");
        fetchCategories();
      } else {
        const err = await res.json();
        setError(err.message || "Failed to add category");
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred.");
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;
    setError(null);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories/${editingCategory._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name, slug, description })
      });
      
      if (res.status === 401) {
        setError("Unauthorized to update category. Your session may have expired.");
        return;
      }

      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        const err = await res.json();
        setError(err.message || "Failed to update category");
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        setError("Unauthorized to delete category.");
        return;
      }
      if (res.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleVisibility = async (cat: any) => {
    const newStatus = cat.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories/${cat._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.status === 401) {
        setError("Unauthorized to toggle visibility.");
        return;
      }
      if (res.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openAddModal = () => {
    setError(null);
    setName("");
    setDescription("");
    setIsAddModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setError(null);
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black tracking-tight">Manage Categories</h2>
        
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          if (open) openAddModal();
          else setIsAddModalOpen(false);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6">
              + Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-xl shadow-lg border-0">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold text-black">Add New Category</DialogTitle>
            </DialogHeader>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-[#E0202B] rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-black font-bold">Category Name</Label>
                <Input
                  id="name"
                  placeholder="Enter category name"
                  className="bg-white border-gray-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-black font-bold">Category Description <span className="text-gray-400 font-normal">(Optional)</span></Label>
                <Input
                  id="description"
                  placeholder="Enter category description"
                  className="bg-white border-gray-200"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6"
                  onClick={handleAddCategory}
                >
                  Add Category
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
            <DialogTitle className="text-xl font-bold text-black">Edit Category</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-[#E0202B] rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          {editingCategory && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-black font-bold">Category Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-black font-bold">Category Description <span className="text-gray-400 font-normal">(Optional)</span></Label>
                <Input
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  className="bg-[#E0202B] hover:bg-[#C11B24] text-white rounded-full font-bold px-6"
                  onClick={handleEditCategory}
                >
                  Save Changes
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
              <TableHead className="font-bold text-black py-4">Category Name</TableHead>
              <TableHead className="font-bold text-black">Category Description</TableHead>
              <TableHead className="font-bold text-black">Status</TableHead>
              <TableHead className="font-bold text-black text-center">Visibility</TableHead>
              <TableHead className="font-bold text-black text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat._id || cat.id}>
                <TableCell className="font-medium text-gray-900 py-4">{cat.name}</TableCell>
                <TableCell className="text-gray-900">{cat.description}</TableCell>
                <TableCell>
                  <Badge 
                    className={`text-white border-none rounded-full px-4 py-1 font-normal ${
                      (cat.status === 'active' || cat.status === 'Active') 
                        ? 'bg-[#22C55E] hover:bg-[#22C55E]/90' 
                        : 'bg-[#9CA3AF] hover:bg-[#9CA3AF]/90'
                    }`}
                  >
                    {cat.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Switch 
                    checked={cat.status === 'active' || cat.status === 'Active'} 
                    onCheckedChange={() => toggleVisibility(cat)}
                    className={(cat.status === 'active' || cat.status === 'Active') ? "data-[state=checked]:bg-[#E0202B]" : ""}
                  />
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-4 text-gray-700">
                    <Pencil 
                      className="w-4 h-4 cursor-pointer hover:text-black transition-colors" 
                      onClick={() => openEditModal(cat)}
                    />
                    <Trash2 
                      className="w-4 h-4 cursor-pointer hover:text-black transition-colors" 
                      onClick={() => handleDelete(cat._id)}
                    />
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