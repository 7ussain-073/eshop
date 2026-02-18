import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { products } from "@/data/products";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Upload, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  planId: string;
  benefitpayRef: string;
  paymentProofFile: File | null;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    phone: "",
    email: "",
    planId: "",
    benefitpayRef: "",
    paymentProofFile: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Find selected plan details
  const selectedPlan = products.find((p) => p.id === formData.planId);
  const selectedVariant = selectedPlan?.variants[0]; // Use first variant for display
  const planPrice = selectedVariant?.salePrice || selectedVariant?.price || 0;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "الاسم الكامل مطلوب";
    if (!formData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    if (!formData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "البريد الإلكتروني غير صالح";
    if (!formData.planId) newErrors.planId = "اختر خطة";
    if (!formData.paymentProofFile) newErrors.paymentProofFile = "تحميل إثبات الدفع مطلوب";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, paymentProofFile: "الملف يجب أن يكون صورة" }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          paymentProofFile: "حجم الملف يجب أن يكون أقل من 5MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, paymentProofFile: file }));
      setErrors((prev) => ({ ...prev, paymentProofFile: "" }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPaymentProof = async (orderId: string, file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${orderId}-${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from("payment-proofs")
      .upload(fileName, file);

    if (uploadError) throw new Error(`فشل تحميل الملف: ${uploadError.message}`);

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from("payment-proofs")
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
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

    setIsSubmitting(true);

    try {
      // Generate order ID first
      const tempId = crypto.randomUUID();

      // Upload payment proof
      const paymentProofUrl = await uploadPaymentProof(tempId,formData.paymentProofFile!);

      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from("benefitpay_orders" as any)
        .insert({
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          plan_id: formData.planId,
          plan_name: selectedPlan?.name || formData.planId,
          amount: planPrice,
          benefitpay_ref: formData.benefitpayRef || null,
          payment_proof_url: paymentProofUrl,
          status: "pending",
          notes: null,
        })
        .select()
        .single();

      if (!order) throw new Error("Order was not returned from Supabase");
      const realOrderId = (order as any).id;

      // Send confirmation email via API route
      const emailResponse = await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          orderId: realOrderId,
          planName: selectedPlan?.name,
          amount: planPrice,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Email sending failed, but order was created");
      }

      // Show success message
      toast({
        title: "تم استقبال طلبك بنجاح",
        description: "سيتم التحقق من الدفع وإرسال تفاصيل الاشتراك قريباً",
      });

      // Redirect to success page or home
      setTimeout(() => {
        navigate("/");
      }, 2000);
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
          <p className="mt-2 text-muted-foreground">
            أكمل بيانات طلبك وحمّل إثبات الدفع
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    placeholder="+966501234567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <Card>
            <CardHeader>
              <CardTitle>اختر الخطة</CardTitle>
              <CardDescription>اختر الاشتراك الذي تريده</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="plan">الخطة *</Label>
                <Select value={formData.planId} onValueChange={(value) => setFormData((prev) => ({ ...prev, planId: value }))}>
                  <SelectTrigger id="plan" className={errors.planId ? "border-red-500" : ""}>
                    <SelectValue placeholder="اختر خطة" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.planId && <p className="mt-1 text-xs text-red-500">{errors.planId}</p>}
              </div>

              {selectedPlan && selectedVariant && (
                <div className="rounded-lg border border-border bg-secondary/50 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedPlan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        مدة: {selectedVariant.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold gold-text">
                        {formatPrice(planPrice)}
                      </p>
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, benefitpayRef: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Proof Upload */}
          <Card>
            <CardHeader>
              <CardTitle>إثبات الدفع</CardTitle>
              <CardDescription>
                حمّل صورة من إثبات الدفع من BenefitPay
              </CardDescription>
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
                    <p className="text-sm font-medium text-foreground">
                      انقر لتحميل الصورة أو اسحبها هنا
                    </p>
                    <p className="text-xs text-muted-foreground">
                      (صور فقط، بحد أقصى 5MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-lg border border-border overflow-hidden bg-secondary/50">
                    <img
                      src={previewUrl}
                      alt="Payment proof preview"
                      className="h-64 w-full object-cover"
                    />
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
                    <p className="text-xs text-green-700">
                      {formData.paymentProofFile.name}
                    </p>
                  </div>
                )}

                {errors.paymentProofFile && (
                  <p className="text-xs text-red-500">{errors.paymentProofFile}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {selectedVariant && (
            <Card className="bg-secondary/50 border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الخطة:</span>
                    <span className="font-medium text-foreground">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المدة:</span>
                    <span className="font-medium text-foreground">
                      {selectedVariant.duration}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-medium text-foreground">الإجمالي:</span>
                    <span className="text-lg font-bold gold-text">
                      {formatPrice(planPrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              سيتم التحقق من إثبات الدفع يدويًا، وستتلقى تفاصيل الاشتراك عبر البريد الإلكتروني
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gold-gradient h-12 text-base font-bold"
          >
            {isSubmitting ? "جاري معالجة الطلب..." : "تم الدفع / إرسال الطلب"}
          </Button>
        </form>
      </div>
    </div>
  );
}
