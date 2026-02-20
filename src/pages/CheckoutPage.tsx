import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Upload, Check, Copy, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  benefitpayRef: string;
  paymentProofFile: File | null;
}

type StoreSettingsRow = { account_name: string | null; iban: string | null };

// (اختياري) QR لو تبي لاحقاً
const BENEFITPAY_QR_URL = import.meta.env.VITE_BENEFITPAY_QR_URL as string | undefined;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice, convert, currency } = useCurrency();
  const { items, totalPrice, clearCart } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    phone: "",
    email: "",
    benefitpayRef: "",
    paymentProofFile: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // IBAN from Supabase
  const [paymentInfo, setPaymentInfo] = useState<{ accountName?: string; iban?: string }>({});
  const [loadingPaymentInfo, setLoadingPaymentInfo] = useState(true);

  // لو السلة فاضية رجعه للسلة
  useEffect(() => {
    if (!items || items.length === 0) navigate("/cart");
  }, [items, navigate]);

// Fetch store settings (IBAN)
useEffect(() => {
  let cancelled = false;

  (async () => {
    setLoadingPaymentInfo(true);

    const { data, error } = await supabase
      .from("store_settings" as any)
      .select("account_name, iban")
      .eq("id", 1)
      .maybeSingle(); // ✅ أفضل من single عشان ما يرمي خطأ لو مافي صف

    if (cancelled) return;

    if (error) {
      console.error("Fetch store_settings error:", error);
      setPaymentInfo({ accountName: "", iban: "" });
      setLoadingPaymentInfo(false);
      return;
    }

    // ✅ حل الإشكال: نعامل data كـ any هنا ونقرأ الحقول بأمان
    const row: any = data;

    setPaymentInfo({
      accountName: row?.account_name ?? "",
      iban: row?.iban ?? "",
    });

    setLoadingPaymentInfo(false);
  })();

  return () => {
    cancelled = true;
  };
}, []);

  // ✅ نفس CartPage: subtotal = totalPrice, VAT 15%, total = 1.15
  const subtotalSar = useMemo(() => Number(totalPrice || 0), [totalPrice]);
  const vatSar = useMemo(() => subtotalSar * 0.15, [subtotalSar]);
  const grandTotalSar = useMemo(() => subtotalSar * 1.15, [subtotalSar]);

  // تحويل حسب العملة المختارة
  const grandTotalSelected = useMemo(() => convert(grandTotalSar), [convert, grandTotalSar]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "الاسم الكامل مطلوب";
    if (!formData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    if (!formData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "البريد الإلكتروني غير صالح";
    if (!formData.paymentProofFile) newErrors.paymentProofFile = "تحميل إثبات الدفع مطلوب";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, paymentProofFile: "الملف يجب أن يكون صورة" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, paymentProofFile: "حجم الملف يجب أن يكون أقل من 5MB" }));
      return;
    }

    setFormData((prev) => ({ ...prev, paymentProofFile: file }));
    setErrors((prev) => ({ ...prev, paymentProofFile: "" }));

    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPaymentProof = async (orderId: string, file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${orderId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(fileName, file);
    if (uploadError) throw new Error(`فشل تحميل الملف: ${uploadError.message}`);

    const { data: publicUrl } = supabase.storage.from("payment-proofs").getPublicUrl(fileName);
    return publicUrl.publicUrl;
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "تم النسخ", description: `تم نسخ ${label}` });
    } catch {
      toast({ title: "خطأ", description: "تعذر النسخ، انسخ يدويًا", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!items || items.length === 0) {
      toast({ title: "السلة فارغة", description: "أضف منتجات للسلة أولاً", variant: "destructive" });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = crypto.randomUUID();

      // 1) Upload proof
      const paymentProofUrl = await uploadPaymentProof(orderId, formData.paymentProofFile!);

      // 2) Insert order (BenefitPay) - إجمالي الطلب
      const { error: orderError } = await supabase
        .from("benefitpay_orders" as any)
        .insert({
          id: orderId,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,

          // نخليها وصف عام + (اختياري) أول منتجين
          plan_id: null,
          plan_name:
            items.length === 1
              ? `${items[0].product.name} - ${items[0].variant.duration}`
              : `طلب متعدد المنتجات (${items.length})`,

          // amounts + currency info
          amount: grandTotalSelected,        // بعملة العميل
          amount_sar: grandTotalSar,         // SAR للإدارة
          currency_code: currency.code,
          currency_symbol: currency.symbol,

          benefitpay_ref: formData.benefitpayRef || null,
          payment_proof_url: paymentProofUrl,
          status: "pending",
          notes: null,
        });

      if (orderError) throw orderError;

      // 3) Insert order items
      const itemsPayload = items.map((it: any) => {
        const unitSar = Number(it.variant.salePrice ?? it.variant.price ?? 0) || 0;
        const qty = Number(it.quantity || 1) || 1;
        return {
          order_id: orderId,
          product_id: it.product.id ?? null,
          variant_id: it.variant.id ?? null,
          product_name: it.product.name ?? null,
          variant_duration: it.variant.duration ?? null,
          quantity: qty,
          unit_price_sar: unitSar,
          line_total_sar: unitSar * qty,
        };
      });

      const { error: itemsError } = await supabase
        .from("benefitpay_order_items" as any)
        .insert(itemsPayload);

      if (itemsError) throw itemsError;

      // 4) Email (إجمالي الطلب)
      const emailResponse = await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          orderId,
          planName:
            items.length === 1
              ? `${items[0].product.name} - ${items[0].variant.duration}`
              : `طلب متعدد المنتجات (${items.length})`,
          amount: grandTotalSelected,
          currencyCode: currency.code,
          currencySymbol: currency.symbol,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Email sending failed, but order was created");
      }

      toast({
        title: "تم استقبال طلبك بنجاح",
        description: "سيتم التحقق من الدفع وإرسال التفاصيل قريباً",
      });

      // ✅ فضّي السلة بعد نجاح الطلب
      clearCart();

      setTimeout(() => navigate("/"), 1200);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل إنشاء الطلب",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-foreground">سلة التسوق فارغة</h1>
        <Link to="/cart" className="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> الرجوع للسلة
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-12">
      <div className="container max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">الدفع عبر BenefitPay</h1>
          <p className="mt-2 text-muted-foreground">راجع طلبك ثم أكمل البيانات وارفع إثبات الدفع</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* IBAN + Copy */}
          <Card>
            <CardHeader>
              <CardTitle>بيانات التحويل</CardTitle>
              <CardDescription>حوّل المبلغ ثم ارفع إثبات الدفع</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {loadingPaymentInfo ? (
                <p className="text-sm text-muted-foreground">جاري تحميل بيانات التحويل...</p>
              ) : !paymentInfo.iban ? (
                <p className="text-sm text-destructive">
                  لم يتم إعداد IBAN بعد. أضف IBAN في Supabase داخل جدول store_settings (id=1).
                </p>
              ) : (
                <>
                  {paymentInfo.accountName && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">اسم الحساب: </span>
                      <span className="font-medium text-foreground">{paymentInfo.accountName}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 p-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">IBAN</p>
                      <p className="font-mono text-sm text-foreground break-all">{paymentInfo.iban}</p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => copyText(paymentInfo.iban || "", "رقم الآيبان")}
                      className="shrink-0 flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      نسخ
                    </Button>
                  </div>
                </>
              )}

              {BENEFITPAY_QR_URL && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">QR Code</p>
                  <img
                    src={BENEFITPAY_QR_URL}
                    alt="BenefitPay QR"
                    className="max-w-[220px] rounded-lg border border-border bg-secondary p-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items (from Cart) */}
          <Card>
            <CardHeader>
              <CardTitle>محتويات الطلب</CardTitle>
              <CardDescription>هذه العناصر مأخوذة من سلة التسوق</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((it: any) => {
                const unitSar = Number(it.variant.salePrice ?? it.variant.price ?? 0) || 0;
                return (
                  <div key={it.variant.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{it.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {it.variant.duration} • الكمية: {it.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold gold-text">{formatPrice(unitSar * it.quantity)}</p>
                      <p className="text-[11px] text-muted-foreground">{Number(unitSar).toFixed(2)} ر.س/للوحدة</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card className="bg-secondary/50 border-primary/20">
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-medium text-foreground">{formatPrice(subtotalSar)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الضريبة (15%)</span>
                <span className="font-medium text-foreground">{formatPrice(vatSar)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-bold text-foreground">الإجمالي</span>
                <span className="text-lg font-bold gold-text">{formatPrice(grandTotalSar)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                سيتم حفظ الإجمالي بعملة العميل ({currency.code}) وكذلك بالريال (SAR) للإدارة.
              </p>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>بيانات العميل</CardTitle>
              <CardDescription>أدخل بيانات التواصل الخاصة بك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم الكامل *</Label>
                  <Input
                    id="fullName"
                    placeholder="أحمد محمد"
                    value={formData.fullName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    placeholder="+966501234567"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="benefitPayRef">رقم إحالة BenefitPay (اختياري)</Label>
                  <Input
                    id="benefitPayRef"
                    placeholder="مثال: BP123456789"
                    value={formData.benefitpayRef}
                    onChange={(e) => setFormData((prev) => ({ ...prev, benefitpayRef: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Proof Upload */}
          <Card>
            <CardHeader>
              <CardTitle>إثبات الدفع</CardTitle>
              <CardDescription>حمّل صورة من إثبات الدفع من BenefitPay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentProof">تحميل إثبات الدفع *</Label>

                {!previewUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/50 p-8 cursor-pointer transition-colors hover:border-primary hover:bg-secondary/75"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">انقر لتحميل الصورة أو اسحبها هنا</p>
                    <p className="text-xs text-muted-foreground">(صور فقط، بحد أقصى 5MB)</p>
                  </div>
                ) : (
                  <div className="relative rounded-lg border border-border overflow-hidden bg-secondary/50">
                    <img src={previewUrl} alt="Payment proof preview" className="h-64 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      تغيير الصورة
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  id="paymentProof"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {formData.paymentProofFile && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-100/20 p-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-green-700">{formData.paymentProofFile.name}</p>
                  </div>
                )}

                {errors.paymentProofFile && <p className="text-xs text-red-500">{errors.paymentProofFile}</p>}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              سيتم التحقق من إثبات الدفع يدويًا، وستتلقى تفاصيل الطلب عبر البريد الإلكتروني
            </AlertDescription>
          </Alert>

          <Button type="submit" disabled={isSubmitting} className="w-full gold-gradient h-12 text-base font-bold">
            {isSubmitting ? "جاري معالجة الطلب..." : "تم الدفع / إرسال الطلب"}
          </Button>

          <div className="text-center">
            <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> رجوع للسلة
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}