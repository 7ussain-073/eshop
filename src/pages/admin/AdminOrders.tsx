import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  status: string;
  total: number;
  payment_status: string;
  customer_email: string | null;
  customer_phone: string | null;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  pending: "معلق",
  paid: "مدفوع",
  processing: "قيد التنفيذ",
  delivered: "تم التسليم",
  completed: "مكتمل",
  refunded: "مسترد",
  cancelled: "ملغي",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  refunded: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "تم تحديث حالة الطلب" });
    fetchOrders();
  };

  if (loading) return <div className="text-muted-foreground">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">إدارة الطلبات</h1>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">رقم الطلب</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">العميل</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">المبلغ</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">الحالة</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">التاريخ</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-foreground">{o.id.slice(0, 8)}...</td>
                <td className="px-4 py-3 text-muted-foreground">{o.customer_email || o.customer_phone || "—"}</td>
                <td className="px-4 py-3 font-medium text-foreground">{Number(o.total).toFixed(2)} ر.س</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[o.status] || ""}`}>
                    {statusLabels[o.status] || o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString("ar-SA")}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="rounded-lg border border-border bg-secondary px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">لا توجد طلبات بعد</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
