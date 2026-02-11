import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useProductById, useCategories } from "@/hooks/use-products";
import type { ProductVariant } from "@/hooks/use-products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart, ShoppingCart, Shield, Zap, Clock, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProductById(id || "");
  const { data: categories = [] } = useCategories();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants.find((v) => v.inStock) || product.variants[0] || null);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-foreground">المنتج غير موجود</h1>
        <Link to="/" className="mt-4 text-primary hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const inWishlist = isInWishlist(product.id);
  const discount = selectedVariant?.salePrice
    ? Math.round(((selectedVariant.price - selectedVariant.salePrice) / selectedVariant.price) * 100)
    : 0;

  return (
    <div className="min-h-screen py-6">
      <div className="container">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <span>/</span>
          {category && (
            <>
              <Link to={`/category/${category.slug}`} className="hover:text-primary">{category.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative overflow-hidden rounded-2xl border border-border">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover aspect-square" />
            {product.badge && (
              <span className="gold-gradient absolute top-4 right-4 rounded-lg px-3 py-1 text-sm font-bold text-primary-foreground">{product.badge}</span>
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 rounded-lg bg-destructive px-3 py-1 text-sm font-bold text-destructive-foreground">-{discount}%</span>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <span className="mb-2 inline-block rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">رقمي • تفعيل فوري</span>
            <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">{product.name}</h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground">اختر المدة:</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={!variant.inStock}
                    className={`rounded-xl border px-4 py-3 text-sm transition-all ${
                      selectedVariant?.id === variant.id
                        ? "border-primary bg-primary/10 text-primary gold-border-glow"
                        : variant.inStock
                        ? "border-border bg-card text-foreground hover:border-primary/50"
                        : "cursor-not-allowed border-border bg-secondary/50 text-muted-foreground opacity-50"
                    }`}
                  >
                    <div className="font-semibold">{variant.duration}</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      {variant.salePrice ? (
                        <>
                          <span className="text-primary font-bold">{variant.salePrice} ر.س</span>
                          <span className="text-xs text-muted-foreground line-through">{variant.price}</span>
                        </>
                      ) : (
                        <span className="font-bold">{variant.price} ر.س</span>
                      )}
                    </div>
                    {!variant.inStock && <div className="mt-1 text-[10px] text-destructive">نفذ</div>}
                  </button>
                ))}
              </div>
            </div>

            {selectedVariant && (
              <div className="mt-6 rounded-xl border border-border bg-card p-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">{selectedVariant.salePrice || selectedVariant.price} ر.س</span>
                  {selectedVariant.salePrice && (
                    <span className="text-lg text-muted-foreground line-through">{selectedVariant.price} ر.س</span>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { if (selectedVariant?.inStock) addItem(product, selectedVariant); }}
                disabled={!selectedVariant?.inStock}
                className="gold-gradient flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-5 w-5" />
                أضف للسلة
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all ${
                  inWishlist ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: Zap, label: "تفعيل فوري" },
                { icon: Shield, label: "ضمان كامل المدة" },
                { icon: Clock, label: "دعم 24/7" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-3 text-center">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground">المميزات:</h3>
              <ul className="space-y-2">
                {["تفعيل فوري بعد الدفع", "ضمان كامل مدة الاشتراك", "دعم فني على مدار الساعة", "إمكانية التجديد بسعر مخفض"].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
