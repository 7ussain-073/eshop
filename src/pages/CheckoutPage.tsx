import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Upload, Check, Copy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DBVariant {
  id: string;
  product_id: string;
  duration: string;
  price: number; // SAR
  sale_price: number | null; // SAR
  stock_status: "in_stock" | "out_of_stock" | string;
}

interface DBProduct {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: "published" | "draft" | string;
  product_variants: DBVariant[];
}

interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  productId: string;
  variantId: string;
  benefitpayRef: string;
  paymentProofFile: File | null;
}

// QR optional (نخليه مثل ما هو)
const BENEFITPAY_QR_URL = import.meta.env.VITE_BENEFITPAY_QR_URL as string | undefined;

// ✅ Type for store_settings row
type StoreSettingsRow = { account_name: string | null; iban: string | null };

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice, convert, currency } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    phone: "",
    email: "",
    productId: "",
    variantId: "",
    benefitpayRef: "",
    paymentProofFile: null,
  });

  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // IBAN from Supabase
  const [paymentInfo, setPaymentInfo] = useState<{ accountName: string; iban: string }>({
    accountName: "",
    iban: "",
  });
  const [loadingPaymentInfo, setLoadingPaymentInfo] = useState(true);

  // ✅ Fetch store settings (IBAN)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingPaymentInfo(true);

      const { data, error } = await supabase
        .from("store_settings" as any)
        .select("account_name, iban")
        .eq("id", 1)
        .single();

      if (cancelled) return;

      if (error || !data) {
        setPaymentInfo({ accountName: "", iban: "" });
        setLoadingPaymentInfo(false);
        return;
      }

      // ✅ Fix TS: cast through unknown first
      const row = (data as unknown) as StoreSettingsRow;

      setPaymentInfo({
        accountName: row.account_name ?? "",
        iban: row.iban ?? "",
      });

      setLoadingPaymentInfo(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch products + variants from Supabase
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingProducts(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, description, image_url, status, product_variants(id, product_id, duration, price, sale_price, stock_status)"
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Fetch products error:", error);
        toast({
          title: "خطأ",
          description: "فشل تحميل المنتجات",
          variant: "destructive",
        });
        setProducts([]);
        setLoadingProducts(false);
        return;
      }

      const rows = (data || []) as any[];
      const mapped: DBProduct[] = rows.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description ?? null,
        image_url: p.image_url ?? null,
        status: p.status,
        product_variants: (p.product_variants || []).slice().sort((a: DBVariant, b: DBVariant) => {
          const ai = a.stock_status === "in_stock" ? 0 : 1;
          const bi = b.stock_status === "in_stock" ? 0 : 1;
          if (ai !== bi) return ai - bi;
          return String(a.duration || "").localeCompare(String(b.duration || ""), "ar", { sensitivity: "base" });
        }),
      }));

      setProducts(mapped);
      setLoadingProducts(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === formData.productId),
    [products, formData.productId]
  );

  const selectedVariant = useMemo(
    () => selectedProduct?.product_variants?.find((v) => v.id === formData.variantId),
    [selectedProduct, formData.variantId]
  );

  // السعر الأساسي دائماً SAR من DB
  const priceSar = useMemo(() => {
    if (!selectedVariant) return 0;
    const base = selectedVariant.sale_price ?? selectedVariant.price ?? 0;
    return Number(base) || 0;
  }, [selectedVariant]);

  // تحويل حسب عملة الموقع المختارة
  const amountInSelectedCurrency = useMemo(() => convert(priceSar), [convert, priceSar]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "الاسم الكامل مطلوب";
    if (!formData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    if (!formData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "البريد الإلكتروني غير صالح";

    if (!formData.productId) newErrors.productId = "اختر المنتج";
    if (!formData.variantId) newErrors.variantId = "اختر المدة/السعر";
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

    if (!validateForm()) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProduct || !selectedVariant) {
      toast({
        title: "خطأ",
        description: "المنتج/المدة غير صحيحة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = crypto.randomUUID();

      // 1) Upload proof
      const paymentProofUrl = await uploadPaymentProof(orderId, formData.paymentProofFile!);

      // 2) Amounts
      const amount_sar = priceSar; // SAR دائماً من DB
      const amount = amountInSelectedCurrency; // عملة العميل

      // 3) Insert order (BenefitPay)
      const { error: orderError } = await supabase
        .from("benefitpay_orders" as any)
        .insert({
          id: orderId,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,

          plan_id: selectedProduct.id,
          plan_name: `${selectedProduct.name} - ${selectedVariant.duration}`,

          amount,
          amount_sar,
          currency_code: currency.code,
          currency_symbol: currency.symbol,

          benefitpay_ref: formData.benefitpayRef || null,
          payment_proof_url: paymentProofUrl,
          status: "pending",
          notes: null,
        });

      if (orderError) throw orderError;

      // 4) Send email
      const emailResponse = await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          orderId,
          planName: `${selectedProduct.name} - ${selectedVariant.duration}`,
          amount,
          currencyCode: currency.code,
          currencySymbol: currency.symbol,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Email sending failed, but order was created");
      }

      toast({
        title: "تم استقبال طلبك بنجاح",
        description: "سيتم التحقق من الدفع وإرسال تفاصيل الاشتراك قريباً",
      });

      setTimeout(() => navigate("/"), 1500);
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

  return (
    <div className="min-h-screen py-6 md:py-12">
      <div className="container max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">الدفع عبر BenefitPay</h1>
          <p className="mt-2 text-muted-foreground">أكمل بيانات طلبك وحمّل إثبات الدفع</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* IBAN + Copy + Optional QR */}
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
                  {/* إذا ما تبي اسم الحساب نهائيًا احذف هذا البلوك */}
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
                      onClick={() => copyText(paymentInfo.iban, "رقم الآيبان")}
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
              </div>
            </CardContent>
          </Card>

          {/* Product + Variant Selection */}
          <Card>
            <CardHeader>
              <CardTitle>اختر الخطة</CardTitle>
              <CardDescription>اختر المنتج ثم المدة/السعر</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>المنتج *</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, productId: value, variantId: "" }));
                    setErrors((prev) => ({ ...prev, productId: "", variantId: "" }));
                  }}
                >
                  <SelectTrigger className={errors.productId ? "border-red-500" : ""}>
                    <SelectValue placeholder={loadingProducts ? "جاري التحميل..." : "اختر المنتج"} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && <p className="mt-1 text-xs text-red-500">{errors.productId}</p>}
              </div>

              <div>
                <Label>المدة / السعر *</Label>
                <Select
                  value={formData.variantId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, variantId: value }));
                    setErrors((prev) => ({ ...prev, variantId: "" }));
                  }}
                  disabled={!selectedProduct}
                >
                  <SelectTrigger className={errors.variantId ? "border-red-500" : ""}>
                    <SelectValue placeholder={selectedProduct ? "اختر المدة" : "اختر المنتج أولاً"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedProduct?.product_variants || []).map((v) => {
                      const vPriceSar = Number(v.sale_price ?? v.price ?? 0) || 0;
                      const label = `${v.duration} — ${formatPrice(vPriceSar)}${v.stock_status !== "in_stock" ? " (نفذ)" : ""}`;
                      return (
                        <SelectItem key={v.id} value={v.id} disabled={v.stock_status !== "in_stock"}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.variantId && <p className="mt-1 text-xs text-red-500">{errors.variantId}</p>}
              </div>

              {selectedProduct && selectedVariant && (
                <div className="rounded-lg border border-border bg-secondary/50 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedProduct.name}</p>
                      <p className="text-xs text-muted-foreground">مدة: {selectedVariant.duration}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        السعر الأساسي: {Number(priceSar).toFixed(2)} ر.س
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold gold-text">{formatPrice(priceSar)}</p>
                      <p className="text-xs text-muted-foreground">({currency.code})</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* BenefitPay Reference */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات الدفع</CardTitle>
              <CardDescription>أدخل رقم الإحالة (اختياري)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="benefitPayRef">رقم إحالة BenefitPay (اختياري)</Label>
                <Input
                  id="benefitPayRef"
                  placeholder="مثال: BP123456789"
                  value={formData.benefitpayRef}
                  onChange={(e) => setFormData((prev) => ({ ...prev, benefitpayRef: e.target.value }))}
                />
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

          {/* Summary */}
          {selectedProduct && selectedVariant && (
            <Card className="bg-secondary/50 border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الخطة:</span>
                    <span className="font-medium text-foreground">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المدة:</span>
                    <span className="font-medium text-foreground">{selectedVariant.duration}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-medium text-foreground">الإجمالي:</span>
                    <span className="text-lg font-bold gold-text">{formatPrice(priceSar)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    سيتم حفظ الطلب بعملة العميل ({currency.code}) وكذلك بالريال (SAR) للإدارة.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>سيتم التحقق من إثبات الدفع يدويًا، وستتلقى تفاصيل الاشتراك عبر البريد الإلكتروني</AlertDescription>
          </Alert>

          <Button type="submit" disabled={isSubmitting} className="w-full gold-gradient h-12 text-base font-bold">
            {isSubmitting ? "جاري معالجة الطلب..." : "تم الدفع / إرسال الطلب"}
          </Button>
        </form>
      </div>
    </div>
  );
}