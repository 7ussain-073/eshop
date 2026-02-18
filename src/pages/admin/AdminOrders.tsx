import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Check, X } from "lucide-react";

interface BenefitPayOrder {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  benefitpay_ref: string | null;
  payment_proof_url: string;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
}

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "موافق عليه",
  rejected: "مرفوض",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<BenefitPayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<BenefitPayOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل الطلبات",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Sort by pending first, then by date
    const sorted = (data || []).sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setOrders(sorted);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: "approved" | "rejected") => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة الطلب",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "تم التحديث",
      description: `تم تحديث حالة الطلب إلى ${statusLabels[newStatus]}`,
    });

    setIsDialogOpen(false);
    setSelectedOrder(null);
    fetchOrders();
  };

  if (loading) {
    return <div className="text-muted-foreground">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إدارة الطلبات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          عدد الطلبات: {orders.length} ({orders.filter((o) => o.status === "pending").length} قيد الانتظار)
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">لا توجد طلبات بعد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Order Details */}
                  <div>
                    <div className="grid gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">رقم الطلب</p>
                        <p className="font-mono text-sm text-foreground">{order.id}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground">اسم العميل</p>
                        <p className="text-sm text-foreground">{order.full_name}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">الهاتف</p>
                          <p className="text-sm text-foreground">{order.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">البريد</p>
                          <p className="truncate text-sm text-foreground">{order.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">الخطة</p>
                          <p className="text-sm text-foreground">{order.plan_name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">المبلغ</p>
                          <p className="text-sm font-bold gold-text">
                            {formatPrice(order.amount)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground">تاريخ الطلب</p>
                        <p className="text-sm text-foreground">
                          {new Date(order.created_at).toLocaleDateString("ar-SA", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {order.benefitpay_ref && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">رقم BenefitPay</p>
                          <p className="text-sm text-foreground">{order.benefitpay_ref}</p>
                        </div>
                      )}

                      {order.notes && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">ملاحظات</p>
                          <p className="text-sm text-foreground">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">الحالة</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            statusColors[order.status] || ""
                          }`}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDialogOpen(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        عرض الإثبات
                      </Button>

                      {order.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => updateOrderStatus(order.id, "approved")}
                          >
                            <Check className="h-4 w-4" />
                            موافقة
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex items-center gap-2"
                            onClick={() => updateOrderStatus(order.id, "rejected")}
                          >
                            <X className="h-4 w-4" />
                            رفض
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Proof Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إثبات الدفع</DialogTitle>
            <DialogDescription>
              الطلب: {selectedOrder?.id.slice(0, 20)}...
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border overflow-hidden bg-secondary/50">
                <img
                  src={selectedOrder.payment_proof_url}
                  alt="Payment proof"
                  className="w-full object-contain max-h-96"
                />
              </div>

              <div className="grid gap-3 rounded-lg bg-secondary/30 p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">العميل:</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedOrder.full_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">الخطة:</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedOrder.plan_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">المبلغ:</span>
                  <span className="text-sm font-bold gold-text">
                    {formatPrice(selectedOrder.amount)}
                  </span>
                </div>
                {selectedOrder.benefitpay_ref && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">رقم BenefitPay:</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedOrder.benefitpay_ref}
                    </span>
                  </div>
                )}
              </div>

              {selectedOrder.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => updateOrderStatus(selectedOrder.id, "approved")}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    موافقة على الطلب
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => updateOrderStatus(selectedOrder.id, "rejected")}
                  >
                    <X className="h-4 w-4 mr-2" />
                    رفض الطلب
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
