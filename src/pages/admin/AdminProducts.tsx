import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DBProduct {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: string;
  category_id: string | null;
  created_at: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", image_url: "", status: "published", category_id: "" });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || null,
      image_url: form.image_url || null,
      status: form.status,
      category_id: form.category_id || null,
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
      toast({ title: "تم تحديث المنتج" });
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
      toast({ title: "تم إضافة المنتج" });
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", description: "", image_url: "", status: "published", category_id: "" });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "تم حذف المنتج" });
    fetchData();
  };

  const startEdit = (p: DBProduct) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description || "", image_url: p.image_url || "", status: p.status, category_id: p.category_id || "" });
    setShowForm(true);
  };

  if (loading) return <div className="text-muted-foreground">جاري التحميل...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">إدارة المنتجات</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", description: "", image_url: "", status: "published", category_id: "" }); }}
          className="gold-gradient flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> إضافة منتج
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">اسم المنتج</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">القسم</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                <option value="">بدون قسم</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">رابط الصورة</label>
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">الحالة</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">الوصف</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="gold-gradient rounded-lg px-6 py-2 text-sm font-bold text-primary-foreground">
              {editingId ? "تحديث" : "إضافة"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
              className="rounded-lg border border-border px-6 py-2 text-sm text-muted-foreground hover:bg-secondary">
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">المنتج</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">الحالة</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url && <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                    <span className="font-medium text-foreground">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                    {p.status === "published" ? "منشور" : "مسودة"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(p)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">لا توجد منتجات بعد</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
