"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { productService } from "@/services";
import { formatPrice } from "@/utils";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import type { Product, Category } from "@/types";
import { useForm } from "react-hook-form";

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const { data } = useQuery({ queryKey: ["admin-products", search], queryFn: () => productService.list({ search, per_page: 50 }) });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: productService.getCategories });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<any>();

  const openCreate = () => { setEditing(null); reset({}); setShowForm(true); };
  const openEdit = (p: Product) => { setEditing(p); reset({ ...p, category_id: p.category_id ?? "" }); setShowForm(true); };

  const onSubmit = async (data: any) => {
    try {
      const payload = { ...data, price: Number(data.price), compare_price: data.compare_price ? Number(data.compare_price) : undefined, stock_quantity: Number(data.stock_quantity), image_urls: data.image_urls ? [data.image_urls] : [], tags: data.tags ? data.tags.split(",").map((t: string) => t.trim()) : [] };
      if (editing) { await productService.update(editing.id, payload); toast.success("Product updated!"); }
      else { await productService.create(payload); toast.success("Product created!"); }
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setShowForm(false);
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await productService.delete(id); toast.success("Deleted!"); qc.invalidateQueries({ queryKey: ["admin-products"] }); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black" style={{ fontFamily: "var(--font-syne)" }}>Products</h1>
        <Button onClick={openCreate} size="sm"><Plus className="w-3.5 h-3.5" /> Add Product</Button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgba(240,239,248,0.35)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
            className="w-full bg-[#16161f] border border-[rgba(255,255,255,0.08)] rounded-lg pl-9 pr-3 py-2 text-xs text-[#f0eff8] placeholder:text-[rgba(240,239,248,0.3)] outline-none focus:border-[#6C63FF]/50" />
        </div>
        <span className="text-xs text-[rgba(240,239,248,0.35)]">{data?.total ?? 0} products</span>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#16161f] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-sm">{editing ? "Edit Product" : "New Product"}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <Input label="Name" {...register("name", { required: true })} />
              <Input label="Slug" {...register("slug", { required: true })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Price (₹)" type="number" step="0.01" {...register("price", { required: true })} />
                <Input label="Compare Price (₹)" type="number" step="0.01" {...register("compare_price")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Stock Qty" type="number" {...register("stock_quantity")} />
                <Input label="SKU" {...register("sku")} />
              </div>
              <div>
                <label className="text-xs font-medium text-[rgba(240,239,248,0.6)] uppercase tracking-wide block mb-1.5">Category</label>
                <select {...register("category_id")} className="w-full bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 text-sm text-[#f0eff8] outline-none focus:border-[#6C63FF]/50">
                  <option value="">No category</option>
                  {categories?.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <Input label="Thumbnail URL" {...register("thumbnail_url")} />
              <Input label="Image URL" {...register("image_urls")} />
              <Input label="Tags (comma separated)" {...register("tags")} />
              <div>
                <label className="text-xs font-medium text-[rgba(240,239,248,0.6)] uppercase tracking-wide block mb-1.5">Description</label>
                <textarea {...register("short_description")} rows={2} placeholder="Short description" className="w-full bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 text-sm text-[#f0eff8] outline-none focus:border-[#6C63FF]/50 resize-none" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" {...register("is_active")} className="accent-[#6C63FF]" /> Active</label>
                <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" {...register("is_featured")} className="accent-[#6C63FF]" /> Featured</label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" isLoading={isSubmitting} className="flex-1">{editing ? "Update" : "Create"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#16161f] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.07)] text-[rgba(240,239,248,0.4)] uppercase tracking-wide">
              <th className="text-left px-5 py-3">Product</th>
              <th className="text-left px-5 py-3">Price</th>
              <th className="text-left px-5 py-3">Stock</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
            {data?.items.map((p) => (
              <tr key={p.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="px-5 py-3 font-medium max-w-xs">
                  <p className="truncate">{p.name}</p>
                  <p className="text-[rgba(240,239,248,0.3)] text-[10px]">{p.slug}</p>
                </td>
                <td className="px-5 py-3">{formatPrice(p.price)}</td>
                <td className="px-5 py-3">
                  <span className={`font-medium ${p.stock_quantity === 0 ? "text-red-400" : p.stock_quantity < 10 ? "text-amber-400" : "text-green-400"}`}>{p.stock_quantity}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${p.is_active ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>{p.is_active ? "Active" : "Inactive"}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-[rgba(255,255,255,0.06)] text-[rgba(240,239,248,0.5)] hover:text-[#9d97ff] transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded hover:bg-red-500/10 text-[rgba(240,239,248,0.5)] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
