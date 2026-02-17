import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getLocalHiddenCategories, setLocalHiddenCategories } from "@/lib/utils";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  sort_order?: number;
  hidden?: boolean;
}

export default function AdminSections() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", image_url: "", hidden: false });
  const [hiddenSupported, setHiddenSupported] = useState<boolean | null>(null);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditingName, setInlineEditingName] = useState("");
  const [savingInlineId, setSavingInlineId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);

    // primary attempt: select all columns (admin should be able to read everything)
    const { data, error } = await supabase.from("categories").select("*").order("sort_order");

    // If DB/schema rejects the request because `hidden` column doesn't exist
    // (e.g. schema/migration not applied) — gracefully fallback to a safe
    // column list and mark `hidden` as unsupported so UI doesn't attempt
    // writes/updates against a missing column.
    if (error) {
      const msg = String(error.message || "").toLowerCase();
      if (msg.includes("hidden") || msg.includes("could not find the 'hidden' column") || msg.includes('column "hidden"')) {
        // fallback: select only known-safe columns (exclude `hidden`)
        const { data: fallback, error: fbErr } = await supabase
          .from("categories")
          .select("id, name, slug, image_url, sort_order")
          .order("sort_order");
        if (fbErr) {
          toast({ title: "خطأ عند جلب الأقسام", description: fbErr.message, variant: "destructive" });
          setCategories([]);
          setLoading(false);
          return;
        }
        // annotate fallback rows with any client-side hidden flags so admin sees the
        // local-hidden state and can toggle it (client-only).
        const localHidden = getLocalHiddenCategories();
        setCategories(((fallback || []) as any[]).map((r) => ({ ...r, hidden: localHidden.includes(r.id) })) as CategoryRow[]);
        setHiddenSupported(false);
        setLoading(false);
        return;
      }

      // other errors are real failures
      toast({ title: "خطأ عند جلب الأقسام", description: error.message, variant: "destructive" });
      setCategories([]);
      setLoading(false);
      return;
    }

    setCategories((data || []) as CategoryRow[]);
    // detect whether `hidden` column is present in the fetched rows
    setHiddenSupported(Boolean(data && data.length ? Object.prototype.hasOwnProperty.call((data as any)[0], "hidden") : false));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startEdit = (c: CategoryRow) => {
    setEditingId(c.id);
    setForm({ name: c.name || "", slug: c.slug || "", image_url: c.image_url || "", hidden: !!c.hidden });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) return toast({ title: "الرجاء إدخال الاسم والسلج" });

    // only include `hidden` in payload when the database supports it
    const payload: any = { name: form.name, slug: form.slug, image_url: form.image_url || null };
    if (hiddenSupported) payload.hidden = !!form.hidden;

    if (editingId) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editingId);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "تم تحديث القسم" });
    } else {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "تم إضافة القسم" });
    }

    setForm({ name: "", slug: "", image_url: "", hidden: false });
    setShowForm(false);
    setEditingId(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return;
    }
    // clear editing if we deleted the currently editing category
    if (editingId === id) {
      setEditingId(null);
      setShowForm(false);
      setForm({ name: "", slug: "", image_url: "", hidden: false });
    }
    toast({ title: "تم حذف القسم" });
    fetchData();
  };

  if (loading) return <div className="text-muted-foreground">جاري التحميل...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">إدارة الأقسام</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              // quick rename helper for existing categories
              const { error: e1 } = await supabase.from("categories").update({ name: "شاهد VIP" }).eq("slug", "vip");
              const { error: e2 } = await supabase.from("categories").update({ name: "TOD", slug: "TOD" }).eq("slug", "TOD");
              if (e1 || e2) {
                toast({ title: "خطأ عند تطبيق التغييرات السريعة", description: (e1 || e2)?.message, variant: "destructive" });
              } else {
                toast({ title: "تم تطبيق التحديثات على الأقسام" });
                fetchData();
              }
            }}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            تطبيق تحديث الأسماء (VIP → شاهد VIP, TOD → TOD)
          </button>

          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", slug: "", image_url: "", hidden: false }); }} className="gold-gradient flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-primary-foreground">
            <Plus className="h-4 w-4" /> إضافة قسم
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">اسم القسم</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">slug (رابط)</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">رابط صورة (اختياري)</label>
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">اخفاء القسم</label>
            <div className="flex items-center gap-2">
              <input id="hidden-checkbox" type="checkbox" checked={form.hidden} onChange={(e) => setForm({ ...form, hidden: e.target.checked })} className="h-4 w-4 rounded border border-border bg-secondary" />
              <label htmlFor="hidden-checkbox" className="text-sm text-muted-foreground">{form.hidden ? 'مخفي' : 'مرئي'}</label>
            </div>
            {hiddenSupported === false ? (
              <div className="mt-2 text-xs text-muted-foreground">ملاحظة: لأن حقل <code>hidden</code> غير موجود في قاعدة البيانات، هذا التغيير سيؤثر على الواجهة محليًا فقط ولن يُحفظ بعد إعادة التحميل.</div>
            ) : null}
          </div>

          <div className="flex gap-2">
            <button type="submit" className="gold-gradient rounded-lg px-6 py-2 text-sm font-bold text-primary-foreground">{editingId ? 'تحديث' : 'إضافة'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: "", slug: "", image_url: "", hidden: false }); }} className="rounded-lg border border-border px-6 py-2 text-sm text-muted-foreground hover:bg-secondary">إلغاء</button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">الاسم</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">slug</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {c.image_url && <img src={c.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                    <div>
                      <div className="flex items-center gap-2">
                        {inlineEditingId === c.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={inlineEditingName}
                              onChange={(e) => setInlineEditingName(e.target.value)}
                              className="rounded-lg border border-border bg-secondary px-2 py-1 text-sm text-foreground"
                            />
                            <button
                              onClick={async () => {
                                if (!inlineEditingId) return;
                                if (!inlineEditingName.trim()) return toast({ title: 'أدخل اسمًا صالحًا' });
                                setSavingInlineId(inlineEditingId);
                                try {
                                  const { error } = await supabase.from('categories').update({ name: inlineEditingName.trim() }).eq('id', inlineEditingId);
                                  if (error) throw error;
                                  setCategories((prev) => prev.map((cat) => (cat.id === inlineEditingId ? { ...cat, name: inlineEditingName.trim() } : cat)));
                                  toast({ title: 'تم تحديث اسم القسم' });
                                  setInlineEditingId(null);
                                  setInlineEditingName('');
                                } catch (err: any) {
                                  toast({ title: 'خطأ عند حفظ الاسم', description: String(err.message || err), variant: 'destructive' });
                                } finally {
                                  setSavingInlineId(null);
                                }
                              }}
                              disabled={savingInlineId === c.id}
                              className="rounded-lg px-2 py-1 text-sm border border-border text-primary/80 bg-primary/5 hover:bg-primary/10 disabled:opacity-50"
                            >
                              {savingInlineId === c.id ? 'جاري...' : <Check className="h-4 w-4" />}
                            </button>
                            <button onClick={() => { setInlineEditingId(null); setInlineEditingName(''); }} className="rounded-lg px-2 py-1 text-sm border border-border text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-foreground">{c.name}</div>
                            {c.hidden ? (
                              <span className="rounded-full bg-yellow-100 text-yellow-700 px-2 py-0.5 text-xs">{hiddenSupported ? 'مخفي' : 'مخفي (محلي)'}</span>
                            ) : null}
                            <button onClick={() => { setInlineEditingId(c.id); setInlineEditingName(c.name || ''); }} className="ml-2 rounded-md p-1 text-muted-foreground hover:bg-secondary"><Edit className="h-4 w-4" /></button>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{c.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{c.slug}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <button
                      onClick={async () => {
                        if (updatingIds.includes(c.id)) return;

                        // client-only toggle when DB doesn't support `hidden`
                        if (!hiddenSupported) {
                          const newHidden = !Boolean(c.hidden);
                          setCategories((prev) => prev.map((cat) => (cat.id === c.id ? { ...cat, hidden: newHidden } : cat)));

                          // persist client-only hidden state so storefront UI (useCategories)
                          // will filter this category out immediately for this browser.
                          const ids = getLocalHiddenCategories();
                          const next = newHidden ? Array.from(new Set([...ids, c.id])) : ids.filter((id) => id !== c.id);
                          setLocalHiddenCategories(next);

                          toast({ title: newHidden ? 'تم إخفاء القسم محليًا' : 'تم إظهار القسم محليًا' });
                          return;
                        }

                        // DB-backed optimistic update (existing flow)
                        const originalHidden = !!c.hidden;
                        const newHidden = !originalHidden;

                        setCategories((prev) => prev.map((cat) => (cat.id === c.id ? { ...cat, hidden: newHidden } : cat)));
                        setUpdatingIds((prev) => [...prev, c.id]);

                        try {
                          const { error } = await supabase.from("categories").update({ hidden: newHidden } as any).eq("id", c.id);
                          if (error) {
                            setCategories((prev) => prev.map((cat) => (cat.id === c.id ? { ...cat, hidden: originalHidden } : cat)));
                            toast({ title: "خطأ", description: error.message, variant: "destructive" });
                          } else {
                            toast({ title: newHidden ? 'تم إخفاء القسم' : 'تم إظهار القسم' });
                          }
                        } catch (err: any) {
                          setCategories((prev) => prev.map((cat) => (cat.id === c.id ? { ...cat, hidden: originalHidden } : cat)));
                          toast({ title: "خطأ عند التعديل", description: String(err), variant: "destructive" });
                        } finally {
                          setUpdatingIds((prev) => prev.filter((id) => id !== c.id));
                        }
                      }}
                      disabled={updatingIds.includes(c.id)}
                      className="rounded-lg px-2 py-1 text-sm border border-border text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingIds.includes(c.id) ? 'جاري…' : (c.hidden ? 'إظهار' : 'إخفاء')}
                    </button>

                    <button onClick={() => startEdit(c)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">لا توجد أقسام</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
